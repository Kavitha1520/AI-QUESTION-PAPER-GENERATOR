import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateEmail } from "firebase/auth";
import { auth, getAuthErrorMessage } from "../../firebase";
import {
  MailCheck,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  HelpCircle,
  Inbox,
  AlertTriangle,
  Edit3,
  ExternalLink,
  Info
} from "lucide-react";

export const EmailVerificationCenter: React.FC = () => {
  const { user, isEmailVerified, resendVerificationEmail, reloadUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Email update modal
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendVerification = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setFeedback(null);
    const result = await resendVerificationEmail();
    setResending(false);
    if (result.success) {
      setCooldown(60);
      setFeedback({ text: result.message, type: "success" });
    } else {
      setFeedback({ text: result.message, type: "error" });
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setFeedback(null);
    const verified = await reloadUser();
    setChecking(false);
    if (verified) {
      setFeedback({
        text: "Congratulations! Your email has been verified and confirmed.",
        type: "success"
      });
    } else {
      setFeedback({
        text: "Email is not marked as verified yet. Please click the link received in your email or wait a moment for the server to process.",
        type: "info"
      });
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newEmail.trim()) return;

    setUpdatingEmail(true);
    try {
      await updateEmail(auth.currentUser, newEmail.trim());
      await reloadUser();
      setShowEditEmail(false);
      setFeedback({
        text: `Email address updated to ${newEmail.trim()}. We suggest resending the verification email now.`,
        type: "success"
      });
      setNewEmail("");
    } catch (err: any) {
      setFeedback({
        text: getAuthErrorMessage(err),
        type: "error"
      });
    } finally {
      setUpdatingEmail(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isEmailVerified
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              {isEmailVerified ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <Clock className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">Email Verification Status</h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isEmailVerified
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {isEmailVerified ? "Verified" : "Action Required"}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>Account Email:</span>
                <strong className="text-slate-800 font-semibold">{user?.email}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setNewEmail(user?.email || "");
                    setShowEditEmail(true);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1 ml-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Change Email</span>
                </button>
              </p>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checking}
              className="flex-1 sm:flex-initial py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              <span>{checking ? "Checking..." : "Refresh Status"}</span>
            </button>

            <button
              type="button"
              onClick={handleSendVerification}
              disabled={resending || cooldown > 0 || isEmailVerified}
              className="flex-1 sm:flex-initial py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                {isEmailVerified
                  ? "Email Already Verified"
                  : resending
                  ? "Dispatching..."
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Send Verification Email"}
              </span>
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`mt-4 p-4 rounded-xl text-xs flex items-start gap-2.5 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : feedback.type === "error"
                ? "bg-rose-50 text-rose-800 border border-rose-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            ) : feedback.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            )}
            <span className="leading-relaxed">{feedback.text}</span>
          </div>
        )}

        {/* Informative Step Guide */}
        <div className="mt-8">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-indigo-600" />
            <span>How Firebase Email Verification Works</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mb-3">
                1
              </div>
              <h5 className="font-semibold text-slate-900 text-sm mb-1">Automated Dispatch</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                When you register or click &quot;Send Verification Email&quot;, Firebase Authentication securely signs and dispatches an email via Google Cloud servers.
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mb-3">
                2
              </div>
              <h5 className="font-semibold text-slate-900 text-sm mb-1">Click the Link</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                Open your email inbox (e.g. Gmail, Outlook) and click the one-time verification link. This verifies your ownership on Firebase servers.
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mb-3">
                3
              </div>
              <h5 className="font-semibold text-slate-900 text-sm mb-1">Click &quot;Refresh Status&quot;</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                Return to this screen and tap &quot;Refresh Status&quot;. The app fetches your updated verified state directly from Firebase Auth tokens.
              </p>
            </div>
          </div>
        </div>

        {/* Troubleshooting Box */}
        <div className="mt-8 bg-amber-50/60 border border-amber-200/70 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs space-y-2 text-amber-900">
              <h5 className="font-bold text-sm text-amber-950">Email Delivery Troubleshooting:</h5>
              <ul className="list-disc pl-4 space-y-1 text-amber-800">
                <li>
                  <strong>Check your Spam or Junk folder:</strong> Verification emails from new Firebase projects sometimes land in Spam until whitelisted.
                </li>
                <li>
                  <strong>Sender Domain:</strong> The verification email originates from Firebase Authentication domain{" "}
                  <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[11px]">
                    noreply@ai-question-paper-genera-3d772.firebaseapp.com
                  </code>
                </li>
                <li>
                  <strong>Rate Limiting:</strong> Firebase protects against spamming by throttling repeated emails to the same recipient. Use the 60-second cooldown timer between requests.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Change Email Modal */}
      {showEditEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Change Email Address</h3>
            <p className="text-xs text-slate-500 mb-4">
              Update the email address associated with your account. A new verification link will be required.
            </p>

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@example.com"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditEmail(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingEmail}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                >
                  {updatingEmail ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Email</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
