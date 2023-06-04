import Loading from '@/components/Loading';
import useAuth from '@/lib/hooks/useAuth';
import Head from '@/components/Head';
import { useEffect } from 'react';
import Icon from '@/components/Icon';

export default function AdminMaterialausgabeIndex() {
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
      <main className="main">
        <div className="flex h-full w-full justify-center items-center">🚧 Under construction 🚧</div>
      </main>
    </>
  );
}
