import React, { useContext, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/login");
  };

  const isHomePage = location.pathname === "/";
  const isProfilePage = location.pathname === "/profile";
  const profileNavLabel = isHomePage ? "Profile" : isProfilePage ? "Home" : "Profile";
  const profileNavTarget = isHomePage ? "/profile" : isProfilePage ? "/" : "/profile";

  const handleProfileNav = () => {
    setShowDropdown(false);
    navigate(profileNavTarget);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
         
            <h1 className="text-3xl font-extrabold tracking-tight text-cyan-700">QuickTalk</h1>
         

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link to="/invitations" className="transition hover:text-cyan-700">Invitations</Link>
            <Link to="/personalchat" className="transition hover:text-cyan-700">1-1 Chat</Link>
            <Link to="/group-chat" className="transition hover:text-cyan-700">Group Chat</Link>
            <Link to="/notifications" className="transition hover:text-cyan-700">Notifications</Link>
          </nav>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-cyan-400"
            >
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={`${user.name} avatar`}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600 text-base font-semibold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <span>{user?.name || "Guest"}</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-3 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
               <button
                  onClick={handleProfileNav}
                  className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  {profileNavLabel}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
  );
};

export default Header;
