const NavbarData = [
   {
    title: "Home",
    path: "/",
  },
  {
    title: "About Us",
    path: "about-us",
  },
  {
    title: "Lottery",
    path: "lottery",
    submenu: [
      {
        title: "Lottery",
        path: "lottery",
      },
      {
        title: "Lottery Winners",
        path: "lottery-winner",
      },
      {
        title: "Lottery Results",
        path: "lottery-result",
      },
    ],
  },
  {
    title: "Winners",
    path: "lottery-winner",
  },
  {
    title: "Results",
    path: "lottery-result",
  },
  {
    title: "Contact Us",
    path: "contact-us",
  },
];

export default NavbarData;
