import Loading from '@/components/Loading';
import useAuth from '@/lib/hooks/useAuth';
import Head from '@/components/Head';
import { useEffect } from 'react';
import NavBar from '@/components/NavBar';

export default function AdminIndex() {
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  if (!user) {
    return <Loading />;
  }

  return (
    <>
      <Head title="Home" />
      <main className="main gap-2">
        <NavBar title="Administration" />
      </main>
    </>
  );
}
