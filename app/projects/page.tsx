"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";

type Project = {
  _id: string;
  projectName: string;
  status: "Active" | "Completed";
  role: string;
  developerName: string;
  techStack: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProjects = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/projects");

      if (!res.ok) {
        setProjects([]);
        return;
      }

      const data = await res.json();
      setProjects(Array.isArray(data.data) ? data.data : []);
    } catch {
      setProjects([]);
    }
  };

  useEffect(() => {
    void (async () => {
      await loadProjects();
    })();
  }, []);

  const deleteProject = async (id: string) => {
    const res = await fetch(`http://localhost:3001/api/projects/${id}`, { method: "DELETE" });
    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      await loadProjects();
    }
  };

  return (
    <OfficeShell
      title="Projects"
      subtitle="Track active and completed project delivery, assigned developers, and role ownership from one unified board."
      actions={
        <Link href="/dashboard/add-project" className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] hover:-translate-y-0.5">
          Add Project
        </Link>
      }
    >
      <SurfaceCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Project board</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Delivery pipeline</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{projects.length} total</div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Project</th>
                  <th className="px-5 py-4">Tech Stack</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Developer</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 bg-slate-950/40 text-sm text-slate-200">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-slate-400">No projects available yet.</td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project._id} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <div className="min-w-[180px]">
                          <div className="font-semibold text-white">{project.projectName}</div>
                          <div className="mt-1 text-sm text-slate-400">Project tracking</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">{project.techStack}</td>
                      <td className="px-5 py-4">{project.role}</td>
                      <td className="px-5 py-4">{project.developerName}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${project.status === "Active" ? "border border-sky-400/20 bg-sky-500/10 text-sky-200" : "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => void deleteProject(project._id)} className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200 hover:bg-rose-500/20">
                          Delete Project
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SurfaceCard>
    </OfficeShell>
  );
}
