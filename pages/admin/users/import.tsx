import { useEffect, useState } from 'react';
import Head from '@/components/Head';
import Loading from '@/components/Loading';
import useAuth from '@/lib/hooks/useAuth';
import { toast } from 'react-toastify';
import { themedPromiseToast } from '@/lib/utils';
import NavBar from '@/components/NavBar';

export default function AssistantCreateRunner() {
  const { isLoggedIn, user } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  if (!user) {
    return <Loading />;
  }

  async function importStudentsHandler(e: any) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);

    // Get file from form
    const body = new FormData();
    const file = e.target.file.files[0] as File;

    // Check if file exists and is a csv file
    if (file && file.name.endsWith('.csv')) {
      body.append('file', file);
    } else {
      toast.error('Bitte lade eine CSV-Datei hoch');
      setSubmitting(false);
      return;
    }

    // Upload to server
    await themedPromiseToast(uploadToServer(body, '/api/students/import'), {
      pending: 'Importiere Schüler...',
      success: 'Schüler erfolgreich importiert',
      error: {
        render: ({ data }: any) => {
          if (data.message) {
            return data.message;
          } else if (typeof data === 'string') {
            return data;
          }
          return 'Fehler beim Importieren der Schüler.';
        },
      },
    })
      .then(() => {
        e.target.reset();
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  async function importStaffHandler(e: any) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);

    // Get file from form
    const body = new FormData();
    const file = e.target.file.files[0] as File;

    // Check if file exists and is a csv file
    if (file && file.name.endsWith('.csv')) {
      body.append('file', file);
    } else {
      toast.error('Bitte lade eine CSV-Datei hoch');
      setSubmitting(false);
      return;
    }

    // Upload to server
    await themedPromiseToast(uploadToServer(body, '/api/staff/import'), {
      pending: 'Importiere Mitarbeiter...',
      success: 'Mitarbeiter erfolgreich importiert',
      error: {
        render: ({ data }: any) => {
          if (data.message) {
            return data.message;
          } else if (typeof data === 'string') {
            return data;
          }
          return 'Fehler beim Importieren der Mitarbeiter.';
        },
      },
    })
      .then(() => {
        e.target.reset();
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  async function uploadToServer(body: FormData, url: string) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: user?.accessToken || '',
      },
      body,
    });

    if (res.status == 200) {
      return Promise.resolve();
    }

    if (res.status == 401 || res.status == 403) {
      return Promise.reject('Zugriff verweigert');
    }

    if (res.status == 400) {
      return Promise.reject('Fehler beim Hochladen der Datei');
    }

    return Promise.reject('Fehler beim Importieren der Schüler');
  }

  return (
    <>
      <Head title="Assistent" />
      <main className="main gap-2">
        <NavBar title="Nutzer importieren" backLink='/admin/users' />
        <div className="centered-card">
          <div className="card-body">
            <form
              className="flex flex-col gap-3"
              onSubmit={importStudentsHandler}
            >
              <h2 className="text-center text-lg font-bold">Schüler</h2>
              <input
                type="file"
                className="file-input-bordered file-input file-input-md"
                name="file"
                accept=".csv"
              />
              <button
                type="submit"
                className={`btn-primary btn ${submitting ? 'loading' : ''}`}
                value="Importieren"
              >
                Hochladen
              </button>
            </form>
          </div>
        </div>
        <div className="centered-card">
          <div className="card-body">
            <form className="flex flex-col gap-3" onSubmit={importStaffHandler}>
              <h2 className="text-center text-lg font-bold">Mitarbeiter</h2>
              <input
                type="file"
                className="file-input-bordered file-input file-input-md"
                name="file"
                accept=".csv"
              />
              <button
                type="submit"
                className={`btn-primary btn ${submitting ? 'loading' : ''}`}
                value="Importieren"
              >
                Hochladen
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
