import React, { PropsWithChildren, useEffect } from 'react';
import { useDarkMode } from 'usehooks-ts';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Icon from './Icon';
import useAuth from '@/lib/hooks/useAuth';

export default function Layout({ children }: PropsWithChildren) {
  const { isLoggedIn, logout } = useAuth();
  const { isDarkMode, toggle } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    const body = document.body;
    body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <>
      <div
        className={`drawer ${
          router.asPath.split('/')[1] === 'admin' ? 'lg:drawer-open' : ''
        }`}
      >
        <input id="main-menu" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          {children}
        </div>
        <div className="drawer-side z-50">
          <label htmlFor="main-menu" className="drawer-overlay" />
          <div className="flex min-h-screen flex-col bg-base-100 w-80">
            <ul className="menu">
              <h2 className="menu-title">Allgemein</h2>
              <Link
                href={'/admin'}
                className="btn-ghost btn-sm btn justify-start"
              >
                <Icon name="HomeIcon" />
                Home
              </Link>
              <Link
                href={'/admin/users'}
                className="btn-ghost btn-sm btn justify-start"
              >
                <Icon name="UserGroupIcon" />
                Nutzer
              </Link>
              <Link
                href={'/admin/roles'}
                className="btn-ghost btn-sm btn justify-start"
              >
                <Icon name="KeyIcon" />
                Berechtigungen
              </Link>
            </ul>
            <ul className="menu">
              <h2 className="menu-title">Apps</h2>
              <Link
                href={'/admin/24-stunden-lauf'}
                className="btn-ghost btn-sm btn justify-start"
              >
                <Icon name="FlagIcon" />
                24 Stunden Lauf
              </Link>

              <Link
                href={'/admin/materialausgabe'}
                className="btn-ghost btn-sm btn justify-start"
              >
                <Icon name="ShoppingCartIcon" />
                Materialausgabe
              </Link>
              <Link
                href={'/admin/teams-name-generator'}
                className="btn-ghost btn-sm btn justify-start"
              >
                <Icon name="ChatIcon" />
                Teams Names Generator
              </Link>
            </ul>
            <ul className="menu">
              <h2 className="menu-title">Links</h2>
              <Link
                href={'https://birklehof.github.io/docs/'}
                target="_blank"
                className="btn-ghost btn-sm btn justify-start"
              >
                <Icon name="DocumentTextIcon" />
                Dokumentation
              </Link>
            </ul>
            <div className="flex grow" />
            <button className="btn-outline btn m-2 mb-0" onClick={toggle}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M448 256c0-106-86-192-192-192V448c106 0 192-86 192-192zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
              </svg>
              Dunkelmodus
            </button>
            <button
              disabled={!isLoggedIn}
              onClick={logout}
              className="btn-outline btn-error btn m-2"
              aria-label="Logout"
            >
              <Icon name="LogoutIcon" /> Logout
            </button>
          </div>
        </div>
      </div>
      {/* <button
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
      {children} */}
    </>
  );
}
