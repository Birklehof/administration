import Link from 'next/link';
import Icon from './Icon';

interface NavBarProps {
  title: string;
  backLink?: string;
}

export default function NavBar({ title, backLink }: NavBarProps) {
  return (
    <>
      <div className="navbar min-h-0 rounded-box gap-2 bg-base-100 shadow-md">
        <div className="navbar-start">
          {backLink ? (
            <Link href={backLink} className="btn-ghost btn-square btn btn-sm">
              <Icon name="ArrowLeftIcon" />
            </Link>
          ) : (
            <label
              htmlFor="main-menu"
              className="btn-ghost btn-square btn-sm btn lg:hidden"
            >
              <Icon name="MenuIcon" />
            </label>
          )}
        </div>
        <div className="navbar-center">
          <p className="btn-ghost btn btn-sm text-xl normal-case no-animation">{title}</p>
        </div>
        <div className="navbar-end" />
      </div>
    </>
  );
}
