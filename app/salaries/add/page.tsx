"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";
import { api } from "@/src/services/api/client";

type EmployeeOption = {
  _id: string;
  fullName: string;
  email: string;
};

const currentMonth = new Date().toLocaleString("en-US", {
  month: "long",
  year: "numeric"
});

export default function AddSalaryPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [form, setForm] = useState({
    employeeName: "",
    employeeEmail: "",
    month: currentMonth,
    baseSalary: "",
    bonus: "0",
    deductions: "0"
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/employees");
        const data = await response.json();
        setEmployees(Array.isArray(data.items) ? data.items : []);
      } catch {
        setEmployees([]);
      }
    };

    void loadEmployees();
  }, []);

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    const employee = employees.find((item) => item._id === employeeId);

    if (!employee) {
      setForm((current) => ({ ...current, employeeName: "", employeeEmail: "" }));
      return;
    }

    setForm((current) => ({
      ...current,
      employeeName: employee.fullName,
      employeeEmail: employee.email
    }));
  };

  const netSalary =
    (Number(form.baseSalary) || 0) + (Number(form.bonus) || 0) - (Number(form.deductions) || 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const response = await api<{ message: string }>("/salary", {
        method: "POST",
        body: JSON.stringify({
          employeeId: selectedEmployeeId || undefined,
          employeeName: form.employeeName,
          employeeEmail: form.employeeEmail,
          month: form.month,
          baseSalary: Number(form.baseSalary),
          bonus: Number(form.bonus || 0),
          deductions: Number(form.deductions || 0)
        })
      });

      alert(response.message);
      router.push("/salaries");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Salary creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OfficeShell
      title="Add Salary"
      subtitle="Create a monthly salary slip with base salary, bonus, deductions, and the final net payout."
      actions={
        <Link href="/salaries" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-violet-400/30 hover:bg-violet-500/10">
          Back to Salaries
        </Link>
      }
    >
      <SurfaceCard>
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm text-slate-300">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Employee</span>
            <select
              value={selectedEmployeeId}
              onChange={(event) => handleEmployeeChange(event.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-violet-400/40 focus:bg-white/[0.07]"
              required
            >
              <option value="" className="bg-slate-950">Select employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id} className="bg-slate-950">
                  {employee.fullName} - {employee.email}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Month</span>
            <input
              type="text"
              value={form.month}
              onChange={(event) => setForm({ ...form, month: event.target.value })}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]"
              placeholder="March 2026"
              required
            />
          </label>

          <label className="block text-sm text-slate-300">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Employee Name</span>
            <input
              type="text"
              value={form.employeeName}
              readOnly
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none"
            />
          </label>

          <label className="block text-sm text-slate-300">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Employee Email</span>
            <input
              type="email"
              value={form.employeeEmail}
              readOnly
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none"
            />
          </label>

          <label className="block text-sm text-slate-300">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Base Salary</span>
            <input
              type="number"
              min="0"
              value={form.baseSalary}
              onChange={(event) => setForm({ ...form, baseSalary: event.target.value })}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]"
              required
            />
          </label>

          <label className="block text-sm text-slate-300">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Bonus</span>
            <input
              type="number"
              min="0"
              value={form.bonus}
              onChange={(event) => setForm({ ...form, bonus: event.target.value })}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]"
            />
          </label>

          <label className="block text-sm text-slate-300">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Deductions</span>
            <input
              type="number"
              min="0"
              value={form.deductions}
              onChange={(event) => setForm({ ...form, deductions: event.target.value })}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]"
            />
          </label>

          <div className="rounded-[26px] border border-violet-400/20 bg-violet-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">Net Salary</p>
            <div className="mt-3 text-3xl font-black tracking-tight text-white">${netSalary.toLocaleString()}</div>
            <p className="mt-2 text-sm text-slate-400">Calculated as base salary + bonus - deductions.</p>
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving Salary..." : "Save Salary Slip"}
            </button>
            <Link href="/salaries" className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-violet-400/30 hover:bg-violet-500/10">
              Cancel
            </Link>
          </div>
        </form>
      </SurfaceCard>
    </OfficeShell>
  );
}
