import { useEffect, useState } from "react";
import Head from "@/components/Head";
import Loading from "@/components/Loading";
import useAuth from "@/lib/hooks/useAuth";
import Icon from "@/components/Icon";
import Link from "next/link";
import { Staff, Student } from "@/lib/interfaces";
import useRemoteConfig from "@/lib/hooks/useRemoteConfig";
import useCollectionAsList from "@/lib/hooks/useCollectionAsList";

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
  const [students, studentsLoading, studentsError] =
    useCollectionAsList<Student>("students");
  const [staff, staffLoading, staffError] = useCollectionAsList<Staff>("staff");
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

  if (!user || staffLoading || studentsLoading) {
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
      <main className="main">
        <div className="searchbox">
          <div className="input-elements-container">
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
        <div className="vertical-list !pt-20 !gap-2">
          {users
            .filter((user) => {
              return filter(user);
            })
            .map((user) => {
              return (
                <div key={user.id} className="list-item">
                  <span className="whitespace-nowrap overflow-hidden pr-1">
                    <span className="overflow-hidden text-ellipsis font-semibold">
                      {user.firstName} {user.lastName} {user.class} {user.house}
                    </span>
                  </span>
                  <span className="whitespace-nowrap overflow-hidden">
                    <span className="overflow-hidden text-ellipsis">
                      {user.email}
                    </span>
                  </span>
                  <div className="spacer" />
                  <button
                    className="btn btn-outline btn-error btn-square btn-sm"
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
      </main>
    </>
  );
}
