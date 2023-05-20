import Loading from '@/components/Loading';
import useAuth from '@/lib/hooks/useAuth';
import Head from '@/components/Head';
import { useEffect } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Runner, Staff, Student, Lap } from '@/lib/interfaces';
import { themedPromiseToast } from '@/lib/utils';
import useCollectionCount from '@/lib/hooks/useCollectionCount';
import useCollectionAsList from '@/lib/hooks/useCollectionAsList';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { deleteArchive } from '@/lib/firebaseUtils';
import ListItem from '@/components/ListItem';

export default function AdminIndex() {
  const { isLoggedIn, user } = useAuth();
  const [runnerCount, runnerCountLoading, runnerCountError] =
    useCollectionCount('apps/24-stunden-lauf/runners');
  const [lapsCount, lapsCountLoading, lapsCountError] = useCollectionCount(
    'apps/24-stunden-lauf/laps'
  );
  const [archives, archivesLoading, archivesError] = useCollectionAsList<any>(
    '/apps/24-stunden-lauf/archive'
  );

  async function addStudentsToRunners(): Promise<number> {
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    studentsSnapshot.forEach(async (doc) => {
      const student = doc.data() as Student;

      const newRunner = {
        number: 0,
        name: student.firstName + ' ' + student.lastName,
        type: 'student',
        email: student.email,
        class: student.class,
        house: student.house,
      };

      await addDoc(
        collection(db, 'apps', '24-stunden-lauf', 'runners'),
        newRunner
      );
    });
    return studentsSnapshot.size;
  }

  async function addStaffToRunners(): Promise<number> {
    const staffSnapshot = await getDocs(collection(db, 'staff'));
    staffSnapshot.forEach(async (doc) => {
      const staff = doc.data() as Staff;

      const newRunner = {
        number: 0,
        name: staff.firstName + ' ' + staff.lastName,
        type: 'staff',
        email: staff.email,
      };

      await addDoc(
        collection(db, 'apps', '24-stunden-lauf', 'runners'),
        newRunner
      );
    });
    return staffSnapshot.size;
  }

  async function archiveHandler() {
    // Make api request to /api/createLap
    const res = await fetch('/api/archive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: user?.accessToken || '',
      },
    });

    if (res.status == 200) {
      return;
    }

    if (res.status == 401 || res.status == 403) {
      throw new Error('Zugriff verweigert');
    }

    throw new Error('Unbekannter Fehler');
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  if (!user || runnerCountLoading || lapsCountLoading || archivesLoading) {
    return <Loading />;
  }

  return (
    <>
      <Head title="24 Stunden Lauf" />
      <main className="main">
        <div className="vertical-list">
          <div className="large-card">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-evenly">
                <div className="stat w-full text-center md:w-1/3">
                  <div className="stat-value">{runnerCount}</div>
                  <div className="stat-desc">Läufer</div>
                </div>
                <div className="stat w-full text-center md:w-1/3">
                  <div className="stat-value">{lapsCount}</div>
                  <div className="stat-desc">Runden gesamt</div>
                </div>
              </div>
            </div>
          </div>
          <div className="large-card">
            <div className="card-body">
              <h1 className="card-title">Aktuelle Veranstaltung</h1>
              <Link
                href="/admin/24-stunden-lauf/runners"
                className="btn-outline btn-primary btn-square btn-sm btn mr-1"
                aria-label="Läufer einsehen"
              >
                <Icon name="EyeIcon" />
              </Link>
              <button
                onClick={async () =>
                  await themedPromiseToast(addStudentsToRunners, {
                    pending: 'Füge Personal zu Läufern hinzu...',
                    success: {
                      render: (success) => {
                        return `${success.data} Läufer wurden erfolgreich hinzugefügt.`;
                      },
                    },
                    error: 'Fehler beim Hinzufügen der Läufer.',
                  })
                }
                className="btn-outline btn-primary btn-sm btn"
                aria-label="Schüler als Läufer hinzufügen"
              >
                Schüler als Läufer hinzufügen
              </button>
              <button
                onClick={async () =>
                  await themedPromiseToast(addStaffToRunners, {
                    pending: 'Füge Personal zu Läufern hinzu...',
                    success: {
                      render: (success) => {
                        return `${success.data} Läufer wurden erfolgreich hinzugefügt.`;
                      },
                    },
                    error: 'Fehler beim Hinzufügen der Läufer.',
                  })
                }
                className="btn-outline btn-primary btn-sm btn"
                aria-label="Add staff to runners"
              >
                Personal als Läufer hinzufügen
              </button>
              <button
                onClick={async () =>
                  await themedPromiseToast(archiveHandler, {
                    pending: 'Archiviere Läufer...',
                    success: 'Läufer wurden erfolgreich archiviert.',
                    error: {
                      render: ({ data }: any) => {
                        if (data.message) {
                          return data.message;
                        }
                        return 'Unbekannter Fehler';
                      },
                    },
                  })
                }
                className="btn-outline btn-primary btn-sm btn"
                aria-label="Archivieren"
              >
                Archivieren
              </button>
            </div>
          </div>

          {archives
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((archive) => {
              return (
                <ListItem
                  key={archive.id}
                  mainContent={
                    'Lauf ' + new Date(archive.timestamp).getFullYear()
                  }
                  secondaryContent={
                    new Date(archive.timestamp).toLocaleDateString('de-DE') +
                    ' ' +
                    new Date(archive.timestamp).toLocaleTimeString('de-DE')
                  }
                >
                  <Link
                    href={`/admin/24-stunden-lauf/${archive.id}`}
                    className="btn-outline btn-primary btn-square btn-sm btn mr-1"
                    aria-label="Läufer einsehen"
                  >
                    <Icon name="EyeIcon" />
                  </Link>
                  <button
                    className="btn-outline btn-error btn-square btn-sm btn"
                    onClick={async () =>
                      themedPromiseToast(deleteArchive(archive.id), {
                        pending: 'Lösche Archiv...',
                        success: 'Archiv wurde erfolgreich gelöscht.',
                        error: {
                          render: (error) => {
                            if (error instanceof Error) {
                              return error.message;
                            }
                            return 'Unbekannter Fehler';
                          },
                        },
                      })
                    }
                  >
                    <Icon name="TrashIcon" />
                  </button>
                </ListItem>
              );
            })}
        </div>
      </main>
    </>
  );
}
