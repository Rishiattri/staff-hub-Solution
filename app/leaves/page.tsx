"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";

interface LeaveRequest {
  _id: string;
  employeeName: string;
  leaveType: "Casual" | "Sick" | "Earned" | "Unpaid";
  startDate: string;
  endDate: string;
  reason: string;
  days: number;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
}

interface BalanceBucket {
  total: number;
  used: number;
  remaining: number;
}

interface LeaveBalance {
  _id: string;
  employeeName: string;
  casual: BalanceBucket;
  sick: BalanceBucket;
  earned: BalanceBucket;
  unpaid: BalanceBucket;
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);

  const loadData = async () => {
    try {
      const [leaveRes, balanceRes] = await Promise.all([
        fetch("http://localhost:3001/api/leaves"),
        fetch("http://localhost:3001/api/leaves/balances")
      ]);

      const leaveData = await leaveRes.json();
      const balanceData = await balanceRes.json();

      setLeaves(Array.isArray(leaveData.items) ? leaveData.items : []);
      setBalances(Array.isArray(balanceData.items) ? balanceData.items : []);
    } catch {
      setLeaves([]);
      setBalances([]);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await loadData();
    };

    void loadInitialData();
  }, []);

  const updateLeaveStatus = async (id: string, status: "Approved" | "Rejected" | "Cancelled") => {
    const res = await fetch(`http://localhost:3001/api/leaves/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      void loadData();
    }
  };

  const stats = [
    { label: "Pending", value: leaves.filter((leave) => leave.status === "Pending").length, tone: "text-amber-300" },
    { label: "Approved", value: leaves.filter((leave) => leave.status === "Approved").length, tone: "text-emerald-300" },
    { label: "Rejected", value: leaves.filter((leave) => leave.status === "Rejected").length, tone: "text-rose-300" }
  ];

  return (
    <OfficeShell
      title="Leave Management"
      subtitle="A unified leave workspace for requests, balances, and quick approvals. The experience follows the same dark premium StaffHub language as login and signup."
      actions={
        <>
          <Link href="/leaves/apply" className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] hover:-translate-y-0.5">Apply Leave</Link>
          <Link href="/leaves/manage" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-violet-400/30 hover:bg-violet-500/10">Manage Requests</Link>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {stats.map((stat) => (
          <SurfaceCard key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">{stat.label} requests</p>
            <div className={`mt-4 text-5xl font-black tracking-tight ${stat.tone}`}>{stat.value}</div>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Balances</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Employee leave balance cards</h2>
          </div>
        </div>
        {balances.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center text-slate-400">No leave balances available yet. Submit a request to create the first balance card.</div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {balances.map((balance) => (
              <div key={balance._id} className="flex h-full min-h-[320px] flex-col rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-300/80">Employee leave balance</p>
                    <h3 className="mt-2 truncate text-lg font-semibold text-white">{balance.employeeName}</h3>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Available</div>
                    <div className="mt-1 text-lg font-bold text-violet-200">{balance.casual.remaining + balance.sick.remaining + balance.earned.remaining}</div>
                  </div>
                </div>

                <div className="mt-4 grid flex-1 gap-4">
                  {[{ label: "Casual", bucket: balance.casual }, { label: "Sick", bucket: balance.sick }, { label: "Earned", bucket: balance.earned }, { label: "Unpaid", bucket: balance.unpaid }].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-300">
                        <span className="font-medium text-white">{item.label}</span>
                        <span className="text-xs uppercase tracking-[0.16em] text-slate-400">{item.bucket.remaining} left</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/8">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                          style={{ width: `${item.bucket.total === 0 ? 8 : Math.max((item.bucket.remaining / item.bucket.total) * 100, 8)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>{item.bucket.used} used</span>
                        <span>{item.bucket.total} total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Requests</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Leave request table</h2>
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Employee</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Dates</th>
                  <th className="px-5 py-4">Days</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 bg-slate-950/40 text-sm text-slate-200">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-slate-400">No leave requests available yet.</td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-4 font-medium text-white">{leave.employeeName}</td>
                      <td className="px-5 py-4">{leave.leaveType}</td>
                      <td className="px-5 py-4">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</td>
                      <td className="px-5 py-4">{leave.days}</td>
                      <td className="px-5 py-4 text-slate-300">{leave.reason}</td>
                      <td className="px-5 py-4"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">{leave.status}</span></td>
                      <td className="px-5 py-4">
                        {leave.status === "Pending" ? (
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => updateLeaveStatus(leave._id, "Approved")} className="rounded-xl bg-emerald-500/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200 hover:bg-emerald-500/22">Approve</button>
                            <button onClick={() => updateLeaveStatus(leave._id, "Rejected")} className="rounded-xl bg-rose-500/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200 hover:bg-rose-500/22">Reject</button>
                            <button onClick={() => updateLeaveStatus(leave._id, "Cancelled")} className="rounded-xl bg-amber-500/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200 hover:bg-amber-500/22">Cancel</button>
                          </div>
                        ) : (
                          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Locked</span>
                        )}
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
