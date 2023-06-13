import Loading from '@/components/Loading';
import useAuth from '@/lib/hooks/useAuth';
import Head from '@/components/Head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { getCollectionSize } from '@/lib/firebase/frontendUtils';
import { themedErrorToast } from '@/lib/utils';

export default function AdminIndex() {
  const { isLoggedIn, user } = useAuth();

  const [studentsCount, setStudentsCount] = useState<number | null>(null);
  const [staffCount, setStaffCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    getCollectionSize('students').then((size) => setStudentsCount(size)).catch(() => {
      themedErrorToast('Fehler beim Laden der Schüler.');
    });
    getCollectionSize('staff').then((size) => setStaffCount(size)).catch(() => {
      themedErrorToast('Fehler beim Laden der Mitarbeiter.');
    });
  }, [isLoggedIn]);

  if (!user) {
    return <Loading />;
  }

  return (
    <>
      <Head title="Home" />
      <main className="main gap-2">
        <NavBar title="Nutzer" />
        <div className="stats shadow-md w-full">
          <div className="stat">
            <Link
              href="/admin/users/users"
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
            <div className="stat-title">Schüler</div>
            <div className="stat-value">
              {studentsCount === null ? (
                <span className="loading loading-dots loading-sm"></span>
              ) : (
                studentsCount
              )}
            </div>
          </div>
          <div className="stat">
            <Link
              href="/admin/users/users"
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
            <div className="stat-title">Mitarbeiter</div>
            <div className="stat-value">
              {staffCount === null ? (
                <span className="loading loading-dots loading-sm"></span>
              ) : (
                staffCount
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-2 w-full">
          <div className="filling-card">
            <div className="card-body">
              <h2 className="card-title">Aktionen</h2>
              <Link
                href={'/admin/users/import'}
                className="btn-primary btn-outline btn aspect-square w-full"
              >
                Nutzer importieren
              </Link>
              <Link
                href={'/admin/users/add'}
                className="btn-primary btn-outline btn aspect-square w-full"
              >
                Nutzer manuell hinzufügen
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
