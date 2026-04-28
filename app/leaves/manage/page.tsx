"use client";

import { useEffect, useState } from "react";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";

interface LeaveRequest {
  _id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
}

export default function ManageLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const loadLeaves = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/leaves");
      const data = await res.json();
      const requests = Array.isArray(data.items) ? data.items : [];
      setLeaves(requests.filter((leave: LeaveRequest) => leave.status === "Pending"));
    } catch {
      setLeaves([]);
    }
  };

  useEffect(() => {
    const loadPendingLeaves = async () => {
      await loadLeaves();
    };

    void loadPendingLeaves();
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
      void loadLeaves();
    }
  };

  return (
    <OfficeShell
      title="Manage Leaves"
      subtitle="A manager-friendly review screen for pending leave actions. The layout stays restrained and data-centered, matching the rest of StaffHub."
    >
      <SurfaceCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Pending queue</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Review leave requests</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{leaves.length} awaiting action</div>
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
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 bg-slate-950/40 text-sm text-slate-200">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-slate-400">No pending leave requests right now.</td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-4 font-medium text-white">{leave.employeeName}</td>
                      <td className="px-5 py-4">{leave.leaveType}</td>
                      <td className="px-5 py-4">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</td>
                      <td className="px-5 py-4">{leave.days}</td>
                      <td className="px-5 py-4"><span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">{leave.status}</span></td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => updateLeaveStatus(leave._id, "Approved")} className="rounded-xl bg-emerald-500/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200 hover:bg-emerald-500/22">Approve</button>
                          <button onClick={() => updateLeaveStatus(leave._id, "Rejected")} className="rounded-xl bg-rose-500/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200 hover:bg-rose-500/22">Reject</button>
                          <button onClick={() => updateLeaveStatus(leave._id, "Cancelled")} className="rounded-xl bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 hover:bg-white/12">Cancel</button>
                        </div>
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
