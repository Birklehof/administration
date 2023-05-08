import Loading from "@/components/Loading";
import useAuth from "@/lib/hooks/useAuth";
import Head from "@/components/Head";
import { useEffect, useState } from "react";
import useCollectionAsList from "@/lib/hooks/useCollectionAsList";
import { Runner } from "@/lib/interfaces";
import Icon from "@/components/Icon";
import { useRouter } from "next/router";

export default function Admin24StundenLauf() {
  const router = useRouter();
  const [runners, runnersLoading, runnersError] = useCollectionAsList<Runner>(
    "/apps/24-stunden-lauf/" + router.query.runnersCollection
  );
  const { isLoggedIn, user } = useAuth();

  const [filterName, setFilterName] = useState("");

  function filter(runner: Runner): boolean {
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
            <input
              type="text"
              placeholder="Suchen..."
              onChange={(e) => setFilterName(e.target.value)}
            />
            {/* <div className="dropdown dropdown-bottom dropdown-end">
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
            </div> */}
          </div>
        </div>
        <div className="vertical-list !pt-20 !gap-2">
          {runners
            .filter((runner) => {
              return filter(runner);
            })
            .map((runner) => {
              return (
                <div key={runner.id} className="list-item">
                  <span className="whitespace-nowrap overflow-hidden pr-1">
                    <span className="overflow-hidden text-ellipsis font-semibold">
                      {runner.id} {runner.number}
                    </span>
                  </span>
                  <span className="whitespace-nowrap overflow-hidden">
                    <span className="overflow-hidden text-ellipsis">
                      {runner.name}
                    </span>
                  </span>
                  <div className="spacer" />
                  <button
                    className="btn btn-outline btn-error btn-square btn-sm"
                    aria-label="Nutzer löschen"
                    onClick={() => deleteRunnerHandler(runner.id)}
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
