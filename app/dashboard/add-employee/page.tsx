"use client";

import Image from "next/image";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";

export default function AddEmployeePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [education, setEducation] = useState("");
  const [address, setAddress] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<"Fresher" | "Experienced">("Fresher");
  const [joiningDate, setJoiningDate] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileImageName, setProfileImageName] = useState("");

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setProfileImage("");
      setProfileImageName("");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(typeof reader.result === "string" ? reader.result : "");
      setProfileImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const addEmployee = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const res = await fetch("http://localhost:3001/api/employees/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName,
        email,
        phoneNumber,
        role,
        education,
        address,
        experienceLevel,
        joiningDate,
        birthDate,
        profileImage
      })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      router.push("/dashboard");
    }
  };

  return (
    <OfficeShell
      title="Add Employee"
      subtitle="A focused onboarding form for building the StaffHub employee directory. This page mirrors the auth styling with quiet surfaces, rounded controls, and strong primary actions."
    >
      <SurfaceCard className="max-w-5xl">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={addEmployee} className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Full Name</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} required className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]" placeholder="Jane Smith" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]" placeholder="jane@staffhub.com" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Phone Number</span>
              <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} required className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]" placeholder="9876543210" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Role</span>
              <input value={role} onChange={(event) => setRole(event.target.value)} required className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]" placeholder="Operations Manager" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Education</span>
              <input value={education} onChange={(event) => setEducation(event.target.value)} required className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]" placeholder="MBA, B.Tech" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Experience Level</span>
              <select value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value as "Fresher" | "Experienced")} className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-violet-400/40 focus:bg-white/[0.07]">
                <option className="bg-slate-950" value="Fresher">Fresher</option>
                <option className="bg-slate-950" value="Experienced">Experienced</option>
              </select>
            </label>
            <label className="block text-sm text-slate-300 md:col-span-2 xl:col-span-1">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Joining Date</span>
              <input type="date" value={joiningDate} onChange={(event) => setJoiningDate(event.target.value)} required className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-violet-400/40 focus:bg-white/[0.07]" />
            </label>
            <label className="block text-sm text-slate-300 md:col-span-2 xl:col-span-1">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Birth Date</span>
              <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-violet-400/40 focus:bg-white/[0.07]" />
            </label>
            <label className="block text-sm text-slate-300 md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Address</span>
              <textarea value={address} onChange={(event) => setAddress(event.target.value)} required className="min-h-[120px] w-full rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]" placeholder="Office address or employee location" />
            </label>
            <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
              <button type="submit" className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] hover:-translate-y-0.5">Save Employee</button>
              <button type="button" onClick={() => router.push("/dashboard")} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-violet-400/30 hover:bg-violet-500/10">Cancel</button>
            </div>
          </form>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Profile Image</p>
              <label htmlFor="profileImage" className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[24px] border border-dashed border-white/10 bg-slate-950/40 px-6 py-10 text-center hover:border-violet-400/30 hover:bg-violet-500/5">
                {profileImage ? (
                  <Image src={profileImage} alt="Profile preview" width={96} height={96} className="h-24 w-24 rounded-[28px] object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-violet-500/15 text-violet-200">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-8 w-8">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{profileImageName || "Upload employee image"}</p>
                  <p className="mt-1 text-sm text-slate-400">PNG, JPG, or gallery photo</p>
                </div>
              </label>
              <input id="profileImage" type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
              {profileImage ? (
                <button type="button" onClick={() => { setProfileImage(""); setProfileImageName(""); }} className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/20">Remove image</button>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">StaffHub note</p>
              <p className="mt-4 leading-7 text-slate-400">The dashboard stays clean and data-focused. Add a birth date if you want this employee included in the daily birthday email automation.</p>
            </div>
          </div>
        </div>
      </SurfaceCard>
    </OfficeShell>
  );
}
