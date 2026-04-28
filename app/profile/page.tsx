"use client";

import { useEffect, useState } from "react";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";
import { api, getStoredAuth } from "@/src/services/api/client";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joiningDate: string;
  experience: string;
  address: string;
  profileImage: string;
};

const emptyProfile: ProfileData = {
  name: "",
  email: "",
  phone: "",
  role: "Employee",
  department: "General",
  joiningDate: "",
  experience: "Fresher",
  address: "",
  profileImage: ""
};

export default function ProfilePage() {
  const auth = getStoredAuth();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api<{ data: ProfileData }>("/profile/me");

        if (response.data) {
          setProfile({
            ...emptyProfile,
            ...response.data,
            joiningDate: response.data.joiningDate ? String(response.data.joiningDate).slice(0, 10) : ""
          });
        }
      } catch {
        if (auth?.user) {
          setProfile((current) => ({
            ...current,
            name: auth.user.fullName,
            email: auth.user.email,
            role: auth.user.role === "admin" ? "Admin" : "Employee"
          }));
        }
      }
    };

    void loadProfile();
  }, [auth]);

  const updateProfile = async () => {
    try {
      const response = await api<{ message: string }>("/profile/me", {
        method: "PUT",
        body: JSON.stringify(profile)
      });
      alert(response.message);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Profile update failed");
    }
  };

  const changePassword = async () => {
    try {
      const response = await api<{ message: string }>("/profile/change-password", {
        method: "PATCH",
        body: JSON.stringify(passwordForm)
      });
      alert(response.message);
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Password update failed");
    }
  };

  return (
    <OfficeShell
      title="Profile"
      subtitle="A self-service profile workspace for employees and administrators. Each user only sees their own profile details here."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ["Name", "name"],
              ["Email", "email"],
              ["Phone", "phone"],
              ["Role", "role"],
              ["Department", "department"],
              ["Joining Date", "joiningDate"],
              ["Experience", "experience"],
              ["Profile Image", "profileImage"]
            ].map(([label, key]) => (
              <label key={key} className="block text-sm text-slate-300">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</span>
                <input
                  type={key === "joiningDate" ? "date" : "text"}
                  value={profile[key as keyof ProfileData]}
                  onChange={(event) => setProfile({ ...profile, [key]: event.target.value })}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]"
                />
              </label>
            ))}
            <label className="block text-sm text-slate-300 md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Address</span>
              <textarea
                value={profile.address}
                onChange={(event) => setProfile({ ...profile, address: event.target.value })}
                className="min-h-[120px] w-full rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]"
              />
            </label>
            <div className="md:col-span-2">
              <button onClick={updateProfile} className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] hover:-translate-y-0.5">Save Profile</button>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Security</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Change password</h2>
          <div className="mt-6 space-y-4">
            <input
              type="password"
              placeholder="Current password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]"
            />
            <input
              type="password"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]"
            />
            <button onClick={changePassword} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-violet-400/30 hover:bg-violet-500/10">Update Password</button>
          </div>
        </SurfaceCard>
      </div>
    </OfficeShell>
  );
}
