import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, microsoftOAuthProvider } from "@/lib/firebase";
import useAuth from "@/lib/hooks/useAuth";

export default function Login() {
  const { isLoggedIn } = useAuth();

  const handleAuth = async () => {
    signInWithPopup(auth, microsoftOAuthProvider).catch((error) => {
      console.log(error);
    });
  };

  return (
    <>
      <button
        className={`btn btn-primary w-full ${
          isLoggedIn ? "btn-disabled loading" : ""
        }`}
        onClick={() => handleAuth()}
        disabled={isLoggedIn}
      >
        Admin
      </button>
    </>
  );
}
