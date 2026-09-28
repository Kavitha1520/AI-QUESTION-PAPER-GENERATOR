import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  MailCheck,
  User,
  LogOut,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Layers
} from "lucide-react";

interface NavbarProps {
  currentTab: "users" | "verification" | "profile";
  onTabChange: (tab: "users" | "verification" | "profile") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { user, userProfile, isEmailVerified, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  Screen Auth
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200/70 px-2 py-0.5 rounded-full">
                  Firebase
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium -mt-0.5 hidden sm:block">
                User Management & Verification
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => onTabChange("users")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentTab === "users"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Directory</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange("verification")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer relative ${
                currentTab === "verification"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <MailCheck className="w-4 h-4" />
              <span>Email Verification</span>
              {!isEmailVerified && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange("profile")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                currentTab === "profile"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Profile & Settings</span>
              <span className="md:hidden">Profile</span>
            </button>
          </nav>

          {/* User Status & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-right">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {userProfile?.displayName || user?.displayName || user?.email?.split("@")[0]}
                </div>
                <div className="flex items-center gap-1 justify-end">
                  {isEmailVerified ? (
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {userProfile?.displayName?.charAt(0).toUpperCase() ||
                  user?.email?.charAt(0).toUpperCase() ||
                  "U"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut()}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
