import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Menu, X, BookOpen, Bookmark, Home, Layers, LogOut, Settings, Shield, Languages, Send } from "lucide-react";
import { BarLoader } from "@/components/ui/BarLoader";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useLanguage } from "@/contexts/LanguageContext";


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  const { t, languageFilter, setLanguageFilter } = useLanguage();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(Tables<"novels"> & { chapters_count: number })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null); // 1. TAMBAHKAN INI

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        setShowResults(true);
        try {
          const { data, error } = await supabase
            .from("novels")
            .select("*, chapters(count)")
            .eq("chapters.language", "id")
            .ilike("title", `%${searchQuery}%`)
            .neq("title", "Request Novel")
            .limit(5);

          if (error) throw error;

          if (data) {
            const formatted = data.map(novel => ({
              ...novel,
              chapters_count: novel.chapters?.[0]?.count || 0
            }));
            setSearchResults(formatted);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInsideDesktop = searchRef.current && searchRef.current.contains(event.target as Node);
      const clickedInsideMobile = mobileSearchRef.current && mobileSearchRef.current.contains(event.target as Node);

      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { label: t("nav.home"), href: "/", icon: Home },
    { label: t("nav.series"), href: "/series", icon: BookOpen },
    { label: t("nav.bookmarks"), href: "/bookmarks", icon: Bookmark },
    { label: t("nav.genres"), href: "/genres", icon: Layers },
    { label: t("nav.request"), href: "/request", icon: Send },
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
          <div className="hidden xl:flex items-center gap-1">
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
            <div className="hidden xl:flex items-center relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("nav.search")}
                  className="w-64 pl-10 bg-surface border-border focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchQuery) setShowResults(true); }}
                />
                {/* Loader removed from here */}
              </div>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-7 right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50 -translate-x-8">
                  {isSearching ? (
                    <div className="p-4 flex justify-center">
                      <BarLoader />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((novel) => (
                        <Link
                          key={novel.id}
                          to={`/series/${novel.slug}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            setShowResults(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden">
                            <img src={novel.cover_url || "/placeholder.jpg"} alt={novel.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium leading-tight line-clamp-2 mb-1">{novel.title}</h4>
                            <p className="text-xs text-muted-foreground">{novel.chapters_count} {t("nav.chapters")}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    !isSearching && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {t("nav.noResults")}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Search Toggle - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                  <Languages className="w-5 h-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={languageFilter} onValueChange={(val) => setLanguageFilter(val as 'id' | 'en')}>
                  <DropdownMenuRadioItem value="id" className="gap-2">
                    <span>🇮🇩</span> {t('index.language.id')}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="en" className="gap-2">
                    <span>🇺🇸</span> {t('index.language.en')}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification Dropdown */}
            {user && <NotificationDropdown />}

            {/* Auth Buttons */}
            <div className="hidden xl:flex items-center gap-2">
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
                    {(isAdmin || userRole === "moderator") && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>{t("nav.admin")}</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t("nav.settings")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("nav.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">{t("nav.signIn")}</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="default" size="sm">{t("nav.signUp")}</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="xl:hidden py-3 border-t border-border animate-fade-in relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("nav.search")}
                className="w-full pl-10 bg-surface border-border"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Loader removed from here */}
            </div>

            {/* Mobile Search Results */}
            {isSearchOpen && (
              <div
                className="xl:hidden py-3 border-t border-border animate-fade-in relative"
                ref={mobileSearchRef}
              >
                <div className="relative">
                </div>

                {/* Mobile Search Results */}
                {showResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 flex justify-center"><BarLoader /></div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((novel) => (
                          <Link
                            key={novel.id}
                            to={`/series/${novel.slug}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/series/${novel.slug}`);

                              setShowResults(false);
                              setSearchQuery("");
                              setIsSearchOpen(false);
                            }}
                          >
                            <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden">
                              <img src={novel.cover_url || "/placeholder.jpg"} alt={novel.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium leading-tight line-clamp-2 mb-1">{novel.title}</h4>
                              <p className="text-xs text-muted-foreground">{novel.chapters_count} {t("nav.chapters")}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      !isSearching && <div className="p-4 text-center text-sm text-muted-foreground">{t("nav.noResults")}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              <div className="hidden md:flex flex-col gap-1">
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
              </div>

              <div className="border-t border-border my-2 hidden md:block" />

              <div className="px-4 md:mt-0 mt-4">
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
                    <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        {t("nav.settings")}
                      </Button>
                    </Link>
                    {(isAdmin || userRole === "moderator") && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Shield className="mr-2 h-4 w-4" />
                          {t("nav.admin")}
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("nav.logout")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1">
                      <Button variant="outline" className="w-full">{t("nav.signIn")}</Button>
                    </Link>
                    <Link to="/register" className="flex-1">
                      <Button className="w-full">{t("nav.signUp")}</Button>
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
}
