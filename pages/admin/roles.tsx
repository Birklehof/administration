import { useEffect, useState } from "react";
import Head from "@/components/Head";
import Loading from "@/components/Loading";
import useAuth from "@/lib/hooks/useAuth";
import AdminMenu from "@/components/AdminMenu";
import Icon from "@/components/Icon";
import useStudents from "@/lib/hooks/useStudents";
import Link from "next/link";
import { Student } from "@/lib/interfaces/student";
import useRemoteConfig from "@/lib/hooks/useRemoteConfig";
import useStaff from "@/lib/hooks/useStaff";
import useApps from "@/lib/hooks/useApps";
import Role from "@/lib/interfaces/role";

interface StudentOrStaff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  class?: string;
  house?: string;
}

export default function AdminStudents() {
  const { isLoggedIn, user } = useAuth();
  const { roles } = useApps();

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  if (!user || !roles) {
    return <Loading />;
  }

  async function deleteUserHandler(user_id: string) {
    alert("Not implemented yet.");
  }

  return (
    <>
      <Head title="Assistent" />
      <main className="flex bg-base-200 justify-center h-screen items-center">
        <div className="hidden lg:flex">
          <AdminMenu />
        </div>
        <div className="flex flex-col w-full lg:w-3/4">
          {/* display the apps with its respective roles */}
          {Object.keys(roles).map((app) => (
            <div>
              {app}
              <div>
                {roles[app].map((role: Role) => (
                  <div>
                    - {role.email} has role {role.role}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
