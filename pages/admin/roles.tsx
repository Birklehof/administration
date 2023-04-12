import { useEffect, useState } from "react";
import Head from "@/components/Head";
import Loading from "@/components/Loading";
import useAuth from "@/lib/hooks/useAuth";
import AdminMenu from "@/components/AdminMenu";
import Icon from "@/components/Icon";
import useStudents from "@/lib/hooks/useStudents";
import Link from "next/link";
import { Student } from "@/lib/interfaces/student";
import useRemoteConfig from "@/lib/hooks/useRemoteConfig";
import useStaff from "@/lib/hooks/useStaff";
import useApps from "@/lib/hooks/useApps";
import Role from "@/lib/interfaces/role";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface StudentOrStaff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  class?: string;
  house?: string;
}

function validateEmail(email: string) {
  var re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  return re.test(email);
}

export default function AdminStudents() {
  const { isLoggedIn, user } = useAuth();
  const { roles } = useApps();
  const [activeTab, setActiveTab] = useState("");
  const [newRoleEmail, setNewRoleEmail] = useState("");
  const [newRoleRole, setNewRoleRole] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  if (!user || !roles) {
    return <Loading />;
  }

  async function addEmail() {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    await setDoc(doc(db, "apps", activeTab, "roles", newRoleEmail), {
      role: newRoleRole,
    })
      .then(() => {
        setNewRoleEmail("");
        setNewRoleRole("");
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  async function deletePermission(email: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    await deleteDoc(doc(db, "apps", activeTab, "roles", email)).finally(() => {
      setSubmitting(false);
    });
  }

  return (
    <>
      <Head title="Assistent" />
      <main className="flex bg-base-200 justify-center h-screen items-center">
        <div className="hidden lg:flex">
          <AdminMenu />
        </div>
        <div className="flex gap-3 flex-col h-screen justify-center items-center lg:items-start w-full lg:w-[42rem]">
          <div className="searchbox">
            <div className="inputElementsContainer overflow-x-scroll">
              <button className="btn btn-circle btn-ghost btn-sm lg:hidden">
                <Link href={"/admin"}>
                  <Icon name="HomeIcon" />
                </Link>
              </button>
              <div className="tabs bg-base-100">
                {Object.keys(roles).map((app) => (
                  <a
                    key={app}
                    className={
                      activeTab === app
                        ? "tab tab-md tab-active bg-primary rounded-full text-white font-semibold"
                        : "tab tab-md"
                    }
                    onClick={() => {
                      setNewRoleEmail("");
                      setNewRoleRole("");
                      setActiveTab(app);
                    }}
                  >
                    {app.charAt(0).toUpperCase() + app.slice(1)}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="verticalList !pt-20 !gap-2">
            {roles[activeTab]?.map((role: Role) => (
              <div
                key={role.email}
                className="alert shadow rounded-full bg-base-100 flex flex-row justify-between"
              >
                <div className="whitespace-nowrap overflow-hidden">
                  <span className="overflow-hidden text-ellipsis font-bold">
                    {role.email}
                  </span>
                </div>
                <div className="whitespace-nowrap overflow-hidden">
                  <span className="overflow-hidden text-ellipsis">
                    {role.role}
                  </span>
                </div>
                <div>
                  <button
                    className="btn btn-ghost btn-circle btn-sm text-warning mt-0"
                    aria-label="Berechtigung bearbeiten"
                    onClick={() => {
                      setNewRoleEmail(role.email);
                      setNewRoleRole(role.role);
                    }}
                  >
                    <Icon name="PencilIcon" />
                  </button>
                  <button
                    className="btn btn-ghost btn-circle btn-sm text-error mt-0"
                    onClick={async () => await deletePermission(role.email)}
                    aria-label="Berechtigung löschen"
                  >
                    <Icon name="TrashIcon" />
                  </button>
                </div>
              </div>
            ))}
            {activeTab !== "" && (
              <>
                <div className="divider">
                  Berechtigungen hinzufügen oder bearbeiten
                </div>
                <div className="menu menu-horizontal bg-base-100 p-2 rounded-full z-40 w-full">
                  <div className="inputElementsContainer">
                    <input
                      value={newRoleEmail}
                      onChange={(e) => setNewRoleEmail(e.target.value)}
                      type="text"
                      placeholder="E-Mail Adresse"
                      className="font-bold"
                    />
                    <select
                      className="select select-bordered rounded-full select-sm"
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
                      className="btn btn-ghost btn-circle btn-sm text-success"
                      aria-label="Berechtigung hinzufügen"
                      onClick={async () => await addEmail()}
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
            {activeTab === "" && (
              <div className="w-full text-sm text-center">
                Wähle eine App aus, um ihre Berechtigungen zu verwalten.
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
