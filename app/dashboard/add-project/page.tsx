"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";

export default function AddProjectPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [status, setStatus] = useState<"Active" | "Completed">("Completed");
  const [role, setRole] = useState("");
  const [developerName, setDeveloperName] = useState("");
  const [techStack, setTechStack] = useState("");

  const addProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const res = await fetch("http://localhost:3001/api/projects/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        projectName,
        status,
        role,
        developerName,
        techStack
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
      title="Add Project"
      subtitle="Capture delivery work with the same visual language as StaffHub auth: dark surfaces, luminous violet accents, and simple, professional spacing."
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard>
          <form onSubmit={addProject} className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm text-slate-300 md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Project Name</span>
              <input value={projectName} onChange={(event) => setProjectName(event.target.value)} required className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]" placeholder="StaffHub Revamp" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as "Active" | "Completed")} className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-violet-400/40 focus:bg-white/[0.07]">
                <option className="bg-slate-950" value="Active">Active</option>
                <option className="bg-slate-950" value="Completed">Completed</option>
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Role</span>
              <input value={role} onChange={(event) => setRole(event.target.value)} required className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]" placeholder="Frontend, QA, Lead" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Developer Name</span>
              <input value={developerName} onChange={(event) => setDeveloperName(event.target.value)} required className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]" placeholder="Rishi, Simran" />
            </label>
            <label className="block text-sm text-slate-300 md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tech Stack</span>
              <textarea value={techStack} onChange={(event) => setTechStack(event.target.value)} required className="min-h-[120px] w-full rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]" placeholder="Next.js, Tailwind CSS, Node.js, MongoDB" />
            </label>
            <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
              <button type="submit" className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] hover:-translate-y-0.5">Save Project</button>
              <button type="button" onClick={() => router.push("/dashboard")} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-violet-400/30 hover:bg-violet-500/10">Cancel</button>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-violet-600/12 to-fuchsia-500/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Project flow</p>
            <h2 className="mt-3 text-2xl font-bold text-white">Delivery stays visible</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Completed work feeds directly into the dashboard delivery board. Active projects are stored too, but only completed work appears in the main dashboard list.</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Suggested input style</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-400">
              <li>Use a clear project title that stakeholders recognize instantly.</li>
              <li>List developer names in the exact format you want to see on the dashboard.</li>
              <li>Keep the tech stack concise so the table remains readable.</li>
            </ul>
          </div>
        </SurfaceCard>
      </div>
    </OfficeShell>
  );
}
