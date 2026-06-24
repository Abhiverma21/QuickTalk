import React, { useContext, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
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
    <header className="sticky top-0 z-30 relative border-b border-slate-200 bg-white/95 backdrop-blur px-4 py-4 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-cyan-700">QuickTalk</h1>
          <button
            type="button"
            onClick={() => setShowMobileNav((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:border-cyan-400 md:hidden"
          >
            <span className="text-lg">☰</span>
          </button>
        </div>

          {showMobileNav && (
            <div className="absolute left-4 right-4 top-full z-20 mt-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg md:hidden">
              <div className="flex flex-col gap-3 text-sm text-slate-700">
                <Link onClick={() => setShowMobileNav(false)} to="/invitations" className="block rounded-2xl px-4 py-3 hover:bg-slate-100">Invitations</Link>
                <Link onClick={() => setShowMobileNav(false)} to="/personalchat" className="block rounded-2xl px-4 py-3 hover:bg-slate-100">1-1 Chat</Link>
                <Link onClick={() => setShowMobileNav(false)} to="/group-chat" className="block rounded-2xl px-4 py-3 hover:bg-slate-100">Group Chat</Link>
                <Link onClick={() => setShowMobileNav(false)} to="/notifications" className="block rounded-2xl px-4 py-3 hover:bg-slate-100">Notifications</Link>
              </div>
            </div>
          )}

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link to="/invitations" className="transition hover:text-cyan-700">Invitations</Link>
            <Link to="/personalchat" className="transition hover:text-cyan-700">1-1 Chat</Link>
            <Link to="/group-chat" className="transition hover:text-cyan-700">Group Chat</Link>
            <Link to="/notifications" className="transition hover:text-cyan-700">Notifications</Link>
          </nav>

          <div className="relative self-end md:self-auto">
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
