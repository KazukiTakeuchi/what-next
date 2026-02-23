-- ルーム管理テーブル
create table rooms (
  code text primary key,
  host_id text not null,
  host_nickname text not null,
  guest_id text,
  guest_nickname text,
  status text not null default 'waiting',
  game_state jsonb,
  created_at timestamptz default now()
);

-- RLS: 全操作許可（anonキー使用、カジュアルゲーム用途）
alter table rooms enable row level security;

create policy "Allow all operations" on rooms
  for all
  using (true)
  with check (true);
