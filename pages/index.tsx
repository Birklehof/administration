import Login from '@/components/Login';
import Head from '@/components/Head';
import useAuth from '@/lib/hooks/useAuth';
import router from 'next/router';
import { useEffect } from 'react';
import { themedErrorToast } from '@/lib/utils';

export default function Index() {
  const { isLoggedIn, user, role, logout } = useAuth();

  useEffect(() => {
    if (isLoggedIn && user){

      if (role === '') {
        themedErrorToast('Du hast keine Berechtigung für diese Seite.');
        logout();
        return;
      }

      redirect(role).then((path) => {
        router.push(path);
      });
    }
  }, [isLoggedIn, user, role]);

  async function redirect(role: string): Promise<string> {
    if (role === 'admin') {
      return '/admin';
    } else {
      throw new Error('Unknown role');
    }
  }

  return (
    <>
      <Head title="Anmeldung" />
      <main className="hero min-h-screen bg-base-200">
        <div className="hero-content flex w-full justify-around">
          <div className="hidden lg:block">
            <h1 className="text-right text-5xl font-bold">Administration</h1>
          </div>
          <div className="w-full max-w-sm lg:max-w-md">
            <div className="card w-full bg-base-100 shadow-2xl">
              <div className="card-body">
                <h1 className="mb-3 text-center text-xl font-bold lg:hidden">
                  Administration
                </h1>
                <Login />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
