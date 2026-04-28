"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";
import { api, getStoredAuth } from "@/src/services/api/client";

interface Employee {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  education: string;
  address: string;
  experienceLevel: "Fresher" | "Experienced";
  joiningDate: string;
  birthDate?: string | null;
  profileImage?: string;
}

interface Project {
  _id: string;
  projectName: string;
  status: "Active" | "Completed";
  role: string;
  developerName: string;
  techStack: string;
}

interface Leave {
  _id: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
}

interface SalarySlip {
  _id: string;
  netSalary: number;
}

export default function Dashboard() {
  const auth = useMemo(() => getStoredAuth(), []);
  const isAdmin = auth?.user?.role === "admin";
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [salaryRows, setSalaryRows] = useState<SalarySlip[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const refreshEmployees = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/employees");
      const data = await res.json();
      setEmployees(Array.isArray(data.items) ? data.items : []);
      setTotalEmployees(data.totalEmployees || 0);
    } catch {
      setEmployees([]);
      setTotalEmployees(0);
    }
  };

  const refreshProjects = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/projects");

      if (!res.ok) {
        setProjects([]);
        return;
      }

      const data = await res.json();
      const allProjects = Array.isArray(data?.data) ? data.data : [];
      setProjects(allProjects);
    } catch {
      setProjects([]);
    }
  };

  const refreshLeaves = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/leaves");
      const data = await res.json();
      setLeaves(Array.isArray(data.items) ? data.items : []);
    } catch {
      setLeaves([]);
    }
  };

  const refreshSalaryRows = useCallback(async () => {
    if (!auth?.token) {
      setSalaryRows([]);
      return;
    }

    try {
      const response = await api<{ items: SalarySlip[] }>(isAdmin ? "/salary" : "/salary/me");
      setSalaryRows(Array.isArray(response.items) ? response.items : []);
    } catch {
      setSalaryRows([]);
    }
  }, [auth?.token, isAdmin]);

  useEffect(() => {
    const loadDashboardData = async () => {
      await Promise.all([refreshEmployees(), refreshProjects(), refreshLeaves(), refreshSalaryRows()]);
    };

    void loadDashboardData();
  }, [isAdmin, refreshSalaryRows]);

  const deleteEmployee = async (id: string) => {
    const res = await fetch(`http://localhost:3001/api/employees/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      void refreshEmployees();
    }
  };

  const deleteProject = async (id: string) => {
    const res = await fetch(`http://localhost:3001/api/projects/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      void refreshProjects();
    }
  };

  const activeProjectCount = projects.filter((project) => project.status === "Active").length;
  const completedProjectCount = projects.filter((project) => project.status === "Completed").length;
  const pendingLeavesCount = leaves.filter((leave) => leave.status === "Pending").length;
  const salaryOverview = isAdmin
    ? `$${salaryRows.reduce((sum, row) => sum + row.netSalary, 0).toLocaleString()}`
    : salaryRows[0]
      ? `$${salaryRows[0].netSalary.toLocaleString()}`
      : "$0";

  const stats = [
    { label: "Total Employees", value: totalEmployees, hint: "Live employee directory", color: "from-violet-600/30 to-fuchsia-500/20" },
    { label: "Completed Projects", value: completedProjectCount, hint: `${activeProjectCount} active right now`, color: "from-emerald-600/30 to-teal-500/20" },
    { label: "Pending Leaves", value: pendingLeavesCount, hint: "Requests waiting for review", color: "from-amber-600/30 to-orange-500/20" },
    { label: "Salary Overview", value: salaryOverview, hint: isAdmin ? "Net processed this cycle" : "Latest visible salary", color: "from-sky-600/30 to-cyan-500/20" }
  ];

  return (
    <OfficeShell
      title="Office Dashboard"
      subtitle="A calm, data-first control center for your team. The dashboard only shows lists and metrics, while create flows live in dedicated pages from the sidebar."
      actions={
        <>
          <Link href="/dashboard/add-employee" className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] hover:-translate-y-0.5">Add Employee</Link>
          <Link href="/dashboard/add-project" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-violet-400/30 hover:bg-violet-500/10">Add Project</Link>
        </>
      }
    >
      <div className="grid gap-5 xl:grid-cols-4">
        {stats.map((stat) => (
          <SurfaceCard key={stat.label} className={`relative overflow-hidden bg-gradient-to-br ${stat.color}`}>
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/8 blur-2xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-300/80">{stat.label}</p>
            <div className="mt-4 text-5xl font-black tracking-tight text-white">{stat.value}</div>
            <p className="mt-3 text-sm text-slate-300/85">{stat.hint}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <SurfaceCard className="flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-300/80">Employee List</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Active team directory</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{employees.length} records</div>
          </div>

          <div className="mt-6 flex-1 overflow-hidden rounded-3xl border border-white/10">
            <div className="max-h-[420px] overflow-auto">
              <table className="min-w-full divide-y divide-white/10 text-left">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.22em] text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Employee</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Education</th>
                    <th className="px-5 py-4">Experience</th>
                    <th className="px-5 py-4">Joining Date</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8 bg-slate-950/40 text-sm text-slate-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center text-slate-400">No employees available yet.</td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr key={employee._id} className="hover:bg-white/[0.03]">
                        <td className="px-5 py-4">
                          <div className="flex min-w-[260px] items-center gap-4">
                            {employee.profileImage ? (
                              <Image src={employee.profileImage} alt={employee.fullName} width={48} height={48} className="h-12 w-12 rounded-2xl object-cover ring-1 ring-white/10" />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 font-bold text-violet-200 ring-1 ring-violet-300/15">
                                {employee.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-white">{employee.fullName}</div>
                              <div className="mt-1 truncate text-sm text-slate-400">{employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">{employee.role}</td>
                        <td className="whitespace-nowrap px-5 py-4">{employee.education}</td>
                        <td className="whitespace-nowrap px-5 py-4">{employee.experienceLevel}</td>
                        <td className="whitespace-nowrap px-5 py-4">{new Date(employee.joiningDate).toLocaleDateString()}</td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => deleteEmployee(employee._id)} className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200 hover:bg-rose-500/20">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-300/80">Projects</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Project board</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{projects.length} total</div>
          </div>

          <div className="mt-6 flex-1 overflow-hidden rounded-3xl border border-white/10">
            <div className="max-h-[420px] overflow-auto">
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
                        <td className="px-5 py-4">
                          <div className="max-w-[260px] whitespace-normal text-slate-300">{project.techStack}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="max-w-[220px] whitespace-normal text-slate-300">{project.role}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="max-w-[220px] whitespace-normal text-slate-300">{project.developerName}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                            project.status === "Active"
                              ? "border border-sky-400/20 bg-sky-500/10 text-sky-200"
                              : "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => deleteProject(project._id)} className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200 hover:bg-rose-500/20">Delete Project</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </OfficeShell>
  );
}
