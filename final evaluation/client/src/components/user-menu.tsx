import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { LogOut, User, Settings } from "lucide-react";

export function UserMenu() {
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);
  
  // Get initials for avatar
  const getInitials = () => {
    if (!user?.name) return "U";
    
    const nameParts = user.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center space-x-4">
        <div className="hidden md:block">
          <p className="text-sm font-medium text-neutral-700">{user?.name}</p>
          <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
        </div>
        <button 
          className="bg-neutral-100 flex items-center justify-center h-10 w-10 rounded-full overflow-hidden border-2 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={() => setIsOpen(!isOpen)}>
          <span className="text-sm font-medium text-neutral-600">{getInitials()}</span>
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <Link href="/profile">
            <a className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </a>
          </Link>
          <Link href="/settings">
            <a className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </a>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full text-left block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
