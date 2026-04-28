"use client";

import { useEffect, useMemo, useState } from "react";

import { OfficeShell, SurfaceCard } from "@/src/components/office/OfficeShell";
import { api, getStoredAuth } from "@/src/services/api/client";

type SettingsData = {
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  leavePolicy?: {
    maxLeavesPerDay: number;
    allowAdminOverride: boolean;
  };
  rolePermissions?: {
    adminCanManageSettings: boolean;
    employeeCanEditProfile: boolean;
  };
  notifications?: {
    emailEnabled: boolean;
    pushEnabled?: boolean;
    birthdayAlertsEnabled?: boolean;
    holidayAlertsEnabled?: boolean;
    senderName?: string;
    senderEmail?: string;
    scheduleCron?: string;
    holidays?: Array<{
      name: string;
      monthDay: string;
      description?: string;
      active: boolean;
    }>;
  };
  employeePreferences?: {
    theme: "dark" | "light";
    emailNotifications: boolean;
  };
};

export default function SettingsPage() {
  const auth = useMemo(() => getStoredAuth(), []);
  const isAdmin = auth?.user?.role === "admin";
  const [settings, setSettings] = useState<SettingsData>({
    companyName: "StaffHub",
    companyEmail: "",
    companyPhone: "",
    leavePolicy: { maxLeavesPerDay: 2, allowAdminOverride: true },
    rolePermissions: { adminCanManageSettings: true, employeeCanEditProfile: true },
    notifications: {
      emailEnabled: true,
      pushEnabled: false,
      birthdayAlertsEnabled: true,
      holidayAlertsEnabled: true,
      senderName: "StaffHub",
      senderEmail: "",
      scheduleCron: "0 8 * * *",
      holidays: []
    },
    employeePreferences: { theme: "dark", emailNotifications: true }
  });
  const [notificationLogs, setNotificationLogs] = useState<Array<{
    _id: string;
    type: "birthday" | "holiday";
    status: "sent" | "failed";
    recipientName: string;
    recipientEmail: string;
    holidayName?: string;
    subject: string;
    errorMessage?: string;
    createdAt: string;
  }>>([]);
  const [runningNotifications, setRunningNotifications] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api<{ data: SettingsData }>("/settings");
        setSettings((current) => ({ ...current, ...response.data }));
      } catch {
        // Keep defaults if request fails.
      }
    };

    void loadSettings();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    api<{ items: Array<{
      _id: string;
      type: "birthday" | "holiday";
      status: "sent" | "failed";
      recipientName: string;
      recipientEmail: string;
      holidayName?: string;
      subject: string;
      errorMessage?: string;
      createdAt: string;
    }> }>("/settings/notifications/logs")
      .then((response) => {
        setNotificationLogs(Array.isArray(response.items) ? response.items : []);
      })
      .catch(() => {
        setNotificationLogs([]);
      });
  }, [isAdmin]);

  const saveSettings = async () => {
    try {
      const response = await api<{ message: string }>("/settings", {
        method: "PUT",
        body: JSON.stringify(settings)
      });
      alert(response.message);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Settings update failed");
    }
  };

  const runNotificationsNow = async () => {
    try {
      setRunningNotifications(true);
      const response = await api<{ message: string }>("/settings/notifications/run", {
        method: "POST"
      });
      alert(response.message);

      const logsResponse = await api<{ items: typeof notificationLogs }>("/settings/notifications/logs");
      setNotificationLogs(Array.isArray(logsResponse.items) ? logsResponse.items : []);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Notification run failed");
    } finally {
      setRunningNotifications(false);
    }
  };

  const holidays = settings.notifications?.holidays || [];

  const updateHoliday = (index: number, field: "name" | "monthDay" | "description" | "active", value: string | boolean) => {
    const nextHolidays = holidays.map((holiday, holidayIndex) =>
      holidayIndex === index
        ? { ...holiday, [field]: value }
        : holiday
    );

    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications!,
        holidays: nextHolidays
      }
    });
  };

  const addHoliday = () => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications!,
        holidays: [
          ...holidays,
          { name: "", monthDay: "", description: "", active: true }
        ]
      }
    });
  };

  const removeHoliday = (index: number) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications!,
        holidays: holidays.filter((_, holidayIndex) => holidayIndex !== index)
      }
    });
  };

  return (
    <OfficeShell
      title="Settings"
      subtitle={isAdmin ? "Admin settings cover company details, leave policy, permissions, and notification behavior across StaffHub." : "Personal settings let employees manage notification preferences and theme choices without exposing admin controls."}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        {isAdmin ? (
          <>
            <SurfaceCard>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Company</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input value={settings.companyName || ""} onChange={(event) => setSettings({ ...settings, companyName: event.target.value })} placeholder="Company name" className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" />
                <input value={settings.companyEmail || ""} onChange={(event) => setSettings({ ...settings, companyEmail: event.target.value })} placeholder="Company email" className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" />
                <input value={settings.companyPhone || ""} onChange={(event) => setSettings({ ...settings, companyPhone: event.target.value })} placeholder="Company phone" className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white md:col-span-2" />
              </div>
            </SurfaceCard>

            <SurfaceCard>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Leave Policy</p>
              <div className="mt-5 grid gap-4">
                <input type="number" value={settings.leavePolicy?.maxLeavesPerDay || 1} onChange={(event) => setSettings({ ...settings, leavePolicy: { ...settings.leavePolicy!, maxLeavesPerDay: Number(event.target.value) } })} className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" />
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                  <input type="checkbox" checked={!!settings.leavePolicy?.allowAdminOverride} onChange={(event) => setSettings({ ...settings, leavePolicy: { ...settings.leavePolicy!, allowAdminOverride: event.target.checked } })} />
                  Allow admin override for leave conflicts
                </label>
              </div>
            </SurfaceCard>

            <SurfaceCard>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Permissions</p>
              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <input type="checkbox" checked={!!settings.rolePermissions?.adminCanManageSettings} onChange={(event) => setSettings({ ...settings, rolePermissions: { ...settings.rolePermissions!, adminCanManageSettings: event.target.checked } })} />
                  Admin can manage system settings
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <input type="checkbox" checked={!!settings.rolePermissions?.employeeCanEditProfile} onChange={(event) => setSettings({ ...settings, rolePermissions: { ...settings.rolePermissions!, employeeCanEditProfile: event.target.checked } })} />
                  Employees can edit their profile
                </label>
              </div>
            </SurfaceCard>

            <SurfaceCard className="xl:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Email Automation</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Birthday and holiday alerts</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => void runNotificationsNow()}
                    type="button"
                    disabled={runningNotifications}
                    className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {runningNotifications ? "Running..." : "Run Now"}
                  </button>
                  <button onClick={addHoliday} type="button" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-violet-400/30 hover:bg-violet-500/10">
                    Add Holiday
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                  <input type="checkbox" checked={!!settings.notifications?.emailEnabled} onChange={(event) => setSettings({ ...settings, notifications: { ...settings.notifications!, emailEnabled: event.target.checked } })} />
                  Enable email notifications
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                  <input type="checkbox" checked={!!settings.notifications?.birthdayAlertsEnabled} onChange={(event) => setSettings({ ...settings, notifications: { ...settings.notifications!, birthdayAlertsEnabled: event.target.checked } })} />
                  Send birthday emails
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 md:col-span-2">
                  <input type="checkbox" checked={!!settings.notifications?.holidayAlertsEnabled} onChange={(event) => setSettings({ ...settings, notifications: { ...settings.notifications!, holidayAlertsEnabled: event.target.checked } })} />
                  Send holiday emails
                </label>
                <input value={settings.notifications?.senderName || ""} onChange={(event) => setSettings({ ...settings, notifications: { ...settings.notifications!, senderName: event.target.value } })} placeholder="Sender name" className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" />
                <input value={settings.notifications?.senderEmail || ""} onChange={(event) => setSettings({ ...settings, notifications: { ...settings.notifications!, senderEmail: event.target.value } })} placeholder="Sender email" className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white" />
                <input value={settings.notifications?.scheduleCron || ""} onChange={(event) => setSettings({ ...settings, notifications: { ...settings.notifications!, scheduleCron: event.target.value } })} placeholder="Cron schedule, e.g. 0 8 * * *" className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white md:col-span-2" />
              </div>

              <div className="mt-6 space-y-4">
                {holidays.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center text-sm text-slate-400">
                    No holidays configured yet. Add entries using `MM-DD` format such as `01-01`.
                  </div>
                ) : (
                  holidays.map((holiday, index) => (
                    <div key={`${holiday.name}-${index}`} className="grid gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1.1fr_0.7fr_1.4fr_auto_auto]">
                      <input value={holiday.name} onChange={(event) => updateHoliday(index, "name", event.target.value)} placeholder="Holiday name" className="h-12 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-white" />
                      <input value={holiday.monthDay} onChange={(event) => updateHoliday(index, "monthDay", event.target.value)} placeholder="MM-DD" className="h-12 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-white" />
                      <input value={holiday.description || ""} onChange={(event) => updateHoliday(index, "description", event.target.value)} placeholder="Optional message" className="h-12 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-white" />
                      <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-slate-300">
                        <input type="checkbox" checked={holiday.active} onChange={(event) => updateHoliday(index, "active", event.target.checked)} />
                        Active
                      </label>
                      <button type="button" onClick={() => removeHoliday(index)} className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 hover:bg-rose-500/20">
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                SMTP credentials stay in `server/.env`. This panel controls who gets birthday and holiday emails, the sender identity, and the recurring holiday calendar.
              </p>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Recent Notification Logs</p>
                <div className="mt-4 overflow-hidden rounded-3xl border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10 text-left">
                      <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.22em] text-slate-400">
                        <tr>
                          <th className="px-5 py-4">Type</th>
                          <th className="px-5 py-4">Recipient</th>
                          <th className="px-5 py-4">Subject</th>
                          <th className="px-5 py-4">Status</th>
                          <th className="px-5 py-4">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/8 bg-slate-950/40 text-sm text-slate-200">
                        {notificationLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-12 text-center text-slate-400">No notification logs yet.</td>
                          </tr>
                        ) : (
                          notificationLogs.map((log) => (
                            <tr key={log._id} className="align-top hover:bg-white/[0.03]">
                              <td className="px-5 py-4">
                                <div className="font-medium text-white">{log.type}</div>
                                {log.holidayName ? <div className="mt-1 text-xs text-slate-500">{log.holidayName}</div> : null}
                              </td>
                              <td className="px-5 py-4">
                                <div className="font-medium text-white">{log.recipientName || "Unknown"}</div>
                                <div className="mt-1 text-sm text-slate-400">{log.recipientEmail}</div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="max-w-[260px] whitespace-normal text-slate-300">{log.subject}</div>
                                {log.errorMessage ? <div className="mt-1 text-xs text-rose-300">{log.errorMessage}</div> : null}
                              </td>
                              <td className="px-5 py-4">
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${log.status === "sent" ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200" : "border border-rose-400/20 bg-rose-500/10 text-rose-200"}`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-slate-300">{new Date(log.createdAt).toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          </>
        ) : null}

        <SurfaceCard>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">Preferences</p>
          <div className="mt-5 space-y-4 text-sm text-slate-300">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <input type="checkbox" checked={!!settings.notifications?.emailEnabled} onChange={(event) => setSettings({ ...settings, notifications: { ...settings.notifications!, emailEnabled: event.target.checked } })} />
              Email notifications enabled
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <input type="checkbox" checked={!!settings.employeePreferences?.emailNotifications} onChange={(event) => setSettings({ ...settings, employeePreferences: { ...settings.employeePreferences!, emailNotifications: event.target.checked } })} />
              Personal notification preference
            </label>
            <select value={settings.employeePreferences?.theme || "dark"} onChange={(event) => setSettings({ ...settings, employeePreferences: { ...settings.employeePreferences!, theme: event.target.value as "dark" | "light" } })} className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white">
              <option className="bg-slate-950" value="dark">Dark mode</option>
              <option className="bg-slate-950" value="light">Light mode</option>
            </select>
          </div>
        </SurfaceCard>
      </div>

      <div>
        <button onClick={saveSettings} className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] hover:-translate-y-0.5">
          {isAdmin ? "Save Settings" : "Save Preferences"}
        </button>
      </div>
    </OfficeShell>
  );
}
