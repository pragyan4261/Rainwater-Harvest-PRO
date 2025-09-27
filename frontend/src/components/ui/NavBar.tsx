import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, DropletIcon, MapIcon, FileTextIcon, BookOpenIcon, SettingsIcon, MenuIcon, XIcon, BarChart2Icon, UsersIcon, LogOutIcon } from 'lucide-react';
import { useTranslation } from "react-i18next";
import {useAuth} from '../../context/AuthContext';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavBar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {logout} = useAuth();

  // REMOVED: The useEffect hook that was causing the loading issue.
  // The external script from noupe.com is no longer being loaded.

  const navItems: NavItem[] = [
    { to: '/dashboard', icon: <HomeIcon size={20} />, label: t("navbar.home") },
    { to: '/assessment', icon: <DropletIcon size={20} />, label: t("navbar.assessment") },
    { to: '/map', icon: <MapIcon size={20} />, label: t("navbar.map") },
    { to: '/reports', icon: <FileTextIcon size={20} />, label: t("navbar.reports") },
    { to: '/knowledge', icon: <BookOpenIcon size={20} />, label: t("navbar.learn") },
    { to: '/community', icon: <UsersIcon size={20} />, label: t("navbar.community") },
    { to: '/roof-analysis', icon: <BarChart2Icon size={20} />, label: t("navbar.roofAI") },
    { to: '/settings', icon: <SettingsIcon size={20} />, label: t("navbar.settings") }
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-[1100]">
        <div className="flex items-center justify-between p-4">
          <Link to="/dashboard" className="flex items-center">
            <DropletIcon className="h-6 w-6 text-blue-600" />
            <span className="ml-2 font-semibold text-lg text-gray-800">
              RainWise
            </span>
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 focus:outline-none">
            {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="bg-white shadow-md pt-2 pb-4">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center py-3 px-4 ${isActive(item.to) ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center w-full text-left py-3 px-4 text-gray-700 hover:bg-gray-50"
            >
              <LogOutIcon size={20} className="text-red-500" />
              <span className="ml-3 text-red-500">{t("navbar.logout", "Logout")}</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:bg-white md:border-r md:border-gray-200 md:w-64 md:shadow-sm z-[1100]">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center">
            <DropletIcon className="h-6 w-6 text-blue-600" />
            <span className="ml-2 font-semibold text-lg text-gray-800">
              RainWise
            </span>
          </Link>
        </div>
        <nav className="flex-1 pt-4">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center py-3 px-6 ${isActive(item.to) ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-left py-3 px-6 text-gray-700 hover:bg-gray-50 rounded-md"
          >
            <LogOutIcon size={20} className="text-red-500" />
            <span className="ml-3 text-red-500 font-medium">{t("navbar.logout", "Logout")}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default NavBar;