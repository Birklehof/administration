import Login from "@/components/Login";
import Head from "@/components/Head";
import useAuth from "@/lib/hooks/useAuth";
import router from "next/router";
import { useEffect } from "react";

export default function Index() {
  const { isLoggedIn, user, role, logout } = useAuth();

  useEffect(() => {
    console.log("test");
    if (isLoggedIn && user && role) {
      redirect(role).then((path) => {
        router.push(path);
      });
    }
  }, [isLoggedIn, user, role]);

  async function redirect(role: string): Promise<string> {
    if (role === "admin") {
      return "/admin";
    } else {
      alert("Du hast keine Berechtigung für diese Seite.");
      logout();
      return "/";
    }
  }

  return (
    <>
      <Head title="Anmeldung" />
      <main className="hero min-h-screen bg-base-200">
        <div className="hero-content w-full flex justify-around">
          <div className="hidden lg:block">
            <h1 className="text-5xl text-right font-bold">Administration</h1>
          </div>
          <div className="w-full max-w-sm lg:max-w-md">
            <div className="card w-full shadow-2xl bg-base-100">
              <div className="card-body">
                <h1 className="text-xl text-center font-bold mb-3 lg:hidden">
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
