-- Recomeço: esquema do banco no Supabase.
-- Cole tudo no SQL Editor do projeto e clique em Run.

-- Estado de cada pessoa, guardado como um documento só.
create table if not exists public.estados (
  user_id uuid primary key references auth.users (id) on delete cascade,
  dados jsonb not null,
  atualizado timestamptz not null default now()
);

-- Vínculo entre quem está em recuperação e um familiar.
create table if not exists public.vinculos (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  apostador_id uuid not null references auth.users (id) on delete cascade,
  familiar_id uuid references auth.users (id) on delete set null,
  resumo jsonb not null default '{}'::jsonb,
  criado timestamptz not null default now()
);

create index if not exists vinculos_apostador on public.vinculos (apostador_id);
create index if not exists vinculos_familiar on public.vinculos (familiar_id);

-- Mensagens de apoio dentro de um vínculo.
create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  vinculo_id uuid not null references public.vinculos (id) on delete cascade,
  autor_id uuid not null references auth.users (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 500),
  criado timestamptz not null default now()
);

create index if not exists mensagens_vinculo on public.mensagens (vinculo_id, criado);

alter table public.estados enable row level security;
alter table public.vinculos enable row level security;
alter table public.mensagens enable row level security;

-- Cada pessoa só vê e altera o próprio estado.
drop policy if exists "estado proprio" on public.estados;
create policy "estado proprio" on public.estados
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Vínculo: as duas pontas podem ler.
drop policy if exists "ver vinculo" on public.vinculos;
create policy "ver vinculo" on public.vinculos
  for select to authenticated
  using ((select auth.uid()) in (apostador_id, familiar_id));

-- Só quem está em recuperação cria o convite e atualiza o resumo.
drop policy if exists "criar vinculo" on public.vinculos;
create policy "criar vinculo" on public.vinculos
  for insert to authenticated
  with check ((select auth.uid()) = apostador_id);

drop policy if exists "atualizar vinculo" on public.vinculos;
create policy "atualizar vinculo" on public.vinculos
  for update to authenticated
  using ((select auth.uid()) = apostador_id)
  with check ((select auth.uid()) = apostador_id);

-- As duas pontas podem encerrar o vínculo.
drop policy if exists "encerrar vinculo" on public.vinculos;
create policy "encerrar vinculo" on public.vinculos
  for delete to authenticated
  using ((select auth.uid()) in (apostador_id, familiar_id));

-- Mensagens: só quem participa do vínculo lê e escreve.
drop policy if exists "ler mensagens" on public.mensagens;
create policy "ler mensagens" on public.mensagens
  for select to authenticated
  using (exists (
    select 1 from public.vinculos v
    where v.id = vinculo_id and (select auth.uid()) in (v.apostador_id, v.familiar_id)
  ));

drop policy if exists "escrever mensagens" on public.mensagens;
create policy "escrever mensagens" on public.mensagens
  for insert to authenticated
  with check (
    autor_id = (select auth.uid()) and exists (
      select 1 from public.vinculos v
      where v.id = vinculo_id and (select auth.uid()) in (v.apostador_id, v.familiar_id)
    )
  );

-- O familiar entra no vínculo pelo código, sem conseguir ver outros convites.
create or replace function public.aceitar_convite (p_codigo text)
returns public.vinculos
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.vinculos;
begin
  if auth.uid() is null then
    raise exception 'Entre na sua conta primeiro.';
  end if;

  update public.vinculos
     set familiar_id = auth.uid()
   where codigo = upper(trim(p_codigo))
     and familiar_id is null
     and apostador_id <> auth.uid()
  returning * into v;

  if v.id is null then
    raise exception 'Código não encontrado ou já usado.';
  end if;

  return v;
end;
$$;

revoke all on function public.aceitar_convite (text) from public, anon;
grant execute on function public.aceitar_convite (text) to authenticated;

-- Lembretes diários (notificações push)
create table if not exists public.lembretes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  inscricao jsonb not null,
  horario text not null default '20:00',
  ativo boolean not null default true,
  atualizado timestamptz not null default now()
);
alter table public.lembretes enable row level security;
drop policy if exists "lembretes do proprio usuario" on public.lembretes;
create policy "lembretes do proprio usuario" on public.lembretes
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- O envio automático roda no servidor da Vercel sem a chave de serviço:
-- ele chama as funções abaixo com uma senha guardada num esquema privado.
create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;
create table if not exists privado.config (chave text primary key, valor text not null);
-- Rode uma vez, trocando pelo valor de CRON_SECRET da Vercel:
-- insert into privado.config values ('cron_secret', 'SUA_SENHA') on conflict (chave) do update set valor = excluded.valor;

create or replace function public.lembretes_pendentes (p_segredo text)
returns table (user_id uuid, inscricao jsonb, dados jsonb)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_segredo is null or p_segredo <> (select valor from privado.config where chave = 'cron_secret') then
    raise exception 'não autorizado';
  end if;
  return query
    select l.user_id, l.inscricao, e.dados
      from public.lembretes l
      join public.estados e on e.user_id = l.user_id
     where l.ativo;
end;
$$;

create or replace function public.desativar_lembrete (p_segredo text, p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_segredo is null or p_segredo <> (select valor from privado.config where chave = 'cron_secret') then
    raise exception 'não autorizado';
  end if;
  update public.lembretes set ativo = false where user_id = p_user;
end;
$$;

revoke all on function public.lembretes_pendentes (text) from public, authenticated;
revoke all on function public.desativar_lembrete (text, uuid) from public, authenticated;
grant execute on function public.lembretes_pendentes (text) to anon;
grant execute on function public.desativar_lembrete (text, uuid) to anon;

-- Trilha da dupla: missões feitas por quem aposta e quem apoia juntos.
create table if not exists public.dupla (
  vinculo_id uuid not null references public.vinculos (id) on delete cascade,
  missao_id text not null,
  proposto_por uuid not null references auth.users (id) on delete cascade,
  aceito_em timestamptz,
  feito_apostador timestamptz,
  feito_familiar timestamptz,
  criado timestamptz not null default now(),
  primary key (vinculo_id, missao_id)
);
create index if not exists dupla_proposto_por on public.dupla (proposto_por);
alter table public.dupla enable row level security;

drop policy if exists "dupla ler" on public.dupla;
create policy "dupla ler" on public.dupla for select to authenticated
  using (exists (select 1 from public.vinculos v where v.id = vinculo_id and (select auth.uid()) in (v.apostador_id, v.familiar_id)));
drop policy if exists "dupla propor" on public.dupla;
create policy "dupla propor" on public.dupla for insert to authenticated
  with check (proposto_por = (select auth.uid()) and exists (
    select 1 from public.vinculos v where v.id = vinculo_id and v.familiar_id is not null and (select auth.uid()) in (v.apostador_id, v.familiar_id)));
drop policy if exists "dupla atualizar" on public.dupla;
create policy "dupla atualizar" on public.dupla for update to authenticated
  using (exists (select 1 from public.vinculos v where v.id = vinculo_id and (select auth.uid()) in (v.apostador_id, v.familiar_id)))
  with check (exists (select 1 from public.vinculos v where v.id = vinculo_id and (select auth.uid()) in (v.apostador_id, v.familiar_id)));
drop policy if exists "dupla recusar" on public.dupla;
create policy "dupla recusar" on public.dupla for delete to authenticated
  using (aceito_em is null and exists (select 1 from public.vinculos v where v.id = vinculo_id and (select auth.uid()) in (v.apostador_id, v.familiar_id)));

-- Cada pessoa só confirma a própria parte, e quem propôs não aceita o próprio convite.
create or replace function public.dupla_guardar_partes()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v public.vinculos;
begin
  select * into v from public.vinculos where id = new.vinculo_id;
  if new.feito_apostador is distinct from old.feito_apostador and auth.uid() <> v.apostador_id then
    raise exception 'Só quem aposta confirma a própria parte.';
  end if;
  if new.feito_familiar is distinct from old.feito_familiar and auth.uid() is distinct from v.familiar_id then
    raise exception 'Só quem apoia confirma a própria parte.';
  end if;
  if new.aceito_em is distinct from old.aceito_em and auth.uid() = old.proposto_por then
    raise exception 'Quem propôs espera a outra pessoa aceitar.';
  end if;
  if new.proposto_por <> old.proposto_por or new.missao_id <> old.missao_id or new.vinculo_id <> old.vinculo_id then
    raise exception 'Não dá para mudar a missão.';
  end if;
  return new;
end; $$;
revoke all on function public.dupla_guardar_partes() from public, anon, authenticated;
drop trigger if exists dupla_guardar_partes on public.dupla;
create trigger dupla_guardar_partes before update on public.dupla
  for each row execute function public.dupla_guardar_partes();

-- Atualização ao vivo nos dois aparelhos
alter publication supabase_realtime add table public.dupla;
