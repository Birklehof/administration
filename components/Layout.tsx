import React, { PropsWithChildren, useEffect } from 'react';
import { useDarkMode } from 'usehooks-ts';
import { useRouter } from 'next/router';
import Menu from './Menu';

export default function Layout({ children }: PropsWithChildren) {
  const { isDarkMode, toggle } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    const body = document.body;
    body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <>
      <button
        className="btn-ghost btn-square btn absolute top-3 left-3 hidden md:flex"
        onClick={toggle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M448 256c0-106-86-192-192-192V448c106 0 192-86 192-192zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
        </svg>
      </button>

      {router.asPath.split('/')[1] === 'admin' && (
        <Menu
          navItems={[
            {
              name: 'Home',
              href: '/admin',
              icon: 'HomeIcon',
            },
            {
              name: 'Nutzer',
              href: '/admin/users',
              icon: 'UserGroupIcon',
            },
            {
              name: 'Berechtigungen',
              href: '/admin/roles',
              icon: 'KeyIcon',
            },
            {
              name: '24 Stunden Lauf',
              href: '/admin/24-stunden-lauf',
              icon: 'FlagIcon',
            },
          ]}
        />
      )}
      {children}
    </>
  );
}
