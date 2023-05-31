import Loading from '@/components/Loading';
import useAuth from '@/lib/hooks/useAuth';
import Head from '@/components/Head';
import { useEffect, useState } from 'react';
import useCollectionAsList from '@/lib/hooks/useCollectionAsList';
import { Lap, Runner } from '@/lib/interfaces';
import { useRouter } from 'next/router';
import useRemoteConfig from '@/lib/hooks/useRemoteConfig';
import ListItem from '@/components/ListItem';
import SearchBar from '@/components/SearchBar';

export default function Admin24StundenLauf() {
  const router = useRouter();
  const [runners, runnersLoading, runnersError] = useCollectionAsList<Runner>(
    '/apps/24-stunden-lauf/archive/' + router.query.archiveId + '/runners'
  );
  const [laps, lapsLoading, lapsError] = useCollectionAsList<Lap>(
    '/apps/24-stunden-lauf/archive/' + router.query.archiveId + '/laps'
  );
  const { isLoggedIn, user } = useAuth();
  const { classes, houses } = useRemoteConfig();

  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterClasses, setFilterClasses] = useState('');
  const [filterHouse, setFilterHouse] = useState('');

  function filter(runner: Runner): boolean {
    if (filterType) {
      if (filterType === 'student' && runner.type !== 'student') {
        return false;
      }
      if (filterType === 'staff' && runner.type !== 'staff') {
        return false;
      }
      if (
        filterType === 'other' &&
        (runner.type === 'student' || runner.type === 'staff')
      ) {
        return false;
      }
    }

    if (filterClasses || filterHouse) {
      if (runner.type === 'student') {
        if (filterClasses && runner.class !== filterClasses) {
          return false;
        }
        if (filterHouse && runner.house !== filterHouse) {
          return false;
        }
      } else {
        return false || (filterHouse == 'Extern (Kollegium)' && !filterClasses);
      }
    }

    return !filterName || runner.name?.includes(filterName);
  }

  function getLapCount(runnerId: string): number {
    return laps.filter((lap) => lap.runnerId === runnerId).length;
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    console.log(runners);
  }, [isLoggedIn]);

  if (!user || runnersLoading || lapsLoading) {
    return <Loading />;
  }

  return (
    <>
      <Head title="24 Stunden Lauf" />
      <main className="main">
        <SearchBar
          backLink="/admin/24-stunden-lauf"
          searchValue={filterName}
          setSearchValue={setFilterName}
          filters={[
            {
              filerValue: filterType,
              setFilterValue: setFilterType,
              filterOptions: [
                { value: '', label: 'Alle Typen' },
                { value: 'student', label: 'Schüler' },
                { value: 'staff', label: 'Lehrer' },
                { value: 'other', label: 'Sonstige' },
              ],
            },
            {
              filerValue: filterClasses,
              setFilterValue: setFilterClasses,
              filterOptions: [
                { value: '', label: 'Alle Klassen' },
                ...classes.map((_class) => ({ value: _class, label: _class })),
              ],
            },
            {
              filerValue: filterHouse,
              setFilterValue: setFilterHouse,
              filterOptions: [
                { value: '', label: 'Alle Häuser' },
                ...houses.map((house) => ({ value: house, label: house })),
              ],
            },
          ]}
        />
        <div className="vertical-list">
          {runners
            .filter((runner) => {
              return filter(runner);
            })
            .sort((a, b) => {
              return getLapCount(b.id || "") - getLapCount(a.id || "");
            })
            .map((runner) => {
              return (
                <ListItem
                  key={runner.id}
                  number={runner.number}
                  mainContent={runner.name}
                  secondaryContent={runner.email}
                  badges={
                    runner.type === 'student'
                      ? [
                          'Schüler',
                          runner.class as string,
                          runner.house as string,
                        ]
                      : runner.type === 'staff'
                      ? ['Lehrer']
                      : ['Gast']
                  }
                >
                  <div className="my-auto px-2">
                    <div className="stat-value text-center text-lg font-semibold md:text-xl">
                      {getLapCount(runner.id || "")}
                    </div>
                    <div className="stat-title -mt-2 text-center text-xs">
                      Runden
                    </div>
                  </div>
                </ListItem>
              );
            })}
          <div className="w-full text-center text-sm">
            Keine weiteren Läufer
          </div>
        </div>
      </main>
    </>
  );
}
