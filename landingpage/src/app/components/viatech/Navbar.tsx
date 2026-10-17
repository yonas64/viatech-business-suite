import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Menu, X, MoonStar, Sun, Zap } from "lucide-react";

const navItems = [
  { label: "Home", path: "/" },
   { label: "Products", path: "/products" },
  { label: "Materials", path: "/materials" },
  { label: "Services", path: "/services" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Contact", path: "/contact" },

];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";

    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
          : "bg-background/80 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
        {/* Logo (inline SVG matching provided mark + name; slogan and trademark removed) */}
{/* Logo (inline SVG matching provided mark + name; horizontal edges fixed) */}
<Link to="/" className="flex items-center gap-3 group" aria-label="Viatech">
  <svg 
    width="180" 
    height="45" 
    viewBox="0 0 420 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    aria-hidden="true"
  >
    {/* 
      Orange shape: 
      Top edge is perfectly horizontal (Y is 15 for both points).
      Bottom edge is perfectly horizontal (Y is 28 for both points).
    */}
    <path d="M15 15 L95 15 L78 28 L20 28 Z" fill="#E28716" />
    
    {/* 
      Blue shape: 
      Top edge is perfectly horizontal (Y is 32 for both points). 
    */}
    <path d="M18 32 L42 32 L52 82 L38 82 Z" fill="#0091DA" />
    
    {/* VIATECH text moved to the right (X=65) to guarantee clean spacing */}
    <g transform="translate(50, 82)">
      <text 
        x="0" 
        y="0" 
        fontFamily="Impact, 'Arial Black', sans-serif" 
        fontStyle="italic"
        fontWeight="900" 
        fontSize="68" 
        letterSpacing="-1"
        fill="#000000"
      >
        VIATECH
      </text>
    </g>
  </svg>
</Link>
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                    isActive
                      ? "text-primary bg-primary/10 shadow-sm"
                      : "text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden lg:inline-flex p-2.5 rounded-full border border-border bg-card/70 text-foreground hover:bg-muted transition-colors dark:bg-slate-800/70 dark:hover:bg-slate-700"
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <MoonStar className="w-4 h-4" />}
            </button>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-[#1aa6e6] transition-all duration-200 shadow-[0_10px_24px_rgba(29,164,228,0.2)]"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Contact Us
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-card/95 backdrop-blur-md border-t border-border px-4 py-4 flex flex-col gap-1 shadow-[0_18px_30px_rgba(15,23,42,0.08)]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-semibold rounded-full transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/70 px-4 py-3 text-sm font-semibold text-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <MoonStar className="w-4 h-4" />}
            {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          </button>
          <Link
            to="/contact"
            className="mt-3 px-4 py-3 rounded-full text-sm font-semibold bg-primary text-primary-foreground text-center shadow-[0_10px_24px_rgba(29,164,228,0.2)]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </nav>
  );
}
