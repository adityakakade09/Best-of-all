import { User } from '@bestofall/shared';
import { query } from '../db/pool';

interface UserRow {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

const toUser = (row: UserRow): User => ({
  id: row.id,
  phone: row.phone,
  name: row.name,
  email: row.email ?? undefined,
  avatarUrl: row.avatar_url ?? undefined,
  role: row.role,
  createdAt: row.created_at,
});

export async function findUserByPhone(phone: string): Promise<User | null> {
  const { rows } = await query<UserRow>('SELECT * FROM users WHERE phone = $1', [phone]);
  return rows[0] ? toUser(rows[0]) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const { rows } = await query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] ? toUser(rows[0]) : null;
}

export async function createUser(phone: string, name: string): Promise<User> {
  const { rows } = await query<UserRow>(
    `INSERT INTO users (phone, name) VALUES ($1, $2) RETURNING *`,
    [phone, name]
  );
  return toUser(rows[0]);
}

export async function updateUserProfile(
  id: string,
  updates: { name?: string; email?: string; avatarUrl?: string }
): Promise<User> {
  const { rows } = await query<UserRow>(
    `UPDATE users SET
       name = COALESCE($2, name),
       email = COALESCE($3, email),
       avatar_url = COALESCE($4, avatar_url)
     WHERE id = $1
     RETURNING *`,
    [id, updates.name ?? null, updates.email ?? null, updates.avatarUrl ?? null]
  );
  return toUser(rows[0]);
}
