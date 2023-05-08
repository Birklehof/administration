import { useEffect, useState } from "react";
import Head from "@/components/Head";
import Loading from "@/components/Loading";
import useAuth from "@/lib/hooks/useAuth";
import Icon from "@/components/Icon";
import { Staff, Student } from "@/lib/interfaces";
import useRemoteConfig from "@/lib/hooks/useRemoteConfig";
import useCollectionAsList from "@/lib/hooks/useCollectionAsList";
import ListItem from "@/components/ListItem";
import { themedPromiseToast } from "@/lib/utils";
import { deleteUser } from "@/lib/firebaseUtils";

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

  const [filterName, setFilterName] = useState("");

  const [filterType, setFilterType] = useState("");
  const [filterClasses, setFilterClasses] = useState("");
  const [filterHouse, setFilterHouse] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  if (!user || staffLoading || studentsLoading) {
    return <Loading />;
  }

  function filter(user: StudentOrStaff): boolean {
    if (filterType) {
      if (filterType === "student" && !user.email.endsWith("@s.birklehof.de")) {
        return false;
      }
      if (filterType === "staff" && !user.email.endsWith("@birklehof.de")) {
        return false;
      }
      if (
        filterType === "other" &&
        (user.email.endsWith("@birklehof.de") ||
          user.email.endsWith("@s.birklehof.de"))
      ) {
        return false;
      }
    }

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

  return (
    <>
      <Head title="Nutzerverwaltung" />
      <main className="main">
        <div className="searchbox">
          <div className="input-elements-container">
            <input
              type="text"
              placeholder="Suchen ..."
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
                  onChange={(e) => setFilterType(e.target.value)}
                  value={filterType}
                >
                  <option value={""}>Alle Typen</option>
                  <option value={"student"}>Schüler</option>
                  <option value={"staff"}>Lehrer</option>
                  <option value={"other"}>Sonstige</option>
                </select>
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
                <ListItem
                  key={user.id}
                  mainContent={user.firstName + " " + user.lastName}
                  secondaryContent={user.email}
                  badges={
                    user.class && user.house ? [user.class, user.house] : []
                  }
                >
                  <button
                    className="btn btn-outline btn-error btn-square btn-sm"
                    onClick={async () =>
                      await themedPromiseToast(
                        deleteUser(user.id, user.email),
                        {
                          pending: "Lösche Nutzer ...",
                          success: "Nutzer gelöscht",
                          error: "Nutzer konnte nicht gelöscht werden",
                        }
                      )
                    }
                    aria-label="Nutzer löschen"
                  >
                    <Icon name="TrashIcon" />
                  </button>
                </ListItem>
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
