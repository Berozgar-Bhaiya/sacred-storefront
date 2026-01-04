import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingBag,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Products", path: "/admin/products", icon: Package },
  { title: "Categories", path: "/admin/categories", icon: FolderOpen },
  { title: "Orders", path: "/admin/orders", icon: ShoppingBag },
  { title: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <img src={logo} alt="Puja Bhandar Logo" className="h-8 w-8 object-contain" />
        <span className="font-display text-lg font-bold text-foreground">
          Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              isActive(item.path)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            signOut();
            setIsMobileMenuOpen(false);
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
          <Button variant="ghost" className="mt-2 w-full justify-start">
            ← Back to Store
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Puja Bhandar Logo" className="h-8 w-8 object-contain" />
          <span className="font-display text-lg font-bold text-foreground">
            Admin
          </span>
        </div>
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}