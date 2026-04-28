"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";
import { api, getStoredAuth } from "@/src/services/api/client";

type SalarySlip = {
  _id: string;
  employeeId?: string;
  employeeEmail?: string;
  employeeName: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
};

export default function SalariesPage() {
  const auth = useMemo(() => getStoredAuth(), []);
  const isAdmin = auth?.user?.role === "admin";
  const [salaryRows, setSalaryRows] = useState<SalarySlip[]>([]);

  useEffect(() => {
    const loadSalaryRows = async () => {
      try {
        const response = await api<{ items: SalarySlip[] }>(isAdmin ? "/salary" : "/salary/me");
        setSalaryRows(Array.isArray(response.items) ? response.items : []);
      } catch {
        setSalaryRows([]);
      }
    };

    void loadSalaryRows();
  }, [isAdmin]);

  const payrollStats = isAdmin
    ? [
        { label: "Salary slips", value: salaryRows.length },
        { label: "Employees covered", value: new Set(salaryRows.map((row) => row.employeeName)).size },
        { label: "Net processed", value: `$${salaryRows.reduce((sum, row) => sum + row.netSalary, 0).toLocaleString()}` }
      ]
    : [
        { label: "Salary slips", value: salaryRows.length },
        { label: "Latest month", value: salaryRows[0]?.month || "-" },
        { label: "Latest net", value: salaryRows[0] ? `$${salaryRows[0].netSalary.toLocaleString()}` : "$0" }
      ];

  return (
    <OfficeShell
      title="Salaries"
      subtitle={isAdmin ? "Admins can review all salary slips, bonus adjustments, deductions, and payroll totals across the team." : "Employees only see their own salary slips and monthly breakdowns here."}
      actions={
        isAdmin ? (
          <Link href="/salaries/add" className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] hover:-translate-y-0.5">
            Add Salary
          </Link>
        ) : undefined
      }
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {payrollStats.map((item) => (
          <SurfaceCard key={item.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">{item.label}</p>
            <div className="mt-4 text-3xl font-black tracking-tight text-white">{item.value}</div>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Salary module</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{isAdmin ? "Payroll overview" : "My salary slips"}</h2>
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  {isAdmin ? <th className="px-5 py-4">Employee</th> : null}
                  <th className="px-5 py-4">Month</th>
                  <th className="px-5 py-4">Base Salary</th>
                  <th className="px-5 py-4">Bonus</th>
                  <th className="px-5 py-4">Deductions</th>
                  <th className="px-5 py-4">Net Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 bg-slate-950/40 text-sm text-slate-200">
                {salaryRows.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-5 py-14 text-center text-slate-400">No salary slips available yet.</td>
                  </tr>
                ) : (
                  salaryRows.map((row) => (
                    <tr key={row._id} className="hover:bg-white/[0.03]">
                      {isAdmin ? <td className="px-5 py-4 font-medium text-white">{row.employeeName}</td> : null}
                      <td className="px-5 py-4">{row.month}</td>
                      <td className="px-5 py-4">${row.baseSalary.toLocaleString()}</td>
                      <td className="px-5 py-4 text-emerald-300">${row.bonus.toLocaleString()}</td>
                      <td className="px-5 py-4 text-rose-300">${row.deductions.toLocaleString()}</td>
                      <td className="px-5 py-4 font-semibold text-violet-200">${row.netSalary.toLocaleString()}</td>
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
