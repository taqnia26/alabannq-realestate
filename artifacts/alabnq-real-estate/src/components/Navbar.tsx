import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { SiteSearch } from "./SiteSearch";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/properties", label: "العقارات" },
    { href: "/about", label: "عن الشركة" },
    { href: "/articles", label: "الأخبار" },
    { href: "/contact", label: "تواصل معنا" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur shadow-sm">
      <div className="container mx-auto px-4 min-h-24 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3 group" aria-label="العودة إلى الرئيسية">
          <BrandLogo className="h-20 w-20 rounded-md shadow-sm ring-1 ring-accent/30" />
          <span className="text-base font-extrabold leading-tight text-primary md:hidden lg:block lg:text-lg">شركة العبنق<br />العقارية</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 xl:gap-7">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                location === link.href ? "text-accent" : "text-foreground/80"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <div className="hidden xl:block w-[270px]">
            <SiteSearch mode="navbar" />
          </div>
          <Link href="/contact" className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", "bg-accent text-accent-foreground shadow hover:bg-accent/90 h-11 px-6")}>
            احجز استشارة
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-primary p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-lg py-4 px-4 flex flex-col gap-4">
          <SiteSearch mode="mobile" className="mb-1" />
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block py-3 px-4 rounded-md text-base font-medium transition-colors",
                location === link.href ? "bg-accent/20 text-primary" : "text-foreground hover:bg-secondary"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/contact" className={cn("mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", "bg-accent text-accent-foreground shadow hover:bg-accent/90 h-12 w-full")} onClick={() => setIsMobileMenuOpen(false)}>
            احجز استشارة
          </Link>
        </div>
      )}
    </header>
  );
}
