import { Link, useLocation } from "react-router-dom";
import { FileText, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "New Application", icon: FileText },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glass header */}
      <div className="bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="container flex h-16 items-center justify-between">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-90 transition"
          >
            <img
              src="/favicon.ico"
              alt="CreditAI Logo"
              className="h-9 w-9 rounded-lg bg-white/90 p-1"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold text-white">
                CreditAI
              </span>
              <span className="text-xs text-white/60">
                Smart Evaluation
              </span>
            </div>
          </Link>

          {/* NAVIGATION */}
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-md"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

        </div>
      </div>
    </header>
  );
};

export default Header;
