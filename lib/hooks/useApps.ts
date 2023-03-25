import { useEffect, useState } from "react";
import { collection, query, getDocs, onSnapshot } from "@firebase/firestore";
import { db } from "@/lib/firebase";
import useAuth from "./useAuth";
import Role from "@/lib/interfaces/role";

export default function useApps() {
  const { isLoggedIn, user } = useAuth();
  const [apps, setApps] = useState<string[]>([]);
  const [roles, setRoles] = useState<{ [id: string]: Role[] }>({});

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    syncApps();
  }, [isLoggedIn, user]);

  async function syncApps() {
    const q = query(collection(db, "/apps"));
    const querySnapshot = await getDocs(q);
    const new_apps: string[] = [];
    const apps = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      new_apps.push(doc.id);
    });
    setApps(new_apps);
    for (const app of new_apps) {
      syncRoles(app);
    }

    onSnapshot(q, (querySnapshot) => {
      const new_apps: string[] = [];
      const apps = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        new_apps.push(doc.id);
      });
      setApps(new_apps);
    });
  }

  async function syncRoles(app_id: string) {
    const q = query(collection(db, `/apps/${app_id}/roles`));
    const querySnapshot = await getDocs(q);
    let new_roles: { [id: string]: Role[] } = roles;
    new_roles[app_id] = [];
    querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const new_role = { email: doc.id, ...data } as Role;
      if (!new_roles[app_id]) new_roles[app_id] = [];
      new_roles[app_id].push(new_role);
    });
    setRoles(new_roles);

    onSnapshot(q, (querySnapshot) => {
      let new_roles: { [id: string]: Role[] } = roles;
      new_roles[app_id] = [];
      querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const new_role = { email: doc.id, ...data } as Role;
        if (!new_roles[app_id]) new_roles[app_id] = [];
        new_roles[app_id].push(new_role);
      });
      setRoles(new_roles);
    });
  }

  return { apps, roles };
}
