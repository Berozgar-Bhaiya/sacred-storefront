import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingBag,
  LogOut,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Products", path: "/admin/products", icon: Package },
  { title: "Categories", path: "/admin/categories", icon: FolderOpen },
  { title: "Orders", path: "/admin/orders", icon: ShoppingBag },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-sm">🙏</span>
            </div>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Link to="/">
              <Button variant="ghost" className="mt-2 w-full justify-start">
                ← Back to Store
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
