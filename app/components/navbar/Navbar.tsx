"use client";

import Container from "../Container";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import NotificationButton from "./NotificationButton";
import { SafeUser } from "@/app/types";
import AdvancedSearch from "./AdvancedSearch";
import { usePathname } from "next/navigation";

interface NavbarProps {
  currentUser?: SafeUser | null;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className="fixed w-full bg-white  shadow-sm z-10">
      <div className="py-4 border-b-[1px]">
        <Container>
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
            <Logo />
            <div className="flex flex-row items-center gap-3">
              <NotificationButton currentUser={currentUser} />
              <UserMenu currentUser={currentUser} />
            </div>
          </div>
        </Container>
      </div>
      {isHomePage && (
        <div className="py-4 -z-10">
          <AdvancedSearch />
        </div>
      )}
    </div>
  );
};

export default Navbar;
