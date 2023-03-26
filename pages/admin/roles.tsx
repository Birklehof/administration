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

interface StudentOrStaff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  class?: string;
  house?: string;
}

export default function AdminStudents() {
  const { isLoggedIn, user } = useAuth();
  const { roles } = useApps();

  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  if (!user || !roles) {
    return <Loading />;
  }

  async function deleteUserHandler(user_id: string) {
    alert("Not implemented yet.");
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
                    className={
                      activeTab === app
                        ? "tab tab-md tab-active bg-primary rounded-full text-white font-semibold"
                        : "tab tab-md"
                    }
                    onClick={() => setActiveTab(app)}
                  >
                    {app}
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
                <button
                  className="btn btn-ghost btn-circle btn-sm text-error mt-0"
                  aria-details="Runde löschen"
                >
                  <Icon name="TrashIcon" />
                </button>
              </div>
            ))}
            {activeTab !== "" && (
              <>
                <div className="divider">Neue Rolle hinzufügen</div>
                <div className="menu menu-horizontal bg-base-100 p-2 rounded-full z-40 w-full">
                  <div className="inputElementsContainer">
                    <input
                      type="text"
                      placeholder="Suchen..."
                      className="font-bold"
                    />
                    <select className="select select-bordered rounded-full select-sm">
                      <option disabled selected>
                        Rolle
                      </option>
                      <option value="admin">Admin</option>
                      <option value="assistant">Assistent</option>
                    </select>
                    <button
                      className="btn btn-ghost btn-circle btn-sm text-success"
                      aria-details="Runde löschen"
                    >
                      <Icon name="UserAddIcon" />
                    </button>
                  </div>
                </div>
              </>
            )}
            {activeTab === "" && (
              <div className="w-full text-sm text-center">
                Wähle eine App aus, um die Rollen zu verwalten.
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
