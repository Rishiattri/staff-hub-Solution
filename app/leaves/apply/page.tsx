"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";

export default function ApplyLeavePage() {
  const router = useRouter();
  const [employeeName, setEmployeeName] = useState("");
  const [leaveType, setLeaveType] = useState<"Casual" | "Sick" | "Earned" | "Unpaid">("Casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const applyLeave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const res = await fetch("http://localhost:3001/api/leaves/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ employeeName, leaveType, startDate, endDate, reason })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      router.push("/leaves");
    }
  };

  return (
    <OfficeShell
      title="Apply Leave"
      subtitle="A separate request flow keeps the dashboard clean while still feeling native to StaffHub. The form follows the same restrained, professional visual system as auth."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard>
          <form onSubmit={applyLeave} className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Employee Name</span>
              <input value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} required className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]" placeholder="Rishi Attri" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Leave Type</span>
              <select value={leaveType} onChange={(event) => setLeaveType(event.target.value as "Casual" | "Sick" | "Earned" | "Unpaid")} className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-violet-400/40 focus:bg-white/[0.07]">
                <option className="bg-slate-950" value="Casual">Casual Leave</option>
                <option className="bg-slate-950" value="Sick">Sick Leave</option>
                <option className="bg-slate-950" value="Earned">Earned Leave</option>
                <option className="bg-slate-950" value="Unpaid">Unpaid Leave</option>
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Start Date</span>
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-violet-400/40 focus:bg-white/[0.07]" />
            </label>
            <label className="block text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">End Date</span>
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-violet-400/40 focus:bg-white/[0.07]" />
            </label>
            <label className="block text-sm text-slate-300 md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Reason</span>
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} required className="min-h-[140px] w-full rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:bg-white/[0.07]" placeholder="Family event, health rest, urgent work-from-home recovery..." />
            </label>
            <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
              <button type="submit" className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] hover:-translate-y-0.5">Submit Leave</button>
              <button type="button" onClick={() => router.push("/leaves")} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-violet-400/30 hover:bg-violet-500/10">Cancel</button>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-violet-600/12 to-fuchsia-500/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Request guidance</p>
            <h2 className="mt-3 text-2xl font-bold text-white">Simple, explicit leave input</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Once submitted, the request lands in the leave management screens where it can be approved, rejected, or cancelled. Approved requests automatically reduce available balance.</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-slate-400">
            Keep the employee name consistent with the employee directory so balances stay grouped under a single record. This first version uses the name as the balance key.
          </div>
        </SurfaceCard>
      </div>
    </OfficeShell>
  );
}
