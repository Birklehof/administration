import Loading from '@/components/Loading';
import useAuth from '@/lib/hooks/useAuth';
import Head from '@/components/Head';
import { useEffect, useState } from 'react';
import { themedErrorToast, themedPromiseToast } from '@/lib/utils';
import useCollectionAsList from '@/lib/hooks/useCollectionAsList';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { deleteArchive, getCollectionSize } from '@/lib/firebase/frontendUtils';
import ListItem from '@/components/ListItem';
import NavBar from '@/components/NavBar';
import ErrorAlert from '@/components/ErrorAlert';
import { CSVLink } from 'react-csv';
import {
  RunnersListCSV as RunnerListCSV,
  exportRunners,
} from '@/lib/firebase/exportRunners';
import {
  RunnersWithLapsListCSV,
  exportRunnersWithLaps,
} from '@/lib/firebase/exportRunnersWithLaps';

export default function Admin24StundenLaufIndex() {
  const { isLoggedIn, user } = useAuth();
  const [lapsCount, setLapsCount] = useState<number | null>(null);
  const [runnersCount, setRunnersCount] = useState<number | null>(null);
  const [archives, archivesLoading, archivesError] = useCollectionAsList<any>(
    '/apps/24-stunden-lauf/archive'
  );
  const [runnerListCSV, setRunnerListCSV] = useState<RunnerListCSV | null>(
    null
  );
  const [runnersWithLapsListCSV, setRunnersWithLapsListCSV] =
    useState<RunnersWithLapsListCSV | null>(null);

  async function addRunnersHandler(): Promise<[number, number]> {
    // Make api request to /api/studentsToRunners
    const res = await fetch('/api/24-stunden-lauf/addToRunners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: user?.accessToken || '',
      },
    });

    if (res.status == 200) {
      const body = await res.json();
      return [body.studentsAdded, body.staffAdded];
    }

    if (res.status == 401 || res.status == 403) {
      return Promise.reject('Zugriff verweigert');
    }

    return Promise.reject('Fehler beim Hinzufügen der Läufer.');
  }

  async function archiveHandler() {
    // Make api request to /api/createLap
    const res = await fetch('/api/24-stunden-lauf/archive', {
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

    getCollectionSize('/apps/24-stunden-lauf/runners')
      .then((size) => {
        setRunnersCount(size);
      })
      .catch(() => {
        themedErrorToast('Fehler beim Laden der Läufer.');
      });
    getCollectionSize('/apps/24-stunden-lauf/laps')
      .then((size) => {
        setLapsCount(size);
      })
      .catch(() => {
        themedErrorToast('Fehler beim Laden der Runden.');
      });
  }, [isLoggedIn]);

  if (!user) {
    return <Loading />;
  }

  return (
    <>
      <Head title="24 Stunden Lauf" />
      <main className="main gap-2">
        <NavBar title="24 Stunden Lauf" />
        <div className="stats w-full shadow-md">
          <div className="stat">
            <Link
              href="/admin/24-stunden-lauf/runners"
              className="stat-figure btn-ghost btn-circle btn text-info"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>
            <div className="stat-title">Läufer</div>
            <div className="stat-value">
              {runnersCount === null ? (
                <span className="loading loading-dots loading-sm"></span>
              ) : (
                runnersCount
              )}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Runden gesamt</div>
            <div className="stat-value">
              {lapsCount === null ? (
                <span className="loading loading-dots loading-sm"></span>
              ) : (
                lapsCount
              )}
            </div>
          </div>
        </div>
        <div className="flex w-full flex-row flex-wrap gap-2">
          <div className="filling-card h-fit">
            <div className="card-body">
              <h2 className="card-title">Ablauf</h2>
              <ul className="steps steps-vertical">
                <li className="step">
                  <div>
                    Nutzerdatenbank aktualisieren
                    <div className="dropdown-end dropdown">
                      <label
                        tabIndex={0}
                        className="btn-ghost btn-xs btn-circle btn text-info"
                      >
                        <Icon name="InformationCircleIcon" />
                      </label>
                      <div
                        tabIndex={0}
                        className="compact card dropdown-content rounded-box z-50 w-64 bg-base-100 shadow-md"
                      >
                        <div className="card-body text-left">
                          <p>
                            Unter{' '}
                            <Link href={'/admin/users'} className="link">
                              Nutzer
                            </Link>{' '}
                            können Sie die Nutzer verwalten.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="step-primary step">
                  <div
                    className="tooltip-accent tooltip tooltip-bottom w-full text-left"
                    data-tip="Importieren Sie hier die Schüler und Mitarbeiter als Läufer. Die Daten werden aus der Nutzerdatenbank übernommen. Bestehende Läufer werden nicht überschrieben."
                  >
                    <button
                      onClick={async () =>
                        await themedPromiseToast(addRunnersHandler, {
                          pending: 'Importiere Läufer ...',
                          success: {
                            render: (success) => {
                              return `${success.data[0]} Schüler und ${success.data[1]} Mitarbeiter wurden importiert.`;
                            },
                          },
                          error: {
                            render: ({ data }: any) => {
                              if (data.message) {
                                return data.message;
                              } else if (typeof data === 'string') {
                                return data;
                              }
                              return 'Fehler beim Importieren der Läufer.';
                            },
                          },
                        })
                      }
                      className="btn-primary btn-outline btn-sm btn aspect-square w-full"
                      aria-label="Schüler als Läufer hinzufügen"
                    >
                      <Icon name="UserAddIcon" />
                      Läufer importieren
                    </button>
                  </div>
                </li>
                <li className="step-info step">
                  <div
                    className="tooltip-accent tooltip w-full text-left"
                    data-tip="Laden Sie hier die Teilnehmerliste herunter, um die Nummern ausgeben zu können."
                  >
                    <button
                      className="btn-info btn-outline btn-sm btn aspect-square w-full"
                      aria-label="Schüler als Läufer hinzufügen"
                      onClick={async () => {
                        setRunnerListCSV(await exportRunners());
                        // Click invisible download button after 1 second
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        document
                          .getElementById('download-runners-csv')
                          ?.click();
                      }}
                    >
                      <Icon name="DocumentDownloadIcon" />
                      Teilnehmerliste herunterladen
                    </button>
                    {runnerListCSV && (
                      <CSVLink
                        id={'download-runners-csv'}
                        {...runnerListCSV}
                        className="btn-primary btn hidden"
                      >
                        Herunterladen
                      </CSVLink>
                    )}
                  </div>
                </li>
                <li className="step">Nummern ausgeben</li>
                <li className="step">Laufen</li>
                <li className="step-info step">
                  <div
                    className="tooltip-accent tooltip w-full text-left"
                    data-tip="Laden Sie hier die Ergebnisliste herunter."
                  >
                    <button
                      className="btn-info btn-outline btn-sm btn aspect-square w-full"
                      aria-label="Schüler als Läufer hinzufügen"
                      onClick={async () => {
                        setRunnersWithLapsListCSV(
                          await exportRunnersWithLaps()
                        );
                        // Click invisible download button after 1 second
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        document
                          .getElementById('download-results-csv')
                          ?.click();
                      }}
                    >
                      <Icon name="DocumentDownloadIcon" />
                      Ergebnisliste herunterladen
                    </button>
                    {runnersWithLapsListCSV && (
                      <CSVLink
                        id={'download-results-csv'}
                        {...runnersWithLapsListCSV}
                        className="btn-primary btn hidden"
                      >
                        Herunterladen
                      </CSVLink>
                    )}
                  </div>
                </li>
                <li className="step-error step">
                  <div
                    className="tooltip-accent tooltip w-full text-left"
                    data-tip="Durch das Archivieren werden die Läufer und Runden ins Archiv verschoben. Sie bleiben dort einsehbar allerdings können die Daten nicht mehr einfach geändert werden."
                  >
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
                      className="btn-outline btn-error btn-sm btn w-full"
                      aria-label="Archivieren"
                    >
                      <Icon name="ArchiveIcon" />
                      Lauf Archivieren
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="filling-card !bg-opacity-60">
            <div className="card-body">
              <h2 className="card-title">Archiv</h2>
              {archivesError && (
                <ErrorAlert message="Fehler beim Laden des Archives" />
              )}
              {archivesLoading ? (
                <span className="loading loading-dots loading-sm"></span>
              ) : (
                <div className="grid w-full grid-cols-1 flex-col items-center gap-2">
                  {archives
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((archive) => {
                      return (
                        <ListItem
                          glass={true}
                          key={archive.id}
                          mainContent={
                            'Lauf ' + new Date(archive.timestamp).getFullYear()
                          }
                          secondaryContent={
                            new Date(archive.timestamp).toLocaleDateString(
                              'de-DE'
                            ) +
                            ' ' +
                            new Date(archive.timestamp).toLocaleTimeString(
                              'de-DE'
                            )
                          }
                        >
                          <Link
                            href={`/admin/24-stunden-lauf/${archive.id}`}
                            className="btn-info btn-outline btn-square btn-sm btn"
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
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
