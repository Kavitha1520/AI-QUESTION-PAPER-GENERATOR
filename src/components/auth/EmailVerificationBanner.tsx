import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { MailCheck, RefreshCw, Send, CheckCircle, AlertTriangle, X } from "lucide-react";

export const EmailVerificationBanner: React.FC = () => {
  const { user, isEmailVerified, resendVerificationEmail, reloadUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!user || isEmailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setMessage(null);
    const result = await resendVerificationEmail();
    setResending(false);
    if (result.success) {
      setCooldown(60);
      setMessage({ text: result.message, type: "success" });
    } else {
      setMessage({ text: result.message, type: "error" });
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage(null);
    const verified = await reloadUser();
    setChecking(false);
    if (verified) {
      setMessage({ text: "Email verified successfully! You now have full access.", type: "success" });
    } else {
      setMessage({
        text: "Email is not verified yet. Please click the link in your inbox or spam folder.",
        type: "info",
      });
    }
  };

  return (
    <aside aria-label="Email verification notice" className="bg-amber-500/10 border-b border-amber-300/40 text-amber-950 px-4 py-3 relative transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-800 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold flex items-center gap-2">
              <span>Action Required: Please verify your email</span>
              <span className="text-xs bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-medium">
                Unverified
              </span>
            </div>
            <p className="text-xs text-amber-800/90 mt-0.5">
              A verification link was sent to <strong className="font-semibold text-amber-950">{user.email}</strong>. Please confirm your email to unlock all user features.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 text-amber-900 rounded-lg hover:bg-amber-50 disabled:opacity-60 transition shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Email"}
          </button>

          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-60 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking..." : "I've Verified"}
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 text-amber-700 hover:text-amber-900 rounded-lg hover:bg-amber-200/50 transition ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {message && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-200/60 flex items-center gap-2 text-xs">
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : message.type === "error" ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <MailCheck className="w-4 h-4 text-amber-700 shrink-0" />
          )}
          <span
            className={
              message.type === "success"
                ? "text-emerald-700 font-medium"
                : message.type === "error"
                ? "text-rose-700 font-medium"
                : "text-amber-800"
            }
          >
            {message.text}
          </span>
        </div>
      )}
    </aside>
  );
};
