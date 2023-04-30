import React, { PropsWithChildren, useEffect } from "react";
import Icon from "./Icon";
import { useDarkMode } from "usehooks-ts";
import { useRouter } from "next/router";
import AdminMenu from "./AdminMenu";

const Layout = ({ children }: PropsWithChildren) => {
  const { isDarkMode, toggle } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    const body = document.body;
    body.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <>
      <button
        className="hidden md:flex btn btn-square btn-ghost absolute top-3 left-3"
        onClick={toggle}
      >
        {isDarkMode ? <Icon name="MoonIcon" /> : <Icon name="SunIcon" />}
      </button>

      {router.asPath.split("/")[1] === "admin" && <AdminMenu />}
      {children}
    </>
  );
};
export default Layout;
