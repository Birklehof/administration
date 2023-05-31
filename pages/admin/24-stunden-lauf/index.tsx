import Loading from '@/components/Loading';
import useAuth from '@/lib/hooks/useAuth';
import Head from '@/components/Head';
import { useEffect } from 'react';
import { themedPromiseToast } from '@/lib/utils';
import useCollectionCount from '@/lib/hooks/useCollectionCount';
import useCollectionAsList from '@/lib/hooks/useCollectionAsList';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { deleteArchive } from '@/lib/firebase/frontendUtils';
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

  async function addStudentsToRunnersHandler(): Promise<number> {
    // Make api request to /api/studentsToRunners
    const res = await fetch('/api/studentsToRunners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: user?.accessToken || '',
      },
    });

    if (res.status == 200) {
      const body = await res.json();
      return body.runnersCreated;
    }

    if (res.status == 401 || res.status == 403) {
      return Promise.reject('Zugriff verweigert');
    }

    return Promise.reject('Fehler beim Hinzufügen der Läufer.');
  }

  async function addStaffToRunnersHandler(): Promise<number> {
    // Make api request to /api/staffToRunners
    const res = await fetch('/api/staffToRunners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: user?.accessToken || '',
      },
    });

    if (res.status == 200) {
      const body = await res.json();
      return body.runnersCreated;
    }

    if (res.status == 401 || res.status == 403) {
      return Promise.reject('Zugriff verweigert');
    }

    return Promise.reject('Fehler beim Hinzufügen der Läufer.');
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
      return Promise.reject('Zugriff verweigert');
    }

    return Promise.reject('Fehler beim Archivieren.');
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
                  className="btn-outline btn-primary btn-xl btn"
                  aria-label="Läufer einsehen"
                >
                  Läufer einsehen
                </Link>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={async () =>
                    await themedPromiseToast(addStudentsToRunnersHandler, {
                      pending: 'Füge Schüler zu Läufern hinzu...',
                      success: {
                        render: (success) => {
                          return `${success.data} Läufer wurden hinzugefügt.`;
                        },
                      },
                      error: {
                        render: ({ data }: any) => {
                          if (data.message) {
                            return data.message;
                          } else if (typeof data === 'string') {
                            return data;
                          }
                          return 'Fehler beim Hinzufügen der Läufer.';
                        },
                      },
                    })
                  }
                  className="btn-outline btn-warning btn aspect-square w-full"
                  aria-label="Schüler als Läufer hinzufügen"
                >
                  Schüler als Läufer hinzufügen
                </button>
                <button
                  onClick={async () =>
                    await themedPromiseToast(addStaffToRunnersHandler, {
                      pending: 'Füge Personal zu Läufern hinzu...',
                      success: {
                        render: (success) => {
                          return `${success.data} Läufer wurden hinzugefügt.`;
                        },
                      },
                      error: {
                        render: ({ data }: any) => {
                          if (data.message) {
                            return data.message;
                          } else if (typeof data === 'string') {
                            return data;
                          }
                          return 'Fehler beim Hinzufügen der Läufer.';
                        },
                      },
                    })
                  }
                  className="btn-outline btn-warning btn aspect-square w-full"
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
                          } else if (typeof data === 'string') {
                            return data;
                          }
                          return 'Fehler beim Archivieren';
                        },
                      },
                    })
                  }
                  className="btn-outline btn-error btn aspect-square w-full"
                  aria-label="Archivieren"
                >
                  Archivieren
                </button>
              </div>
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
