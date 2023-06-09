import { useEffect, useState } from 'react';
import Head from '@/components/Head';
import Loading from '@/components/Loading';
import useAuth from '@/lib/hooks/useAuth';
import { themedPromiseToast } from '@/lib/utils';
import { Staff, Student } from '@/lib/interfaces';
import useRemoteConfig from '@/lib/hooks/useRemoteConfig';
import { createStaff, createStudent } from '@/lib/firebase/frontendUtils';
import Icon from '@/components/Icon';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

export default function AssistantCreateRunner() {
  const { isLoggedIn, user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<'student' | 'staff'>('student');
  const { classes, houses } = useRemoteConfig();

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  if (!user) {
    return <Loading />;
  }

  async function createStudentHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);

    const newStudent: Student = {
      studentId: formData.get('studentId') as unknown as number,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      class: formData.get('class') as string,
      house: formData.get('house') as string,
    };

    themedPromiseToast(createStudent(newStudent), {
      pending: 'Schüler wird hinzugefügt...',
      success: 'Schüler wurde hinzugefügt!',
      error: {
        render: (error) => {
          if (error instanceof Error) {
            return error.message;
          }
          return 'Unbekannter Fehler';
        },
      },
    })
      .then(() => {
        // Reset form
        (e.target as HTMLFormElement).reset();
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  async function createStaffHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 10000));

    const formData = new FormData(e.target as HTMLFormElement);

    const newStaff: Staff = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
    };

    themedPromiseToast(createStaff(newStaff), {
      pending: 'Mitarbeiter werden hinzugefügt...',
      success: 'Mitarbeiter wurden hinzugefügt!',
      error: {
        render: (error) => {
          if (error instanceof Error) {
            return error.message;
          }
          return 'Unbekannter Fehler';
        },
      },
    })
      .then(() => {
        // Reset form
        (e.target as HTMLFormElement).reset();
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
    <>
      <Head title="Assistent" />
      <main className="main gap-2">
        <NavBar title="Nutzer manuell hinzufügen" backLink="/admin/users" />
        <div className="centered-card">
          <div className="card-body gap-3">
            <div className="tabs tabs-boxed">
              <a
                className={`tab tab-lg grow ${
                  type === 'student' ? 'tab-active' : ''
                }`}
                onClick={() => setType('student')}
              >
                Schüler
              </a>
              <a
                className={`tab tab-lg grow ${
                  type === 'staff' ? 'tab-active' : ''
                }`}
                onClick={() => setType('staff')}
              >
                Lehrer
              </a>
            </div>
            {type === 'student' ? (
              <form
                onSubmit={createStudentHandler}
                className="flex flex-col gap-3"
              >
                <input
                  id="studentId"
                  name="studentId"
                  className="input-bordered input"
                  placeholder="Schülernummer (5-stellig)"
                  autoFocus
                  type="number"
                  required
                  min={10000}
                  max={99999}
                />
                <input
                  id="firstName"
                  name="firstName"
                  className="input-bordered input"
                  placeholder="Vorname"
                  type="text"
                  required
                  minLength={3}
                />
                <input
                  id="lastName"
                  name="lastName"
                  className="input-bordered input"
                  placeholder="Nachname"
                  type="text"
                  required
                  minLength={3}
                />
                <input
                  id="email"
                  name="email"
                  className="input-bordered input"
                  placeholder="E-Mail"
                  type="email"
                  required
                />
                <select
                  id="class"
                  name="class"
                  className="select-bordered select"
                  required
                >
                  <option value="">Klasse</option>
                  {classes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  id="house"
                  name="house"
                  className="select-bordered select"
                  required
                >
                  <option value="">Haus</option>
                  {houses.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <button
                  className={`btn-primary btn-outline btn ${
                    submitting ? 'btn-disabled loading' : ''
                  }`}
                  type="submit"
                  disabled={submitting}
                >
                  Hinzufügen
                </button>
              </form>
            ) : (
              <form
                onSubmit={createStaffHandler}
                className="flex flex-col gap-3"
              >
                <input
                  id="firstName"
                  name="firstName"
                  className="input-bordered input"
                  placeholder="Vorname"
                  type="text"
                  required
                  minLength={3}
                />
                <input
                  id="lastName"
                  name="lastName"
                  className="input-bordered input"
                  placeholder="Nachname"
                  type="text"
                  required
                  minLength={3}
                />
                <input
                  id="email"
                  name="email"
                  className="input-bordered input"
                  placeholder="E-Mail"
                  type="email"
                  required
                />
                <button
                  className={`btn-primary btn-outline btn ${
                    submitting ? 'btn-disabled loading' : ''
                  }`}
                  type="submit"
                  disabled={submitting}
                >
                  Hinzufügen
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
