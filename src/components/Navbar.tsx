import { Link } from "react-router-dom";
import { Menu, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthModal from "@/components/AuthModal";

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "venue">("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem('isLoggedIn');
      setIsLoggedIn(authStatus === 'true');
    };
    
    checkAuthStatus();
    
    // Listen for storage changes (when user logs in from another tab)
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const handleAuthClick = (mode: "login" | "venue") => {
    const currentAuthStatus = localStorage.getItem('isLoggedIn') === 'true';
    if (currentAuthStatus && mode === 'venue') {
      navigate('/list-venue');
      return;
    }
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    // Optionally redirect to home page
    window.location.href = '/';
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
            {isLoggedIn && (
              <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                My Bookings
              </Link>
            )}
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleAuthClick("venue")}
            >
              List your venue
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleAuthClick("login")}
              >
                Login
              </Button>
            )}

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
                {isLoggedIn && (
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">My Bookings</Link>
                  </DropdownMenuItem>
                )}
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
      onLoginSuccess={handleLoginSuccess}
    />
  </>
  );
};

export default Navbar;
