import { Menu, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import Button from "../ui/button";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";

// Define the interface for the props
interface HeaderProps {
  onClick?: () => void;
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClick, onToggle }) => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <Button
            variant="ghost"
            size="md"
            className="lg:hidden w-10 h-10 p-0"
            onClick={onToggle}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Button
            onClick={onClick}
            variant="outline"
            size="md"
            className="hidden lg:flex w-11 h-11 p-0 border-gray-200 dark:border-gray-800"
          >
            <Menu className="w-4 h-4" />
          </Button>

          <Link to="/" className="lg:hidden">
            <img
              className="dark:hidden"
              src="./images/logo/salepos_logo.png"
              alt="Logo"
            />
            <img
              className="hidden dark:block"
              src="./images/logo/salepos_white_logo.png"
              alt="Logo"
            />
          </Link>

          <Button
            onClick={toggleApplicationMenu}
            variant="ghost"
            size="md"
            className="lg:hidden w-10 h-10 p-0"
          >
            <MoreVertical className="w-6 h-6" />
          </Button>
        </div>

        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
