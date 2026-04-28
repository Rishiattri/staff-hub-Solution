"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";

type Employee = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  education: string;
  experienceLevel: "Fresher" | "Experienced";
  joiningDate: string;
  profileImage?: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const loadEmployees = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/employees");
      const data = await res.json();
      setEmployees(Array.isArray(data.items) ? data.items : []);
    } catch {
      setEmployees([]);
    }
  };

  useEffect(() => {
    void (async () => {
      await loadEmployees();
    })();
  }, []);

  const deleteEmployee = async (id: string) => {
    const res = await fetch(`http://localhost:3001/api/employees/${id}`, { method: "DELETE" });
    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      await loadEmployees();
    }
  };

  return (
    <OfficeShell
      title="Employees"
      subtitle="Admin workspace for reviewing the team directory, onboarding new staff, and maintaining employee records."
      actions={
        <Link href="/dashboard/add-employee" className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] hover:-translate-y-0.5">
          Add Employee
        </Link>
      }
    >
      <SurfaceCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Directory</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Employee records</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{employees.length} employees</div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
          <div className="overflow-x-auto">
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
                      <td className="px-5 py-4">{employee.role}</td>
                      <td className="px-5 py-4">{employee.education}</td>
                      <td className="px-5 py-4">{employee.experienceLevel}</td>
                      <td className="px-5 py-4">{new Date(employee.joiningDate).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => void deleteEmployee(employee._id)} className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200 hover:bg-rose-500/20">
                          Delete
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
