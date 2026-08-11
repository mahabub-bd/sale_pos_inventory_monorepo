import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Button from "../ui/button";

export const ThemeToggleButton: React.FC = () => {
  const { toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="md"
      rounded="full"
      className="relative w-12 h-12 p-0 border border-gray-200 dark:border-gray-800"
      onClick={toggleTheme}
    >
      <Sun className="hidden dark:block w-10 h-10" />
      <Moon className="dark:hidden w-10 h-10" />
    </Button>
  );
};
