import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, microsoftOAuthProvider } from '@/lib/firebase';
import useAuth from '@/lib/hooks/useAuth';
import { themedPromiseToast } from '@/lib/utils';

export default function Login() {
  const { isLoggedIn } = useAuth();

  const handleAuth = async () => {
    themedPromiseToast(signInWithPopup(auth, microsoftOAuthProvider), {
      pending: 'Anmeldung läuft...',
      success: {
        render: () => {
          return 'Willkommen zurück!';
        },
        icon: '👋',
        type: 'info',
      },
      error: 'Fehler beim Anmelden!',
    });
  };

  return (
    <>
      <button
        className={`btn-outline btn-primary btn w-full ${
          isLoggedIn ? 'btn-disabled loading' : ''
        }`}
        onClick={() => handleAuth()}
        disabled={isLoggedIn}
      >
        Admin
      </button>
    </>
  );
}
