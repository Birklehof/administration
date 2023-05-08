import Loading from "@/components/Loading";
import useAuth from "@/lib/hooks/useAuth";
import Head from "@/components/Head";
import { useEffect, useState } from "react";
import useCollectionAsList from "@/lib/hooks/useCollectionAsList";
import { Runner } from "@/lib/interfaces";
import Icon from "@/components/Icon";
import { useRouter } from "next/router";
import useRemoteConfig from "@/lib/hooks/useRemoteConfig";
import Link from "next/link";
import ListItem from "@/components/ListItem";

export default function Admin24StundenLauf() {
  const router = useRouter();
  const [runners, runnersLoading, runnersError] = useCollectionAsList<Runner>(
    "/apps/24-stunden-lauf/archive/" + router.query.archiveId + "/runners"
  );
  const { isLoggedIn, user } = useAuth();
  const { classes, houses } = useRemoteConfig();

  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterClasses, setFilterClasses] = useState("");
  const [filterHouse, setFilterHouse] = useState("");

  function filter(runner: Runner): boolean {
    if (filterType) {
      if (filterType === "student" && runner.type !== "student") {
        return false;
      }
      if (filterType === "staff" && runner.type !== "staff") {
        return false;
      }
      if (
        filterType === "other" &&
        (runner.type === "student" || runner.type === "staff")
      ) {
        return false;
      }
    }

    if (filterClasses || filterHouse) {
      if (runner.type === "student") {
        if (filterClasses && runner.class !== filterClasses) {
          return false;
        }
        if (filterHouse && runner.house !== filterHouse) {
          return false;
        }
      } else {
        return false || (filterHouse == "Extern (Kollegium)" && !filterClasses);
      }
    }

    return !filterName || runner.name?.includes(filterName);
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    console.log(runners);
  }, [isLoggedIn]);

  if (!user || runnersLoading) {
    return <Loading />;
  }

  async function deleteRunnerHandler(runner_id: string) {
    alert("Not implemented yet.");
  }

  return (
    <>
      <Head title="24 Stunden Lauf" />
      <main className="main">
        <div className="searchbox">
          <div className="input-elements-container">
            <Link
              href="/admin/24-stunden-lauf/"
              className="btn btn-ghost btn-circle btn-sm"
            >
              <Icon name="ArrowLeftIcon" />
            </Link>

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
                  <option value={"other"}>Gäste</option>
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
          {runners
            .filter((runner) => {
              return filter(runner);
            })
            .map((runner) => {
              return (
                <ListItem
                  key={runner.id}
                  number={runner.number}
                  mainContent={runner.name}
                  secondaryContent={runner.email}
                  badges={
                    runner.type === "student"
                      ? [
                          "Schüler",
                          runner.class as string,
                          runner.house as string,
                        ]
                      : runner.type === "staff"
                      ? ["Lehrer"]
                      : ["Gast"]
                  }
                />
              );
            })}
          <div className="w-full text-sm text-center">
            Keine weiteren Läufer
          </div>
        </div>
      </main>
    </>
  );
}
