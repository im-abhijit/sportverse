import { Link } from "react-router-dom";
import { Menu, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthModal from "@/components/AuthModal";

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "venue">("login");

  const handleAuthClick = (mode: "login" | "venue") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="gradient-primary rounded-xl px-3 py-2">
              <span className="text-xl font-bold text-primary-foreground">Sportverse</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link to="/venues" className="text-sm font-medium transition-colors hover:text-primary">
              Explore
            </Link>
            <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              My Bookings
            </Link>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleAuthClick("venue")}
            >
              List your venue
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleAuthClick("login")}
            >
              Login
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover">
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer">Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/venues" className="cursor-pointer">Explore</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">My Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => handleAuthClick("venue")}
                >
                  List your venue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
    
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      initialMode={authMode}
    />
  </>
  );
};

export default Navbar;
