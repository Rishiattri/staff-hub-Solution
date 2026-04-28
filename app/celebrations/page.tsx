"use client";

import { useEffect, useMemo, useState } from "react";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";
import { api, getStoredAuth } from "@/src/services/api/client";

type Employee = {
  _id: string;
  fullName: string;
  email: string;
  role?: string;
  birthDate?: string | null;
};

type HolidayItem = {
  name: string;
  monthDay: string;
  description?: string;
  active: boolean;
};

type SettingsData = {
  notifications?: {
    holidays?: HolidayItem[];
  };
};

function getMonthDayLabel(monthDay: string, year = 2026) {
  const [month, day] = monthDay.split("-").map(Number);

  if (!month || !day) {
    return monthDay;
  }

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short"
  });
}

function getMonthDayValue(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

export default function CelebrationsPage() {
  const auth = useMemo(() => getStoredAuth(), []);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<SettingsData>({});

  useEffect(() => {
    if (!auth?.token) {
      return;
    }

    void Promise.all([
      api<{ items: Employee[] }>("/employees"),
      api<{ data: SettingsData }>("/settings")
    ])
      .then(([employeeResponse, settingsResponse]) => {
        setEmployees(Array.isArray(employeeResponse.items) ? employeeResponse.items : []);
        setSettings(settingsResponse.data || {});
      })
      .catch(() => {
        setEmployees([]);
        setSettings({});
      });
  }, [auth?.token]);

  const holidayRows = (settings.notifications?.holidays || [])
    .filter((holiday) => holiday.active)
    .sort((left, right) => left.monthDay.localeCompare(right.monthDay));

  const birthdayRows = employees
    .filter((employee) => employee.birthDate)
    .map((employee) => ({
      ...employee,
      monthDay: getMonthDayValue(employee.birthDate as string)
    }))
    .sort((left, right) => left.monthDay.localeCompare(right.monthDay));
  const leadershipRows = employees.filter((employee) => {
    const role = String(employee.role || "").trim().toLowerCase();
    return role === "cto" || role === "ceo";
  });

  return (
    <OfficeShell
      title="Holidays & Birthdays"
      subtitle="A dedicated space for the 2026 holiday calendar and employee birthday list, separate from the main dashboard."
    >
      <SurfaceCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-300/80">Leadership Spotlight</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Key company roles</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{leadershipRows.length} leaders</div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {leadershipRows.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center text-slate-400 md:col-span-2">
              No leadership profiles saved yet.
            </div>
          ) : (
            leadershipRows.map((employee) => (
              <div key={employee._id} className="rounded-[28px] border border-violet-400/15 bg-gradient-to-br from-violet-600/12 via-fuchsia-500/8 to-cyan-500/8 px-6 py-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-300/80">{employee.role}</div>
                <div className="mt-2 text-2xl font-black tracking-tight text-white">{employee.fullName}</div>
                <div className="mt-2 text-sm text-slate-300">{employee.email}</div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-300">
                  Birthday: {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "Not added yet"}
                </div>
              </div>
            ))
          )}
        </div>
      </SurfaceCard>

      <div className="grid gap-6 2xl:grid-cols-2">
        <SurfaceCard className="flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-300/80">Holidays</p>
              <h2 className="mt-2 text-2xl font-bold text-white">2026 holiday calendar</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{holidayRows.length} holidays</div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {holidayRows.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center text-slate-400 sm:col-span-2">
                No holidays configured yet.
              </div>
            ) : (
              holidayRows.map((holiday) => (
                <div key={`${holiday.name}-${holiday.monthDay}`} className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-300/80">{getMonthDayLabel(holiday.monthDay)}</div>
                  <div className="mt-2 text-xl font-bold text-white">{holiday.name}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">{holiday.description || "Company holiday"}</div>
                </div>
              ))
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-300/80">Birthdays</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Employee birthday board</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{birthdayRows.length} saved</div>
          </div>

          <div className="mt-6 space-y-3">
            {birthdayRows.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center text-slate-400">
                No employee birthdays saved yet.
              </div>
            ) : (
              birthdayRows.map((employee) => (
                <div key={employee._id} className="flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-white">{employee.fullName}</div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/80">{employee.role || "Team Member"}</div>
                    <div className="mt-1 truncate text-sm text-slate-400">{employee.email}</div>
                  </div>
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200">
                    {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "--"}
                  </div>
                </div>
              ))
            )}
          </div>
        </SurfaceCard>
      </div>
    </OfficeShell>
  );
}
