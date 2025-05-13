import { Link, useLocation } from "wouter";
import { useState } from "react";
import { UserMenu } from "./user-menu";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "./theme-toggle";

export function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-background dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center w-full">
          <Link href="/">
            <h1 className="font-bold text-2xl text-primary-600 cursor-pointer">
              Trekking Tales
            </h1>
          </Link>

          <nav className="hidden md:flex ml-10 space-x-4 flex-grow">
            <Link href="/destinations">
              <a className={`px-3 py-2 font-medium text-sm ${isActive("/destinations") || isActive("/destination/*") ? "text-primary-600" : "text-neutral-700 dark:text-neutral-200 hover:text-primary-600"}`}>
                Destinations
              </a>
            </Link>
            {user && (
              <>
                <Link href="/dashboard">
                  <a className={`px-3 py-2 font-medium text-sm ${isActive("/dashboard") || isActive("/") ? "text-primary-600" : "text-neutral-700 dark:text-neutral-200 hover:text-primary-600"}`}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/bookings">
                  <a className={`px-3 py-2 font-medium text-sm ${isActive("/bookings") ? "text-primary-600" : "text-neutral-700 dark:text-neutral-200 hover:text-primary-600"}`}>
                    Bookings
                  </a>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <a className={`px-3 py-2 font-medium text-sm ${isActive("/admin") ? "text-primary-600" : "text-neutral-700 dark:text-neutral-200 hover:text-primary-600"}`}>
                      Admin
                    </a>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center">
          <div className="mr-2">
            <ThemeToggle />
          </div>
          <UserMenu />

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center ml-4">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 dark:bg-gray-800">
            <Link href="/destinations">
              <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/destinations") || isActive("/destination/*") ? "text-primary-600 bg-neutral-50 dark:bg-gray-700" : "text-neutral-700 dark:text-neutral-200 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-gray-700"}`}>
                Destinations
              </a>
            </Link>
            {user && (
              <>
                <Link href="/dashboard">
                  <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/dashboard") || isActive("/") ? "text-primary-600 bg-neutral-50 dark:bg-gray-700" : "text-neutral-700 dark:text-neutral-200 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-gray-700"}`}>
                    Dashboard
                  </a>
                </Link>
                <Link href="/bookings">
                  <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/bookings") ? "text-primary-600 bg-neutral-50 dark:bg-gray-700" : "text-neutral-700 dark:text-neutral-200 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-gray-700"}`}>
                    Bookings
                  </a>
                </Link>
                <Link href="/posts">
                  <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/posts") ? "text-primary-600 bg-neutral-50 dark:bg-gray-700" : "text-neutral-700 dark:text-neutral-200 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-gray-700"}`}>
                    Travel Posts
                  </a>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <a className={`block px-3 py-2 rounded-md text-base font-medium ${isActive("/admin") ? "text-primary-600 bg-neutral-50 dark:bg-gray-700" : "text-neutral-700 dark:text-neutral-200 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-gray-700"}`}>
                      Admin
                    </a>
                  </Link>
                )}
              </>
            )}
            <hr className="my-2 border-neutral-200 dark:border-gray-700" />
            <Link href="/profile">
              <a className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-gray-700">
                Profile
              </a>
            </Link>
            <div className="px-3 py-2">
              <div className="flex items-center">
                <span className="text-base font-medium text-neutral-700 dark:text-neutral-200 mr-2">Theme:</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}