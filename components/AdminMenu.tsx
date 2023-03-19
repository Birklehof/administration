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
        ]}
      />
    </>
  );
}
