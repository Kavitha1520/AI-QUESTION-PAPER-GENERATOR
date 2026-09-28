import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { UserProfile } from "../../types";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  Plus,
  Mail,
  MoreVertical,
  Calendar,
  KeyRound,
  ExternalLink,
  ChevronRight,
  ShieldAlert
} from "lucide-react";

export const UserManagementScreen: React.FC = () => {
  const { allUsers, loadingUsers, refreshUsers, updateUserRoleOrStatus, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserProfile["role"]>("member");
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "info" } | null>(null);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // Filtered users list
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.uid?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    const matchesVerification =
      verificationFilter === "all" ||
      (verificationFilter === "verified" && u.emailVerified) ||
      (verificationFilter === "unverified" && !u.emailVerified);

    return matchesSearch && matchesRole && matchesVerification;
  });

  const totalUsersCount = allUsers.length;
  const verifiedCount = allUsers.filter((u) => u.emailVerified).length;
  const unverifiedCount = totalUsersCount - verifiedCount;
  const adminCount = allUsers.filter((u) => u.role === "admin").length;

  const handleRoleChange = async (targetUid: string, newRole: UserProfile["role"]) => {
    const success = await updateUserRoleOrStatus(targetUid, { role: newRole });
    if (success) {
      setFeedbackMsg({ text: `Updated user role to ${newRole}`, type: "success" });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleStatusToggle = async (targetUser: UserProfile) => {
    const nextStatus = targetUser.status === "active" ? "suspended" : "active";
    const success = await updateUserRoleOrStatus(targetUser.uid, { status: nextStatus });
    if (success) {
      setFeedbackMsg({
        text: `User account has been ${nextStatus === "active" ? "activated" : "suspended"}`,
        type: "success"
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleExportCSV = () => {
    const headers = ["UID", "Name", "Email", "Role", "Status", "Email Verified", "Created At", "Last Login"];
    const rows = allUsers.map((u) => [
      u.uid,
      `"${u.displayName || ""}"`,
      u.email,
      u.role,
      u.status,
      u.emailVerified ? "Yes" : "No",
      u.createdAt || "",
      u.lastLoginAt || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `firebase-users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddMockUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newRecord: UserProfile = {
      uid: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      email: inviteEmail.trim(),
      displayName: inviteName.trim() || inviteEmail.split("@")[0],
      role: inviteRole,
      status: "active",
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: "Never",
    };

    // add to list via state/firestore
    await updateUserRoleOrStatus(newRecord.uid, newRecord);
    refreshUsers();
    setIsInviteModalOpen(false);
    setInviteName("");
    setInviteEmail("");
    setFeedbackMsg({
      text: `Added new user ${newRecord.displayName} (${newRecord.email}) to directory`,
      type: "success"
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Feedback */}
      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg.text}</span>
          </div>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{totalUsersCount}</h4>
            <p className="text-xs text-slate-500 mt-0.5">Firebase directory records</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Verified Emails</p>
            <h4 className="text-2xl font-bold text-emerald-700 mt-1">{verifiedCount}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalUsersCount > 0 ? `${Math.round((verifiedCount / totalUsersCount) * 100)}% verified` : "0%"}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Verification</p>
            <h4 className="text-2xl font-bold text-amber-600 mt-1">{unverifiedCount}</h4>
            <p className="text-xs text-slate-500 mt-0.5">Awaiting link click</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Administrators</p>
            <h4 className="text-2xl font-bold text-purple-700 mt-1">{adminCount}</h4>
            <p className="text-xs text-slate-500 mt-0.5">Access control managers</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, and Actions */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={() => refreshUsers()}
              disabled={loadingUsers}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Refresh User List"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add / Register User</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-400 mr-2 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setVerificationFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                verificationFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All Verification
            </button>
            <button
              type="button"
              onClick={() => setVerificationFilter("verified")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                verificationFilter === "verified" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Verified Only
            </button>
            <button
              type="button"
              onClick={() => setVerificationFilter("unverified")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                verificationFilter === "unverified" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Pending Verification
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {["all", "admin", "manager", "member"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                  roleFilter === r ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {r === "all" ? "All Roles" : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Screen User</th>
                <th className="py-3.5 px-4">Email & Verification</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Created</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Last Active</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-600">No users found</p>
                    <p className="text-xs text-slate-400 mt-1">Try tweaking your search or filter settings</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => {
                  const isCurrent = item.uid === user?.uid;
                  return (
                    <tr
                      key={item.uid}
                      className={`hover:bg-slate-50/60 transition ${isCurrent ? "bg-indigo-50/30" : ""}`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                            {item.displayName?.charAt(0).toUpperCase() || item.email?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                              <span>{item.displayName || "Anonymous User"}</span>
                              {isCurrent && (
                                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">
                              ID: {item.uid.substring(0, 10)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Verification */}
                      <td className="py-3.5 px-4">
                        <div className="text-sm text-slate-800 font-medium truncate max-w-xs">{item.email}</div>
                        <div className="mt-0.5">
                          {item.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending Verification
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <select
                          value={item.role || "member"}
                          onChange={(e) => handleRoleChange(item.uid, e.target.value as any)}
                          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(item)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full transition cursor-pointer ${
                            item.status === "active"
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200/60 hover:bg-rose-100"
                          }`}
                          title="Click to toggle account status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <span className="capitalize">{item.status || "active"}</span>
                        </button>
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-500">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-slate-500">
                        {item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleDateString() : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-xs">
                  {selectedUser.displayName?.charAt(0).toUpperCase() || selectedUser.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedUser.displayName || "User"}</h3>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Email Verification
                  </span>
                  <div className="mt-1">
                    {selectedUser.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Verification
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Assigned Role
                  </span>
                  <span className="text-xs font-bold text-indigo-700 uppercase mt-1 block">
                    {selectedUser.role}
                  </span>
                </div>

                <div className="col-span-2 pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Firebase UID
                  </span>
                  <span className="text-xs font-mono text-slate-600 break-all select-all mt-0.5 block">
                    {selectedUser.uid}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Account Created</span>
                  <span className="font-medium text-slate-800">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Last Sign In</span>
                  <span className="font-medium text-slate-800">
                    {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : "Never"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Current Status</span>
                  <span className="font-semibold text-slate-800 capitalize">{selectedUser.status}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Register User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add User Record</h3>
                <p className="text-xs text-slate-500">Register new team member into the user directory</p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMockUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-xs"
                >
                  Add to Directory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
