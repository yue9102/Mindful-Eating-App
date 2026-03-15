import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, BookOpen, Settings } from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { path: "/", icon: Home, label: "首页" },
  { path: "/diary", icon: BookOpen, label: "日记" },
  { path: "/settings", icon: Settings, label: "设置" },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const hideNav = location.pathname === "/session" || location.pathname === "/summary";

  return (
    <div className="flex flex-col w-[393px] h-[852px] mx-auto bg-background relative overflow-hidden border border-border shadow-lg">
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      {!hideNav && (
        <nav className="absolute bottom-0 left-0 right-0 flex items-center justify-around bg-card/80 backdrop-blur-md py-2.5 px-4 shrink-0 border-t border-border z-50">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-colors relative ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 bg-primary/8 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon size={19} className="relative z-10" strokeWidth={isActive ? 2 : 1.5} />
                <span className="relative z-10" style={{ fontSize: 11 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}