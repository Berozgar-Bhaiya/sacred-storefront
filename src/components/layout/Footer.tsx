import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Diya & Lamps", href: "/products?category=diya" },
    { label: "Agarbatti", href: "/products?category=agarbatti" },
    { label: "Pooja Kits", href: "/products?category=pooja-kits" },
    { label: "Idols & Murtis", href: "/products?category=idols" },
  ],
  support: [
    { label: "My Orders", href: "/orders" },
    { label: "My Cart", href: "/cart" },
    { label: "Sign In", href: "/auth" },
  ],
  legal: [
    { label: "3 Days Return Policy", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      {/* Main Footer */}
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Puja Bhandar Logo" className="h-16 w-16 object-contain" />
              <span className="font-display text-xl font-bold text-foreground">
                Puja Bhandar
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Your trusted destination for authentic Hindu religious items. We bring divine 
              blessings to your doorstep with carefully curated puja essentials.
            </p>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a href="tel:+911234567890" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                +91 12345 67890
              </a>
              <a href="mailto:support@pujabhandar.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                support@pujabhandar.com
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 Temple Street, Varanasi, UP 221001</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Shop</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Support</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Puja Bhandar. All rights reserved. Made with 🙏 in India.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>💵 Cash on Delivery Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
