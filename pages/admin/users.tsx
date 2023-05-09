import { useEffect, useState } from 'react';
import Head from '@/components/Head';
import Loading from '@/components/Loading';
import useAuth from '@/lib/hooks/useAuth';
import Icon from '@/components/Icon';
import { Staff, Student } from '@/lib/interfaces';
import useRemoteConfig from '@/lib/hooks/useRemoteConfig';
import useCollectionAsList from '@/lib/hooks/useCollectionAsList';
import ListItem from '@/components/ListItem';
import { themedPromiseToast } from '@/lib/utils';
import { deleteUser } from '@/lib/firebaseUtils';
import SearchBar from '@/components/SearchBar';

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
    useCollectionAsList<Student>('students');
  const [staff, staffLoading, staffError] = useCollectionAsList<Staff>('staff');
  const users = [...students, ...staff] as StudentOrStaff[];
  const { classes, houses } = useRemoteConfig();

  const [filterName, setFilterName] = useState('');

  const [filterType, setFilterType] = useState('');
  const [filterClasses, setFilterClasses] = useState('');
  const [filterHouse, setFilterHouse] = useState('');

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
      if (filterType === 'student' && !user.email.endsWith('@s.birklehof.de')) {
        return false;
      }
      if (filterType === 'staff' && !user.email.endsWith('@birklehof.de')) {
        return false;
      }
      if (
        filterType === 'other' &&
        (user.email.endsWith('@birklehof.de') ||
          user.email.endsWith('@s.birklehof.de'))
      ) {
        return false;
      }
    }

    if (filterClasses || filterHouse) {
      if ('class' in user && 'house' in user) {
        const student = user as Student;
        if (filterClasses && student.class !== filterClasses) {
          return false;
        }
        if (filterHouse && student.house !== filterHouse) {
          return false;
        }
      } else {
        return false || (filterHouse == 'Extern (Kollegium)' && !filterClasses);
      }
    }

    return (
      !filterName || (user.firstName + ' ' + user.lastName).includes(filterName)
    );
  }

  return (
    <>
      <Head title="Nutzerverwaltung" />
      <main className="main">
        <SearchBar
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
          {users
            .filter((user) => {
              return filter(user);
            })
            .map((user) => {
              return (
                <ListItem
                  key={user.id}
                  mainContent={user.firstName + ' ' + user.lastName}
                  secondaryContent={user.email}
                  badges={
                    user.class && user.house ? [user.class, user.house] : []
                  }
                >
                  <button
                    className="btn-outline btn-error btn-sm btn-square btn"
                    onClick={async () =>
                      await themedPromiseToast(
                        deleteUser(user.id, user.email),
                        {
                          pending: 'Lösche Nutzer ...',
                          success: 'Nutzer gelöscht',
                          error: 'Nutzer konnte nicht gelöscht werden',
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
          <div className="w-full text-center text-sm">
            Keine weiteren Nutzer
          </div>
        </div>
      </main>
    </>
  );
}
