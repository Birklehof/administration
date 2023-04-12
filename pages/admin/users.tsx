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

interface StudentOrStaff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  class?: string;
  house?: string;
}

export default function AdminUsers() {
  const { isLoggedIn, user } = useAuth();
  const { students } = useStudents();
  const { staff } = useStaff();
  const users = [...students, ...staff] as StudentOrStaff[];
  const { classes, houses } = useRemoteConfig();

  const [filterClasses, setFilterClasses] = useState("");
  const [filterHouse, setFilterHouse] = useState("");
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  if (!user || !users) {
    return <Loading />;
  }

  function filter(user: StudentOrStaff): boolean {
    if (filterClasses || filterHouse) {
      if ("class" in user && "house" in user) {
        const student = user as Student;
        if (filterClasses && student.class !== filterClasses) {
          return false;
        }
        if (filterHouse && student.house !== filterHouse) {
          return false;
        }
      } else {
        return false || (filterHouse == "Extern (Kollegium)" && !filterClasses);
      }
    }

    return (
      !filterName || (user.firstName + " " + user.lastName).includes(filterName)
    );
  }

  async function deleteUserHandler(user_id: string) {
    alert("Not implemented yet.");
  }

  return (
    <>
      <Head title="Nutzerverwaltung" />
      <main className="flex bg-base-200 justify-center h-screen items-center">
        <div className="hidden lg:flex">
          <AdminMenu />
        </div>
        <div className="flex gap-3 flex-col h-screen justify-center items-center lg:items-start w-full lg:w-[42rem]">
          <div className="searchbox">
            <div className="inputElementsContainer">
              <button className="btn btn-circle btn-ghost btn-sm lg:hidden">
                <Link href={"/admin"}>
                  <Icon name="HomeIcon" />
                </Link>
              </button>
              <input
                type="text"
                placeholder="Suchen..."
                onChange={(e) => setFilterName(e.target.value)}
              />
              <div className="dropdown dropdown-bottom dropdown-end">
                <label
                  tabIndex={0}
                  className="btn btn-circle btn-ghost btn-sm"
                  aria-label="Filtern"
                >
                  <Icon name="AdjustmentsIcon" />
                </label>
                <div
                  tabIndex={0}
                  className="dropdown-content menu p-3 shadow bg-base-100 rounded-box flex flex-col gap-3"
                >
                  <select
                    className="select select-bordered select-sm grow"
                    onChange={(e) => setFilterClasses(e.target.value)}
                    value={filterClasses}
                  >
                    <option value={""}>Alle Klassen</option>
                    {classes.map((_class) => (
                      <option key={_class}>{_class}</option>
                    ))}
                  </select>

                  <select
                    className="select select-bordered select-sm grow"
                    onChange={(e) => setFilterHouse(e.target.value)}
                    value={filterHouse}
                  >
                    <option value={""}>Alle Häuser</option>
                    {houses.map((house) => (
                      <option key={house}>{house}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="verticalList !pt-20 !gap-2">
            {users
              .filter((user) => {
                return filter(user);
              })
              .map((user) => {
                return (
                  <div
                    key={user.id}
                    className="alert shadow py-1 rounded-full bg-base-100 flex flex-row justify-between"
                  >
                    <div className="whitespace-nowrap overflow-hidden">
                      <span className="overflow-hidden text-ellipsis font-bold">
                        {user.firstName} {user.lastName} {user.class}{" "}
                        {user.house}
                      </span>
                    </div>
                    <div className="whitespace-nowrap overflow-hidden">
                      <span className="overflow-hidden text-ellipsis">
                        {user.email}
                      </span>
                    </div>
                    <button
                      className="btn btn-ghost btn-circle btn-sm text-error"
                      aria-label="Nutzer löschen"
                      onClick={() => deleteUserHandler(user.id)}
                    >
                      <Icon name="TrashIcon" />
                    </button>
                  </div>
                );
              })}
            <div className="w-full text-sm text-center">
              Keine weiteren Nutzer
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
