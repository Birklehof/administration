import router from 'next/router';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { User } from '@/lib/interfaces';
import { doc, getDoc } from 'firebase/firestore';

function useAuth() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [role, setRole] = useState<string | undefined>(undefined); // '' (no role) | 'admin'
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    auth.onAuthStateChanged((authenticatedUser) => {
      console.log(authenticatedUser);

      if (user !== authenticatedUser) {
        setIsLoggedIn(false);
        if (authenticatedUser && authenticatedUser.uid) {
          const newUser = authenticatedUser as User;
          setUser(newUser);
          getUserRole(newUser).then((role) => {
            setRole(role);
          });
          setIsLoggedIn(true);
        }
      }
    });
  }, []);

  async function getUserRole(user: User): Promise<string | undefined> {
    if (!user || !user.email) {
      return;
    }

    const userRole = await getDoc(
      doc(db, '/apps/administration/roles', user.email)
    );
    const role = userRole.data()?.role || '';

    return role;
  }

  async function logout() {
    return auth
      .signOut()
      .then(() => {
        router.push('/');
      })
      .catch((e) => {
        console.error(e);
      });
  }

  return { user, role, isLoggedIn, logout };
}

export default useAuth;
