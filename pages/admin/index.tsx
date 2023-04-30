import AdminMenu from "@/components/AdminMenu";
import Loading from "@/components/Loading";
import useAuth from "@/lib/hooks/useAuth";
import Head from "@/components/Head";
import { useEffect } from "react";

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
      <main className="flex bg-base-200 justify-center h-screen items-center"></main>
    </>
  );
}
