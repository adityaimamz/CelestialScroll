import { Link, useLocation, useNavigate } from "react-router-dom";
import { Github, Twitter, MessageCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const footerLinks = {
    discover: [
      { label: t("footer.topNovels"), href: "#popular" },
      { label: t("footer.newReleases"), href: "#new" },
      { label: t("footer.popularGenres"), href: "#genres" },
      { label: t("footer.announcements"), href: "#announcements" },
    ],
    menu: [
      { label: t("footer.home"), href: "/" },
      { label: t("footer.series"), href: "/series" },
      { label: t("footer.bookmarks"), href: "/bookmarks" },
      { label: t("footer.genres"), href: "/genres" },
    ],
    legal: [
      { label: t("footer.terms"), href: "/" },
      { label: t("footer.privacy"), href: "/" },
      { label: t("footer.dmca"), href: "/" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: MessageCircle, href: "#", label: "Discord" },
    { icon: Github, href: "#", label: "GitHub" },
  ];

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const id = href.substring(1);

      if (location.pathname === "/") {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate(`/${href}`);
      }
    }
  };

  return (
    <footer className="bg-surface border-t border-border mt-16">
      <div className="section-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                  <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-lg font-bold text-foreground">
                Celestial<span className="text-primary">Scrolls</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t("footer.description")}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("footer.discover")}</h4>
            <ul className="space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("footer.menu")}</h4>
            <ul className="space-y-2">
              {footerLinks.menu.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t("footer.legal")}</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-justify">
            {t("footer.rights").replace("{year}", new Date().getFullYear().toString())}
          </p>
          {/* <p className="text-xs text-muted-foreground">
            Made for 
          </p> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
