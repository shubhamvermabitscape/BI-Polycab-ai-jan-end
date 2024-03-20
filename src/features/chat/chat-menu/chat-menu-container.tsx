"use client";

import { useMenuContext } from "@/features/main-menu/menu-context";

export const ChatMenuContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isMenuOpen } = useMenuContext();
  // return <>{isMenuOpen ? children : null}</>;
  return (
    <div
      className={`transform transition-all duration-500 bg-red-200 z-10  ${
        isMenuOpen ? "translate-x-0 sm:w-80 w-full" : "-translate-x-full"
      }`}
    >
      {isMenuOpen ? children : null}
    </div>
  );
};
