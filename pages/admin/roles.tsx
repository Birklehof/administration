import { useEffect, useState } from 'react';
import Head from '@/components/Head';
import Loading from '@/components/Loading';
import useAuth from '@/lib/hooks/useAuth';
import Icon from '@/components/Icon';
import useApps from '@/lib/hooks/useApps';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { themedPromiseToast, validateEmail } from '@/lib/utils';
import { Role } from '@/lib/interfaces';
import ListItem from '@/components/ListItem';
import SearchBar from '@/components/SearchBar';

export default function AdminRoles() {
  const { isLoggedIn, user } = useAuth();
  const { roles } = useApps();

  const [filterName, setFilterName] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [newRoleEmail, setNewRoleEmail] = useState('');
  const [newRoleRole, setNewRoleRole] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!submitting) {
      setNewRoleEmail('');
      setNewRoleRole('');
    }
  }, [activeTab]);

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
        <SearchBar
          searchValue={filterName}
          setSearchValue={setFilterName}
          filters={[
            {
              filerValue: activeTab,
              setFilterValue: setActiveTab,
              filterOptions: [{ value: '', label: 'Keine App' }].concat(
                Object.keys(roles).map((app) => ({
                  value: app,
                  label: app.charAt(0).toUpperCase() + app.slice(1),
                }))
              ),
            },
          ]}
        />
        <div className="vertical-list">
          {roles[activeTab]?.map((role: Role) => (
            <ListItem
              key={role.email}
              mainContent={role.email}
              badges={[role.role.charAt(0).toUpperCase() + role.role.slice(1)]}
            >
              <button
                className="btn-outline btn-warning btn-square btn-sm btn"
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
                onClick={async () =>
                  await themedPromiseToast(deleteRole(role.email), {
                    pending: 'Berechtigung wird gelöscht ...',
                    success: 'Berechtigung gelöscht.',
                    error: 'Berechtigung konnte nicht gelöscht werden.',
                  })
                }
                aria-label="Berechtigung löschen"
              >
                <Icon name="TrashIcon" />
              </button>
            </ListItem>
          ))}
          {activeTab !== '' && (
            <>
              <div className="divider max-w-xl mx-auto w-full">Berechtigungen bearbeiten</div>
              <div className="centered-card mb-10">
                <div className="card-body">
                  <input
                    value={newRoleEmail}
                    onChange={(e) => setNewRoleEmail(e.target.value)}
                    type="text"
                    placeholder="E-Mail Adresse"
                    className="input-bordered input"
                  />
                  <select
                    className="select-bordered select"
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
                    className={`btn-info btn ${
                      submitting ? 'loading' : ''
                    }`}
                    aria-label="Berechtigung hinzufügen"
                    onClick={async () =>
                      await themedPromiseToast(setRole(), {
                        pending: 'Berechtigung wird gespeichert ...',
                        success: 'Berechtigung gespeichert.',
                        error: 'Berechtigung konnte nicht gespeichert werden.',
                      })
                    }
                    disabled={
                      submitting ||
                      !newRoleEmail ||
                      !newRoleRole ||
                      !validateEmail(newRoleEmail)
                    }
                  >
                    {roles[activeTab]?.find(
                      (role: Role) => role.email === newRoleEmail
                    )
                      ? 'Rolle bearbeiten'
                      : 'Rolle hinzufügen'}
                  </button>
                </div>
              </div>
            </>
          )}
          {activeTab === '' && (
            <div className="text-center text-sm">
              Wählen Sie eine App aus, um ihre Berechtigungen zu verwalten.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
