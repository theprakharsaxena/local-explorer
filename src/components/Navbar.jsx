import { Link, useLocation } from "react-router-dom";
import { MapPin, Heart, Moon, Sun, Search } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <MapPin className="w-6 h-6" />
            <span className="hidden sm:block">Local Explorer</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/explore" className={`flex items-center gap-1 font-medium transition-colors hover:text-primary ${pathname === '/explore' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Search className="w-4 h-4" />
              <span>Explore</span>
            </Link>

            <Link to="/favorites" className={`flex items-center gap-1 font-medium transition-colors hover:text-primary ${pathname === '/favorites' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Heart className="w-4 h-4" />
              <span>Favorites</span>
            </Link>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Toggle Dark Mode">
              {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
