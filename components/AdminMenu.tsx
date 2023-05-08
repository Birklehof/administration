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
            name: "Nutzer",
            href: "/admin/users",
            icon: "UserGroupIcon",
          },
          {
            name: "Berechtigungen",
            href: "/admin/roles",
            icon: "KeyIcon",
          },
          {
            name: "24 Stunden Lauf",
            href: "/admin/24-stunden-lauf",
            icon: "FlagIcon",
          },
        ]}
      />
    </>
  );
}
