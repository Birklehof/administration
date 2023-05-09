import { useEffect, useState } from 'react';
import Head from '@/components/Head';
import Loading from '@/components/Loading';
import useAuth from '@/lib/hooks/useAuth';
import Icon from '@/components/Icon';
import useApps from '@/lib/hooks/useApps';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { validateEmail } from '@/lib/utils';
import { Role } from '@/lib/interfaces';
import ListItem from '@/components/ListItem';

export default function AdminRoles() {
  const { isLoggedIn, user } = useAuth();
  const { roles } = useApps();
  const [activeTab, setActiveTab] = useState('');
  const [newRoleEmail, setNewRoleEmail] = useState('');
  const [newRoleRole, setNewRoleRole] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  if (!user || !roles) {
    return <Loading />;
  }

  async function setRole() {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    await setDoc(doc(db, 'apps', activeTab, 'roles', newRoleEmail), {
      role: newRoleRole,
    })
      .then(() => {
        setNewRoleEmail('');
        setNewRoleRole('');
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  async function deleteRole(email: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    await deleteDoc(doc(db, 'apps', activeTab, 'roles', email)).finally(() => {
      setSubmitting(false);
    });
  }

  return (
    <>
      <Head title="Rollenverwaltung" />
      <main className="main">
        <div className="searchbox">
          <div className="input-elements-container overflow-x-scroll">
            <div className="tabs bg-base-100">
              {Object.keys(roles).map((app) => (
                <a
                  key={app}
                  className={
                    activeTab === app
                      ? 'tab tab-active tab-md rounded-full bg-primary font-semibold text-white'
                      : 'tab tab-md'
                  }
                  onClick={() => {
                    setNewRoleEmail('');
                    setNewRoleRole('');
                    setActiveTab(app);
                  }}
                >
                  {app.charAt(0).toUpperCase() + app.slice(1)}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="vertical-list !gap-2 !pt-20">
          {roles[activeTab]?.map((role: Role) => (
            <ListItem
              key={role.email}
              mainContent={role.email}
              secondaryContent={role.role}
            >
              <button
                className="btn-outline btn-warning btn-square btn-sm btn mr-1"
                aria-label="Berechtigung bearbeiten"
                onClick={() => {
                  setNewRoleEmail(role.email);
                  setNewRoleRole(role.role);
                }}
              >
                <Icon name="PencilIcon" />
              </button>
              <button
                className="btn-outline btn-error btn-square btn-sm btn"
                onClick={async () => await deleteRole(role.email)}
                aria-label="Berechtigung löschen"
              >
                <Icon name="TrashIcon" />
              </button>
            </ListItem>
          ))}
          {activeTab !== '' && (
            <>
              <div className="divider mx-auto w-full max-w-xl">
                Berechtigungen hinzufügen oder bearbeiten
              </div>
              <div className="menu menu-horizontal w-full max-w-xl rounded-full bg-base-100 p-2">
                <div className="input-elements-container">
                  <input
                    value={newRoleEmail}
                    onChange={(e) => setNewRoleEmail(e.target.value)}
                    type="text"
                    placeholder="E-Mail Adresse"
                    className="font-bold"
                  />
                  <select
                    className="select-bordered select select-sm rounded-full"
                    value={newRoleRole}
                    onChange={(e) => setNewRoleRole(e.target.value)}
                    aria-label="Rolle"
                  >
                    <option disabled value="">
                      Rolle
                    </option>
                    <option value="admin">Admin</option>
                    <option value="assistant">Assistent</option>
                  </select>
                  <button
                    className="btn-ghost btn-sm btn-circle btn text-success"
                    aria-label="Berechtigung hinzufügen"
                    onClick={async () => await setRole()}
                    disabled={
                      submitting ||
                      !newRoleEmail ||
                      !newRoleRole ||
                      !validateEmail(newRoleEmail)
                    }
                  >
                    {roles[activeTab]?.find(
                      (role: Role) => role.email === newRoleEmail
                    ) ? (
                      <Icon
                        name="PencilIcon"
                        aria-label="Berechtigung hinzugefügt"
                      />
                    ) : (
                      <Icon name="UserAddIcon" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
          {activeTab === '' && (
            <div className="w-full text-center text-sm">
              Wähle eine App aus, um ihre Berechtigungen zu verwalten.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
