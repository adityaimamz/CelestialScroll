import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Menu, X, BookOpen, Bookmark, Home, Layers, User, LogOut, Settings, Shield } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Series", href: "/series", icon: BookOpen },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    // { label: "Resources", href: "/resources", icon: Layers },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-surface border-b border-border">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
              <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              Celestial<span className="text-primary">Scrolls</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Search - Desktop */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search novels..."
                  className="w-64 pl-10 bg-surface border-border focus:border-primary"
                />
              </div>
            </div>

            {/* Search Toggle - Mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || "User"} />
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.user_metadata?.username || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem> */}
                    {isAdmin && (
                        <DropdownMenuItem asChild>
                            <Link to="/admin/novels" className="cursor-pointer">
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Admin Dashboard</span>
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="default" size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden py-3 border-t border-border animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search novels..."
                className="w-full pl-10 bg-surface border-border"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              
              <div className="mt-4 px-4 border-t border-border pt-4">
                {user ? (
                   <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-3 px-2 py-2 mb-2">
                           <Avatar className="h-8 w-8 border border-border">
                                <AvatarImage src={user.user_metadata?.avatar_url} />
                                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{user.user_metadata?.username || "User"}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                       </div>
                       <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                           <Button variant="ghost" className="w-full justify-start">
                               <User className="mr-2 h-4 w-4" />
                               Profile
                           </Button>
                       </Link>
                        {isAdmin && (
                            <Link to="/admin/novels" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Admin
                                </Button>
                            </Link>
                        )}
                        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleSignOut}>
                           <LogOut className="mr-2 h-4 w-4" />
                           Log out
                        </Button>
                   </div>
                ) : (
                    <div className="flex gap-2">
                        <Link to="/login" className="flex-1">
                        <Button variant="outline" className="w-full">Sign In</Button>
                        </Link>
                        <Link to="/register" className="flex-1">
                        <Button className="w-full">Sign Up</Button>
                        </Link>
                    </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
