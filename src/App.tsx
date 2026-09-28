import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginCard } from "./components/auth/LoginCard";
import { RegisterCard } from "./components/auth/RegisterCard";
import { EmailVerificationBanner } from "./components/auth/EmailVerificationBanner";
import { Navbar } from "./components/common/Navbar";
import { UserManagementScreen } from "./components/dashboard/UserManagementScreen";
import { EmailVerificationCenter } from "./components/dashboard/EmailVerificationCenter";
import { ProfileSettingsScreen } from "./components/dashboard/ProfileSettingsScreen";
import {
  Flame,
  ShieldCheck,
  MailCheck,
  Users,
  Loader2,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { defaultFirebaseConfig } from "./firebase";

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [currentTab, setCurrentTab] = useState<"users" | "verification" | "profile">("users");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 animate-pulse">
          <Flame className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Connecting to Firebase Auth...</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 font-mono">{defaultFirebaseConfig.projectId}</p>
      </div>
    );
  }

  // Not logged in: Show Login & Register screens
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                Screen User Hub
              </span>
              <span className="block text-[10px] text-slate-400 font-mono">
                Project: {defaultFirebaseConfig.projectId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                authMode === "login"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                authMode === "register"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Register
            </button>
          </div>
        </header>

        {/* Auth Body */}
        <main className="my-auto py-8 flex flex-col items-center justify-center">
          <div className="mb-6 text-center max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Firebase Auth & Email Verification</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              User Management System
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
              Secure authentication, verified user directory, and account lifecycle management
            </p>
          </div>

          {authMode === "login" ? (
            <LoginCard onSwitchToRegister={() => setAuthMode("register")} />
          ) : (
            <RegisterCard onSwitchToLogin={() => setAuthMode("login")} />
          )}

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl w-full mt-10 text-xs text-slate-600">
            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <MailCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 block">Email Verification</span>
                <span className="text-[11px] text-slate-400">One-click activation links</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 block">Screen Directory</span>
                <span className="text-[11px] text-slate-400">Role & status management</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/60 shadow-2xs flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 block">Firebase Security</span>
                <span className="text-[11px] text-slate-400">Google Cloud authentication</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-slate-400">
          Firebase Web SDK 11 • Project: <span className="font-mono text-slate-600 font-medium">{defaultFirebaseConfig.projectId}</span>
        </footer>
      </div>
    );
  }

  // Logged in: Dashboard view with Navbar & Tabs
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Email verification reminder banner (only if not verified) */}
      <EmailVerificationBanner />

      {/* Main Navbar */}
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Screen Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === "users" && <UserManagementScreen />}
        {currentTab === "verification" && <EmailVerificationCenter />}
        {currentTab === "profile" && <ProfileSettingsScreen />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/70 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-600">Connected to Firebase Auth</span>
            <span className="font-mono text-slate-400">({defaultFirebaseConfig.projectId})</span>
          </div>
          <div>Screen User Management &amp; Email Verification System</div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
