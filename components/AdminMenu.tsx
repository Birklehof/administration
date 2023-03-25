import Menu from "./Menu";

export default function AdminMenu() {
  return (
    <>
      <Menu
        navItems={[
          {
            name: "Home",
            href: "/admin",
            icon: "HomeIcon",
          },
          {
            name: "Users",
            href: "/admin/users",
            icon: "UserGroupIcon",
          },
          {
            name: "roles",
            href: "/admin/roles",
            icon: "KeyIcon",
          },
        ]}
      />
    </>
  );
}
