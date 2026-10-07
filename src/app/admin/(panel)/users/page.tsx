import type { Metadata } from 'next';
import { createUser, resetUserPassword, updateUser } from '@/app/actions/admin';
import { AdminForm } from '@/components/admin/admin-form';
import { Field, PageHead, Panel } from '@/components/admin/ui';
import { PASSWORD_MIN_LENGTH, ROLE_LABELS, USER_ROLES } from '@/lib/admin/constants';
import { adminDates } from '@/lib/admin/format';
import { requireSession } from '@/lib/auth/session';
import { siteConfig } from '@/lib/config';
import { userRepository } from '@/lib/db/repositories/user.repository';

export const metadata: Metadata = { title: 'Users' };

function RoleSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <select className="c-input" name="role" defaultValue={defaultValue ?? 'staff'}>
      {USER_ROLES.map((role) => (
        <option key={role} value={role}>
          {ROLE_LABELS[role]}
        </option>
      ))}
    </select>
  );
}

export default async function AdminUsersPage() {
  const session = await requireSession('owner');
  const users = await userRepository.list();
  const format = adminDates(siteConfig.locale.timezone);
  const passwordHint = `At least ${PASSWORD_MIN_LENGTH} characters.`;

  return (
    <>
      <PageHead title="Users" intro="Owners manage users and settings. Staff work with leads." />

      <div className="c-admin-stack">
        {users.map((user) => (
          <Panel key={user.id} className="c-admin-user-card">
            <header>
              <div>
                <h2>
                  {user.name}
                  {user.id === session.userId && ' (you)'}
                </h2>
                <p className="c-admin-muted">
                  {user.email} ·{' '}
                  {user.lastLoginAt ? `Last signed in ${format.dateTime(user.lastLoginAt)}` : 'Never signed in'}
                </p>
              </div>
              {!user.active && (
                <span className="c-admin-status" data-status="lost">
                  Deactivated
                </span>
              )}
            </header>
            <div className="c-admin-columns">
              <AdminForm action={updateUser} submitLabel="Save">
                <input type="hidden" name="id" value={user.id} />
                <Field label="Name">
                  <input className="c-input" name="name" defaultValue={user.name} required maxLength={100} />
                </Field>
                <Field label="Role">
                  <RoleSelect defaultValue={user.role} />
                </Field>
                <label className="c-admin-check">
                  <input type="checkbox" name="active" defaultChecked={user.active} />
                  <span>Can sign in</span>
                </label>
              </AdminForm>
              <AdminForm action={resetUserPassword} submitLabel="Set new password" resetOnSuccess quiet>
                <input type="hidden" name="id" value={user.id} />
                <Field label="New password" hint={`${passwordHint} Signs this user out everywhere.`}>
                  <input className="c-input" type="password" name="password" autoComplete="new-password" required />
                </Field>
              </AdminForm>
            </div>
          </Panel>
        ))}

        <Panel title="Add a user">
          <AdminForm action={createUser} submitLabel="Add user" resetOnSuccess className="c-admin-form-grid">
            <Field label="Name">
              <input className="c-input" name="name" required maxLength={100} />
            </Field>
            <Field label="Email">
              <input className="c-input" type="email" name="email" autoComplete="off" required />
            </Field>
            <Field label="Role">
              <RoleSelect />
            </Field>
            <Field label="Password" hint={`${passwordHint} Share it privately; they can change it after signing in.`}>
              <input className="c-input" type="password" name="password" autoComplete="new-password" required />
            </Field>
          </AdminForm>
        </Panel>
      </div>
    </>
  );
}
