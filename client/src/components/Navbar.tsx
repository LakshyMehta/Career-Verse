
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, House, Briefcase, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="CareerVerse Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-blue-600">
            CareerVerse
          </span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <Link to="/" className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center">
            <House className="h-4 w-4 mr-1" />
            Home
          </Link>
          {user && (<>
            <Link to="/dashboard" className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center">
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Dashboard
            </Link>

            <Link to="/jobs" className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center">
              <Briefcase className="h-4 w-4 mr-1" />
              Jobs
            </Link>
          </>)}
        </div>

        {/* Auth buttons or user menu */}
        <div className="hidden md:block">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link to="/dashboard" className="flex w-full items-center">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>

                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={toggleMenu}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link
              to="/"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={closeMenu}
            >
              Home
            </Link>
            {user && (
              <Link
                to="/jobs"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={closeMenu}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Jobs
              </Link>
            )}
            <Link
              to="/about"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={closeMenu}
            >
              About
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="mt-4 flex flex-col space-y-2 px-3">
                <Link to="/login" onClick={closeMenu}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  <Button className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
