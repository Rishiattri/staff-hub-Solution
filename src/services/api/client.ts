import { supabase } from "./supabaseClient";

type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "employee";
};

type StoredAuth = {
  token: string;
  user: AuthUser;
};

type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

type SupabaseError = {
  message: string;
  code?: string | null;
};

const SETTINGS_STORAGE_KEY = "staffhub_settings";
const NOTIFICATION_LOGS_STORAGE_KEY = "staffhub_notification_logs";
const PROFILE_STORAGE_PREFIX = "staffhub_profile_";

const LEAVE_DEFAULTS = {
  Casual: 12,
  Sick: 12,
  Earned: 12,
  Unpaid: 0
} as const;

const EMPLOYEE_TABLES = ["Employee", "employees", "employee", "Employees"] as const;
const PROJECT_TABLES = ["Project", "projects", "project", "Projects"] as const;
const LEAVE_TABLES = ["Leave", "leaves", "leave", "Leaves"] as const;
const ATTENDANCE_TABLES = ["Attendance", "attendance_records", "attendance", "attendanceRecords"] as const;
const SALARY_TABLES = ["Salary", "salary", "salaries"] as const;
const SETTINGS_TABLES = ["settings"] as const;
const NOTIFICATION_LOG_TABLES = ["notification_logs", "notifications_logs"] as const;
const tableResolutionCache = new Map<string, string | null>();
const inflightApiRequests = new Map<string, Promise<unknown>>();
const ENABLE_OPTIONAL_DB_TABLES = process.env.NEXT_PUBLIC_ENABLE_OPTIONAL_DB_TABLES === "true";

function getTableSetKey(tables: readonly string[]) {
  return tables.join("|");
}

if (!ENABLE_OPTIONAL_DB_TABLES) {
  tableResolutionCache.set(getTableSetKey(SALARY_TABLES), null);
  tableResolutionCache.set(getTableSetKey(SETTINGS_TABLES), null);
  tableResolutionCache.set(getTableSetKey(NOTIFICATION_LOG_TABLES), null);
}

function getCandidateTables(tables: readonly string[]) {
  const key = getTableSetKey(tables);
  const cached = tableResolutionCache.get(key);

  if (cached === null) {
    return [];
  }

  if (!cached) {
    return [...tables];
  }

  return [cached, ...tables.filter((table) => table !== cached)];
}

function rememberResolvedTable(tables: readonly string[], table: string) {
  tableResolutionCache.set(getTableSetKey(tables), table);
}

function rememberMissingTables(tables: readonly string[]) {
  tableResolutionCache.set(getTableSetKey(tables), null);
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function parseBody(body: BodyInit | null | undefined): Record<string, unknown> {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    return parseJson<Record<string, unknown>>(body, {});
  }

  return {};
}

function firstNonEmpty(values: unknown[]) {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized.length > 0 && normalized !== "undefined" && normalized !== "null") {
      return normalized;
    }
  }
  return "";
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function toIso(value: unknown) {
  if (!value) {
    return new Date().toISOString();
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}

function toDateOnly(value: unknown) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return getTodayDateString();
  }

  return date.toISOString().slice(0, 10);
}

function calculateLeaveDays(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }

  const dayMs = 1000 * 60 * 60 * 24;
  const diff = Math.floor((end.getTime() - start.getTime()) / dayMs) + 1;
  return Math.max(1, diff);
}

function minutesBetween(startIso: string, endIso: string) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return 0;
  }

  return Math.round((end - start) / (1000 * 60));
}

function attendanceStatusFromMinutes(workedMinutes: number): "Present" | "Half Day" {
  return workedMinutes >= 480 ? "Present" : "Half Day";
}

function mapId<T extends Record<string, unknown>>(row: T) {
  const resolvedId =
    row._id ??
    row.id ??
    row.projectid ??
    row.project_id ??
    row.employeeid ??
    row.employee_id ??
    row.leaveid ??
    row.leave_id ??
    row.attendanceid ??
    row.attendance_id;
  return {
    ...row,
    _id: resolvedId ? String(resolvedId) : ""
  };
}

function getLocalStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  return parseJson<T>(localStorage.getItem(key), fallback);
}

function setLocalStorageItem<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

function isMissingTable(error: SupabaseError | null | undefined) {
  if (!error) {
    return false;
  }

  if (error.code === "42P01" || error.code === "PGRST205") {
    return true;
  }

  return /does not exist|relation .* does not exist|could not find the table/i.test(error.message);
}

function isMissingColumn(error: SupabaseError | null | undefined) {
  if (!error) {
    return false;
  }

  if (error.code === "PGRST204" || error.code === "42703") {
    return true;
  }

  return /column .* does not exist|could not find the .* column/i.test(error.message);
}

function extractMissingColumnName(error: SupabaseError | null | undefined) {
  if (!error?.message) {
    return null;
  }

  const singleQuoteMatch = error.message.match(/Could not find the '([^']+)' column/i);
  if (singleQuoteMatch?.[1]) {
    return singleQuoteMatch[1];
  }

  const doubleQuoteMatch = error.message.match(/column \"([^\"]+)\" does not exist/i);
  if (doubleQuoteMatch?.[1]) {
    return doubleQuoteMatch[1];
  }

  return null;
}

async function selectWithTableFallback<T>(tables: readonly string[], query: string) {
  let lastError: SupabaseError | null = null;
  const candidates = getCandidateTables(tables);

  if (candidates.length === 0) {
    return {
      data: [] as T[],
      table: tables[0],
      error: { message: "No table available for query" }
    };
  }

  for (const table of candidates) {
    const { data, error } = await supabase.from(table).select(query);

    if (!error) {
      rememberResolvedTable(tables, table);
      return { data: (data || []) as T[], table, error: null as SupabaseError | null };
    }

    if (!isMissingTable(error)) {
      return { data: [] as T[], table, error };
    }

    lastError = error;
  }

  if (lastError && isMissingTable(lastError)) {
    rememberMissingTables(tables);
  }

  return {
    data: [] as T[],
    table: tables[0],
    error: lastError || { message: "No table available for query" }
  };
}

async function insertWithTableFallback(tables: readonly string[], payload: Record<string, unknown>) {
  let lastError: SupabaseError | null = null;
  const candidates = getCandidateTables(tables);

  if (candidates.length === 0) {
    return { error: { message: "No table available for insert" } };
  }

  for (const table of candidates) {
    const candidatePayload = { ...payload };
    const maxAttempts = Math.max(1, Object.keys(candidatePayload).length + 1);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const { error } = await supabase.from(table).insert([candidatePayload]);

      if (!error) {
        rememberResolvedTable(tables, table);
        return { error: null as SupabaseError | null };
      }

      if (isMissingColumn(error)) {
        const missingColumn = extractMissingColumnName(error);
        if (missingColumn && missingColumn in candidatePayload) {
          delete candidatePayload[missingColumn];
          if (Object.keys(candidatePayload).length > 0) {
            continue;
          }
        }
      }

      if (!isMissingTable(error)) {
        return { error };
      }

      lastError = error;
      break;
    }
  }

  if (lastError && isMissingTable(lastError)) {
    rememberMissingTables(tables);
  }

  return { error: lastError || { message: "No table available for insert" } };
}

async function deleteByIdWithTableFallback(tables: readonly string[], id: string) {
  let lastError: SupabaseError | null = null;
  const keyCandidates = ["id", "_id", "projectid", "project_id", "employeeid", "employee_id", "leaveid", "leave_id", "attendanceid", "attendance_id"];
  const candidates = getCandidateTables(tables);

  if (candidates.length === 0) {
    return { error: { message: "No table available for delete" } };
  }

  for (const table of candidates) {
    for (const key of keyCandidates) {
      const result = await supabase.from(table).delete().eq(key, id);
      if (!result.error) {
        rememberResolvedTable(tables, table);
        return { error: null as SupabaseError | null };
      }

      if (isMissingColumn(result.error)) {
        lastError = result.error;
        continue;
      }

      if (isMissingTable(result.error)) {
        lastError = result.error;
        break;
      }

      return { error: result.error };
    }
  }

  if (lastError && isMissingTable(lastError)) {
    rememberMissingTables(tables);
  }

  return { error: lastError || { message: "No table available for delete" } };
}

async function updateByIdWithTableFallback(
  tables: readonly string[],
  id: string,
  payload: Record<string, unknown>
) {
  let lastError: SupabaseError | null = null;
  const keyCandidates = ["id", "_id", "projectid", "project_id", "employeeid", "employee_id", "leaveid", "leave_id", "attendanceid", "attendance_id"];
  const candidates = getCandidateTables(tables);

  if (candidates.length === 0) {
    return { error: { message: "No table available for update" } };
  }

  for (const table of candidates) {
    for (const key of keyCandidates) {
      const result = await supabase.from(table).update(payload).eq(key, id);
      if (!result.error) {
        rememberResolvedTable(tables, table);
        return { error: null as SupabaseError | null };
      }

      if (isMissingColumn(result.error)) {
        lastError = result.error;
        continue;
      }

      if (isMissingTable(result.error)) {
        lastError = result.error;
        break;
      }

      return { error: result.error };
    }
  }

  if (lastError && isMissingTable(lastError)) {
    rememberMissingTables(tables);
  }

  return { error: lastError || { message: "No table available for update" } };
}

async function selectEmployeeByEmail(email: string) {
  let lastError: SupabaseError | null = null;
  const candidates = getCandidateTables(EMPLOYEE_TABLES);

  if (candidates.length === 0) {
    return { data: null, error: { message: "No table available for query" } };
  }

  for (const table of candidates) {
    const { data, error } = await supabase.from(table).select("*").eq("email", email).maybeSingle();

    if (!error) {
      rememberResolvedTable(EMPLOYEE_TABLES, table);
      return { data: (data || null) as Record<string, unknown> | null, error: null as SupabaseError | null };
    }

    if (!isMissingTable(error)) {
      return { data: null, error };
    }

    lastError = error;
  }

  if (lastError && isMissingTable(lastError)) {
    rememberMissingTables(EMPLOYEE_TABLES);
  }

  return { data: null, error: lastError };
}

function throwIfError(error: SupabaseError | null, fallback = "Request failed") {
  if (error) {
    throw new Error(error.message || fallback);
  }
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem("staffhub_auth");
  return raw ? parseJson<StoredAuth | null>(raw, null) : null;
}

function getRequiredAuth() {
  const auth = getStoredAuth();

  if (!auth?.user) {
    throw new Error("Authentication required");
  }

  return auth;
}

async function getEmployees() {
  const { data, error } = await selectWithTableFallback<Record<string, unknown>>(EMPLOYEE_TABLES, "*");
  throwIfError(error, "Failed to load employees");

  const items = Array.isArray(data) ? data.map((row) => mapId(row as Record<string, unknown>)) : [];

  return {
    items,
    totalEmployees: items.length
  };
}

async function createEmployee(payload: Record<string, unknown>) {
  const fullName = String(payload.fullName || payload.fullname || payload.full_name || "").trim();
  const email = String(payload.email || "").trim();
  const phoneNumber = String(payload.phoneNumber || payload.phonenumber || payload.phone_number || "").trim();
  const role = String(payload.role || "").trim();
  const education = String(payload.education || "").trim();
  const address = String(payload.address || "").trim();
  const experienceLevel = String(payload.experienceLevel || payload.experiencelevel || payload.experience_level || "Fresher").trim();
  const joiningDate = String(payload.joiningDate || payload.joiningdate || payload.joining_date || "").trim();
  const profileImage = String(payload.profileImage || payload.profileimage || payload.profile_image || "").trim();

  const candidates: Record<string, unknown>[] = [
    {
      fullName,
      email,
      phoneNumber,
      role,
      education,
      address,
      experienceLevel,
      joiningDate,
      profileImage
    },
    {
      full_name: fullName,
      email,
      phone_number: phoneNumber,
      role,
      education,
      address,
      experience_level: experienceLevel,
      joining_date: joiningDate || null,
      profile_image: profileImage
    }
  ];

  let lastError: SupabaseError | null = null;
  for (const candidate of candidates) {
    const record = Object.fromEntries(
      Object.entries(candidate).filter(([, value]) => String(value ?? "").trim().length > 0 || value === null)
    );
    const { error } = await insertWithTableFallback(EMPLOYEE_TABLES, record);
    if (!error) {
      return { message: "Employee added successfully" };
    }
    lastError = error;
  }

  throwIfError(lastError, "Failed to create employee");
  return { message: "Employee added successfully" };
}

async function deleteEmployee(id: string) {
  const { error } = await deleteByIdWithTableFallback(EMPLOYEE_TABLES, id);
  throwIfError(error, "Failed to delete employee");

  return { message: "Employee deleted successfully" };
}

async function getProjects() {
  const { data, error } = await selectWithTableFallback<Record<string, unknown>>(PROJECT_TABLES, "*");
  throwIfError(error, "Failed to load projects");

  const rows = Array.isArray(data)
    ? data.map((row) => {
        const base = mapId(row as Record<string, unknown>);
        return {
          ...base,
          projectName: String(base.projectName || base.projectname || base.project_name || base.name || ""),
          status: String(base.status || base.projectStatus || "Active"),
          role: String(base.role || base.projectRole || ""),
          developerName: String(base.developerName || base.developername || base.developer_name || base.developer || ""),
          techStack: String(base.techStack || base.techstack || base.tech_stack || base.stack || "")
        };
      })
    : [];
  return { data: rows };
}

async function addProject(payload: Record<string, unknown>) {
  const projectName = String(payload.projectName || payload.projectname || payload.project_name || payload.name || "");
  const status = String(payload.status || payload.projectStatus || "Active");
  const role = String(payload.role || payload.projectRole || "");
  const developerName = String(payload.developerName || payload.developername || payload.developer_name || payload.developer || "");
  const techStack = String(payload.techStack || payload.techstack || payload.tech_stack || payload.stack || "");

  const candidates: Record<string, unknown>[] = [
    { projectname: projectName, status, role, developername: developerName, techstack: techStack },
    { projectName, status, role, developerName, techStack },
    { project_name: projectName, status, role, developer_name: developerName, tech_stack: techStack },
    { name: projectName, status, role, developer: developerName, stack: techStack }
  ];

  let lastError: SupabaseError | null = null;

  for (const candidate of candidates) {
    const record = Object.fromEntries(
      Object.entries(candidate).filter(([, value]) => String(value ?? "").trim().length > 0)
    );

    const { error } = await insertWithTableFallback(PROJECT_TABLES, record);
    if (!error) {
      return { message: "Project added successfully" };
    }

    lastError = error;
  }

  throwIfError(lastError, "Failed to create project");

  return { message: "Project added successfully" };
}

async function deleteProject(id: string) {
  const { error } = await deleteByIdWithTableFallback(PROJECT_TABLES, id);
  throwIfError(error, "Failed to delete project");

  return { message: "Project deleted successfully" };
}

async function deleteProjectByIdentity(payload: Record<string, unknown>) {
  const id = firstNonEmpty([
    payload.id,
    payload._id,
    payload.projectid,
    payload.project_id
  ]);

  if (id) {
    return deleteProject(id);
  }

  const projectName = firstNonEmpty([
    payload.projectname,
    payload.projectName,
    payload.project_name,
    payload.name
  ]);

  if (!projectName) {
    throw new Error("Project identifier missing. Please refresh and try again.");
  }

  const candidates = getCandidateTables(PROJECT_TABLES);
  if (candidates.length === 0) {
    throw new Error("Project table not available.");
  }

  let lastError: SupabaseError | null = null;
  const filterSets = [
    [{ column: "projectname", value: projectName }],
    [{ column: "projectName", value: projectName }],
    [{ column: "project_name", value: projectName }],
    [{ column: "name", value: projectName }]
  ];

  for (const table of candidates) {
    for (const filters of filterSets) {
      const query = filters.reduce(
        (builder, filter) => builder.eq(filter.column, filter.value),
        supabase.from(table).delete({ count: "exact" })
      );

      const result = await query;

      if (!result.error) {
        rememberResolvedTable(PROJECT_TABLES, table);
        if ((result.count || 0) > 0) {
          return { message: "Project deleted successfully" };
        }
        continue;
      }

      if (isMissingColumn(result.error)) {
        lastError = result.error;
        continue;
      }

      if (isMissingTable(result.error)) {
        lastError = result.error;
        break;
      }

      throw new Error(result.error.message || "Project delete failed");
    }
  }

  if (lastError && !isMissingTable(lastError)) {
    throw new Error(lastError.message || "Project delete failed");
  }

  throw new Error("Project could not be deleted. Check delete/select RLS policy for Project table.");
}

async function getLeaves() {
  const { data, error } = await selectWithTableFallback<Record<string, unknown>>(LEAVE_TABLES, "*");
  throwIfError(error, "Failed to load leaves");

  return {
    items: Array.isArray(data)
      ? data.map((row) => {
          const base = mapId(row as Record<string, unknown>);
          return {
            ...base,
            employeeName: String(base.employeeName || base.employeename || base.employee_name || ""),
            leaveType: String(base.leaveType || base.leavetype || base.leave_type || "Casual"),
            startDate: String(base.startDate || base.startdate || base.start_date || ""),
            endDate: String(base.endDate || base.enddate || base.end_date || ""),
            reason: String(base.reason || ""),
            days: Number(base.days || 0),
            status: String(base.status || "Pending")
          };
        })
      : []
  };
}

async function applyLeave(payload: Record<string, unknown>) {
  const startDate = toDateOnly(payload.startDate || payload.startdate || payload.start_date);
  const endDate = toDateOnly(payload.endDate || payload.enddate || payload.end_date);

  const employeeName = firstNonEmpty([
    payload.employeeName,
    payload.employeename,
    payload.employee_name
  ]);
  const leaveType = firstNonEmpty([
    payload.leaveType,
    payload.leavetype,
    payload.leave_type,
    "Casual"
  ]);
  const reason = String(payload.reason || "");
  const days = calculateLeaveDays(startDate, endDate);

  const candidates: Record<string, unknown>[] = [
    { employee_name: employeeName, leave_type: leaveType, start_date: startDate, end_date: endDate, reason, days, status: "Pending" },
    { employeename: employeeName, leavetype: leaveType, startdate: startDate, enddate: endDate, reason, days, status: "Pending" }
  ];

  let lastError: SupabaseError | null = null;
  for (const candidate of candidates) {
    const record = Object.fromEntries(
      Object.entries(candidate).filter(([, value]) => String(value ?? "").trim().length > 0)
    );
    const { error } = await insertWithTableFallback(LEAVE_TABLES, record);
    if (!error) {
      return { message: "Leave request submitted successfully" };
    }
    lastError = error;
  }

  throwIfError(lastError, "Failed to apply leave");

  return { message: "Leave request submitted successfully" };
}

async function updateLeaveStatus(id: string, payload: Record<string, unknown>) {
  const status = String(payload.status || "Pending") as LeaveStatus;

  const { error } = await updateByIdWithTableFallback(LEAVE_TABLES, id, { status });

  throwIfError(error, "Failed to update leave status");

  return { message: `Leave ${status.toLowerCase()} successfully` };
}

async function getLeaveBalances() {
  const { items } = await getLeaves();

  type LeaveItem = {
    employeeName?: string;
    leaveType?: "Casual" | "Sick" | "Earned" | "Unpaid";
    days?: number;
    status?: LeaveStatus;
    _id?: string;
  };

  const rows = items as LeaveItem[];
  const grouped = new Map<
    string,
    {
      _id: string;
      employeeName: string;
      casual: { total: number; used: number; remaining: number };
      sick: { total: number; used: number; remaining: number };
      earned: { total: number; used: number; remaining: number };
      unpaid: { total: number; used: number; remaining: number };
    }
  >();

  for (const row of rows) {
    const employeeName = String(row.employeeName || "Unknown");

    if (!grouped.has(employeeName)) {
      grouped.set(employeeName, {
        _id: row._id || employeeName,
        employeeName,
        casual: { total: LEAVE_DEFAULTS.Casual, used: 0, remaining: LEAVE_DEFAULTS.Casual },
        sick: { total: LEAVE_DEFAULTS.Sick, used: 0, remaining: LEAVE_DEFAULTS.Sick },
        earned: { total: LEAVE_DEFAULTS.Earned, used: 0, remaining: LEAVE_DEFAULTS.Earned },
        unpaid: { total: LEAVE_DEFAULTS.Unpaid, used: 0, remaining: LEAVE_DEFAULTS.Unpaid }
      });
    }

    if (row.status !== "Approved") {
      continue;
    }

    const balance = grouped.get(employeeName);
    if (!balance) {
      continue;
    }

    const days = Math.max(0, Number(row.days || 0));

    if (row.leaveType === "Casual") {
      balance.casual.used += days;
      balance.casual.remaining = Math.max(0, balance.casual.total - balance.casual.used);
    } else if (row.leaveType === "Sick") {
      balance.sick.used += days;
      balance.sick.remaining = Math.max(0, balance.sick.total - balance.sick.used);
    } else if (row.leaveType === "Earned") {
      balance.earned.used += days;
      balance.earned.remaining = Math.max(0, balance.earned.total - balance.earned.used);
    } else {
      balance.unpaid.used += days;
      balance.unpaid.remaining = Math.max(0, balance.unpaid.total - balance.unpaid.used);
    }
  }

  return {
    items: Array.from(grouped.values())
  };
}

async function getSalaryRows() {
  if (tableResolutionCache.get(getTableSetKey(SALARY_TABLES)) === null) {
    return [];
  }

  const { data, error } = await selectWithTableFallback<Record<string, unknown>>(SALARY_TABLES, "*");
  if (error && isMissingTable(error)) {
    rememberMissingTables(SALARY_TABLES);
    return [];
  }
  throwIfError(error, "Failed to load salaries");

  return Array.isArray(data) ? data.map((row) => mapId(row)) : [];
}

async function createSalary(payload: Record<string, unknown>) {
  const baseSalary = Number(payload.baseSalary || 0);
  const bonus = Number(payload.bonus || 0);
  const deductions = Number(payload.deductions || 0);

  const record = {
    ...payload,
    baseSalary,
    bonus,
    deductions,
    netSalary: baseSalary + bonus - deductions,
    createdAt: new Date().toISOString()
  };

  const { error } = await insertWithTableFallback(SALARY_TABLES, record as Record<string, unknown>);
  throwIfError(error, "Failed to create salary slip");

  return { message: "Salary slip saved successfully" };
}

async function getAttendanceRows() {
  const auth = getRequiredAuth();
  const isAdmin = auth.user.role === "admin";

  let lastError: SupabaseError | null = null;
  const candidates = getCandidateTables(ATTENDANCE_TABLES);

  if (candidates.length === 0) {
    return [];
  }

  for (const table of candidates) {
    let query = supabase.from(table).select("*");
    if (!isAdmin) {
      query = query.eq("employeeEmail", auth.user.email);
    }

    const result = await query;
    if (!result.error) {
      rememberResolvedTable(ATTENDANCE_TABLES, table);
      return Array.isArray(result.data) ? result.data.map((row) => mapId(row as Record<string, unknown>)) : [];
    }

    if (!isMissingTable(result.error)) {
      throw new Error(result.error.message || "Failed to load attendance");
    }

    lastError = result.error;
  }

  if (lastError && isMissingTable(lastError)) {
    rememberMissingTables(ATTENDANCE_TABLES);
  }

  throwIfError(lastError, "Failed to load attendance");
  return [];
}

async function getAttendanceSummary() {
  const rows = await getAttendanceRows();

  const totalDays = rows.length;
  const presentDays = rows.filter((row) => String(row.status) === "Present").length;
  const halfDays = rows.filter((row) => String(row.status) === "Half Day").length;
  const inProgress = rows.filter((row) => String(row.status) === "In Progress").length;

  return {
    data: {
      totalDays,
      presentDays,
      halfDays,
      inProgress
    }
  };
}

async function createAttendanceRecord(payload: Record<string, unknown>) {
  let lastError: SupabaseError | null = null;
  const candidates = getCandidateTables(ATTENDANCE_TABLES);

  if (candidates.length === 0) {
    return { error: { message: "No table available for insert" }, table: ATTENDANCE_TABLES[0] };
  }

  for (const table of candidates) {
    const { error } = await supabase.from(table).insert([payload]);
    if (!error) {
      rememberResolvedTable(ATTENDANCE_TABLES, table);
      return { error: null as SupabaseError | null, table };
    }

    if (!isMissingTable(error)) {
      return { error, table };
    }

    lastError = error;
  }

  if (lastError && isMissingTable(lastError)) {
    rememberMissingTables(ATTENDANCE_TABLES);
  }

  return { error: lastError || { message: "No table available for insert" }, table: ATTENDANCE_TABLES[0] };
}

async function updateAttendanceRecord(
  id: string,
  payload: Record<string, unknown>,
  preferredTable = ATTENDANCE_TABLES[0]
) {
  const ordered = [preferredTable, ...ATTENDANCE_TABLES.filter((table) => table !== preferredTable)];
  let lastError: SupabaseError | null = null;

  for (const table of ordered) {
    let result = await supabase.from(table).update(payload).eq("id", id);
    if (!result.error) {
      return { error: null as SupabaseError | null, table };
    }

    if (isMissingColumn(result.error)) {
      result = await supabase.from(table).update(payload).eq("_id", id);
      if (!result.error) {
        return { error: null as SupabaseError | null, table };
      }
    }

    if (!isMissingTable(result.error)) {
      return { error: result.error, table };
    }

    lastError = result.error;
  }

  return { error: lastError || { message: "No table available for update" }, table: ordered[0] };
}

async function checkIn() {
  const auth = getRequiredAuth();
  const today = getTodayDateString();

  const rows = await getAttendanceRows();
  const existing = rows.find(
    (row) => String(row.workDate || "").slice(0, 10) === today && String(row.employeeEmail || "") === auth.user.email
  );

  if (existing && existing.checkInAt && !existing.checkOutAt) {
    return { message: "Already checked in for today" };
  }

  const now = new Date().toISOString();

  if (existing && existing._id) {
    const { error } = await updateAttendanceRecord(String(existing._id), {
      checkInAt: now,
      checkOutAt: null,
      workedMinutes: 0,
      status: "In Progress"
    });

    throwIfError(error, "Failed to check in");
    return { message: "Check-in successful" };
  }

  const payload = {
    employeeId: auth.user.id,
    employeeName: auth.user.fullName,
    employeeEmail: auth.user.email,
    workDate: today,
    checkInAt: now,
    checkOutAt: null,
    workedMinutes: 0,
    status: "In Progress",
    createdAt: now
  };

  const { error } = await createAttendanceRecord(payload);
  throwIfError(error, "Failed to check in");

  return { message: "Check-in successful" };
}

async function checkOut() {
  const auth = getRequiredAuth();
  const today = getTodayDateString();

  const rows = await getAttendanceRows();
  const target = rows.find(
    (row) => String(row.workDate || "").slice(0, 10) === today && String(row.employeeEmail || "") === auth.user.email
  );

  if (!target || !target._id || !target.checkInAt) {
    throw new Error("Please check in first");
  }

  const checkoutTime = new Date().toISOString();
  const workedMinutes = minutesBetween(toIso(target.checkInAt), checkoutTime);
  const status = attendanceStatusFromMinutes(workedMinutes);

  const { error } = await updateAttendanceRecord(String(target._id), {
    checkOutAt: checkoutTime,
    workedMinutes,
    status
  });

  throwIfError(error, "Failed to check out");

  return { message: "Check-out successful" };
}

async function deleteAttendance(id: string) {
  const { error } = await deleteByIdWithTableFallback(ATTENDANCE_TABLES, id);
  throwIfError(error, "Failed to delete attendance");

  return { message: "Attendance deleted successfully" };
}

async function getProfile() {
  const auth = getRequiredAuth();
  const profileStorageKey = `${PROFILE_STORAGE_PREFIX}${auth.user.id}`;
  const localFallback = getLocalStorageItem(profileStorageKey, {
    name: auth.user.fullName,
    email: auth.user.email,
    phone: "",
    role: auth.user.role === "admin" ? "Admin" : "Employee",
    department: "General",
    joiningDate: "",
    experience: "Fresher",
    address: "",
    profileImage: ""
  });

  const byEmail = await selectEmployeeByEmail(auth.user.email);

  if (byEmail.error && !isMissingTable(byEmail.error)) {
    throw new Error(byEmail.error.message || "Failed to load profile");
  }

  const employee = (byEmail.data || {}) as Record<string, unknown>;

  return {
    data: {
      name: String(employee.fullName || localFallback.name || auth.user.fullName),
      email: String(employee.email || localFallback.email || auth.user.email),
      phone: String(employee.phoneNumber || localFallback.phone || ""),
      role: String(employee.role || localFallback.role || (auth.user.role === "admin" ? "Admin" : "Employee")),
      department: String((employee.department as string) || localFallback.department || "General"),
      joiningDate: String(employee.joiningDate || localFallback.joiningDate || ""),
      experience: String(employee.experienceLevel || localFallback.experience || "Fresher"),
      address: String(employee.address || localFallback.address || ""),
      profileImage: String(employee.profileImage || localFallback.profileImage || "")
    }
  };
}

async function updateProfile(payload: Record<string, unknown>) {
  const auth = getRequiredAuth();
  const profileStorageKey = `${PROFILE_STORAGE_PREFIX}${auth.user.id}`;

  const nextProfile = {
    ...payload,
    email: payload.email || auth.user.email
  };

  setLocalStorageItem(profileStorageKey, nextProfile);

  const employeeUpdate = {
    fullName: String(payload.name || auth.user.fullName),
    email: String(payload.email || auth.user.email),
    phoneNumber: String(payload.phone || ""),
    role: String(payload.role || "Employee"),
    department: String(payload.department || "General"),
    joiningDate: payload.joiningDate || null,
    experienceLevel: String(payload.experience || "Fresher"),
    address: String(payload.address || ""),
    profileImage: String(payload.profileImage || "")
  };

  const existing = await selectEmployeeByEmail(auth.user.email);

  if (existing.error && !isMissingTable(existing.error)) {
    throw new Error(existing.error.message || "Failed to update profile");
  }

  const existingRow = (existing.data || {}) as Record<string, unknown>;
  const id = String(existingRow.id || existingRow._id || "");

  if (id) {
    const { error } = await updateByIdWithTableFallback(EMPLOYEE_TABLES, id, employeeUpdate);
    throwIfError(error, "Failed to update profile");
  }

  return { message: "Profile updated successfully" };
}

async function changePassword(payload: Record<string, unknown>) {
  const newPassword = String(payload.newPassword || "");

  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  throwIfError(error, "Password update failed");

  return { message: "Password updated successfully" };
}

async function getSettings() {
  const auth = getRequiredAuth();
  const local = getLocalStorageItem<Record<string, unknown>>(SETTINGS_STORAGE_KEY, {});

  if (tableResolutionCache.get(getTableSetKey(SETTINGS_TABLES)) === null) {
    return { data: local };
  }

  const { data, error } = await selectWithTableFallback<Record<string, unknown>>(SETTINGS_TABLES, "*");

  if (error && isMissingTable(error)) {
    rememberMissingTables(SETTINGS_TABLES);
    return { data: local };
  }

  if (error) {
    throw new Error(error.message || "Failed to load settings");
  }

  const first = Array.isArray(data) && data.length > 0 ? (data[0] as Record<string, unknown>) : {};
  const storedOwnerId = String((first.ownerId as string) || "");

  if (storedOwnerId && auth.user.role !== "admin" && storedOwnerId !== auth.user.id) {
    return { data: local };
  }

  return {
    data: {
      ...local,
      ...first
    }
  };
}

async function saveSettings(payload: Record<string, unknown>) {
  const auth = getRequiredAuth();
  setLocalStorageItem(SETTINGS_STORAGE_KEY, payload);

  const record = {
    id: 1,
    ownerId: auth.user.id,
    ...payload,
    updatedAt: new Date().toISOString()
  };

  const { error } = await supabase.from("settings").upsert([record], { onConflict: "id" });

  if (error && isMissingTable(error)) {
    rememberMissingTables(SETTINGS_TABLES);
    return { message: "Settings saved locally (settings table not available)." };
  }

  if (error) {
    throw new Error(error.message || "Failed to save settings");
  }

  return { message: "Settings saved successfully" };
}

async function getNotificationLogs() {
  const auth = getRequiredAuth();
  const localLogs = getLocalStorageItem<Record<string, unknown>[]>(NOTIFICATION_LOGS_STORAGE_KEY, []);

  if (tableResolutionCache.get(getTableSetKey(NOTIFICATION_LOG_TABLES)) === null) {
    const filteredLocal = localLogs.filter((row) => auth.user.role === "admin" || String(row.ownerId || "") === auth.user.id);
    return { items: filteredLocal.map((row) => mapId(row as Record<string, unknown>)) };
  }

  const { data, error } = await selectWithTableFallback<Record<string, unknown>>(NOTIFICATION_LOG_TABLES, "*");

  if (error && isMissingTable(error)) {
    rememberMissingTables(NOTIFICATION_LOG_TABLES);
    const filteredLocal = localLogs.filter((row) => auth.user.role === "admin" || String(row.ownerId || "") === auth.user.id);
    return { items: filteredLocal.map((row) => mapId(row as Record<string, unknown>)) };
  }

  if (error) {
    throw new Error(error.message || "Failed to load notification logs");
  }

  const rows = Array.isArray(data) && data.length > 0 ? data : localLogs;
  const filtered = rows.filter((row) => auth.user.role === "admin" || String(row.ownerId || "") === auth.user.id);

  return {
    items: filtered.map((row) => mapId(row as Record<string, unknown>))
  };
}

async function runNotificationsNow() {
  const auth = getRequiredAuth();
  const now = new Date().toISOString();

  const settingsResponse = await getSettings();
  const settings = settingsResponse.data as {
    notifications?: {
      birthdayAlertsEnabled?: boolean;
      holidayAlertsEnabled?: boolean;
      holidays?: Array<{ name?: string; monthDay?: string; active?: boolean }>;
    };
  };

  const employeesResponse = await getEmployees();
  const employees = employeesResponse.items as Array<Record<string, unknown>>;

  const logs: Record<string, unknown>[] = [];

  if (settings.notifications?.birthdayAlertsEnabled) {
    const birthdayEmployees = employees.filter((employee) => {
      if (!employee.birthDate) {
        return false;
      }

      const birth = new Date(String(employee.birthDate));
      const today = new Date();

      return birth.getDate() === today.getDate() && birth.getMonth() === today.getMonth();
    });

    for (const employee of birthdayEmployees) {
      logs.push({
        _id: `${String(employee.id || employee._id || employee.email || "birthday")}-${now}`,
        ownerId: auth.user.id,
        type: "birthday",
        status: "sent",
        recipientName: String(employee.fullName || "Employee"),
        recipientEmail: String(employee.email || ""),
        subject: `Happy Birthday ${String(employee.fullName || "")}`,
        createdAt: now
      });
    }
  }

  if (settings.notifications?.holidayAlertsEnabled) {
    const holidays = (settings.notifications.holidays || []).filter((item) => item.active);
    const monthDay = `${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

    for (const holiday of holidays) {
      if (holiday.monthDay !== monthDay) {
        continue;
      }

      logs.push({
        _id: `${String(holiday.name || "holiday")}-${now}`,
        ownerId: auth.user.id,
        type: "holiday",
        status: "sent",
        recipientName: "All Employees",
        recipientEmail: "all@staffhub.local",
        holidayName: String(holiday.name || "Holiday"),
        subject: `${String(holiday.name || "Holiday")} greetings`,
        createdAt: now
      });
    }
  }

  const existingLogs = getLocalStorageItem<Record<string, unknown>[]>(NOTIFICATION_LOGS_STORAGE_KEY, []);
  const nextLogs = [...logs, ...existingLogs].slice(0, 200);
  setLocalStorageItem(NOTIFICATION_LOGS_STORAGE_KEY, nextLogs);

  if (logs.length > 0 && tableResolutionCache.get(getTableSetKey(NOTIFICATION_LOG_TABLES)) !== null) {
    for (const log of logs) {
      const { error } = await insertWithTableFallback(NOTIFICATION_LOG_TABLES, {
        ...log,
        id: log._id
      });

      if (error && isMissingTable(error)) {
        rememberMissingTables(NOTIFICATION_LOG_TABLES);
        break;
      }
    }
  }

  return {
    message: logs.length > 0 ? `Notification run completed (${logs.length} logs)` : "Notification run completed (no matching events today)"
  };
}

export async function api<T>(path: string, options: RequestInit = {}) {
  const method = (options.method || "GET").toUpperCase();
  const inflightKey = method === "GET" ? `${method}:${path}` : null;

  if (inflightKey) {
    const existing = inflightApiRequests.get(inflightKey);
    if (existing) {
      return (await existing) as T;
    }
  }

  const run = async () => {
  const payload = parseBody(options.body);

  const employeeMatch = path.match(/^\/employees\/([^/]+)$/);
  const projectMatch = path.match(/^\/projects\/([^/]+)$/);
  const leaveStatusMatch = path.match(/^\/leaves\/([^/]+)\/status$/);
  const attendanceDeleteMatch = path.match(/^\/attendance\/([^/]+)$/);

  if (path === "/employees" && method === "GET") {
    return (await getEmployees()) as T;
  }

  if (path === "/employees" && method === "POST") {
    return (await createEmployee(payload)) as T;
  }

  if (employeeMatch && method === "DELETE") {
    return (await deleteEmployee(employeeMatch[1])) as T;
  }

  if (path === "/projects" && method === "GET") {
    return (await getProjects()) as T;
  }

  if (path === "/projects/add" && method === "POST") {
    return (await addProject(payload)) as T;
  }

  if (projectMatch && method === "DELETE") {
    return (await deleteProject(projectMatch[1])) as T;
  }

  if (path === "/projects/delete" && method === "POST") {
    return (await deleteProjectByIdentity(payload)) as T;
  }

  if (path === "/leaves" && method === "GET") {
    return (await getLeaves()) as T;
  }

  if (path === "/leaves/apply" && method === "POST") {
    return (await applyLeave(payload)) as T;
  }

  if (path === "/leaves/balances" && method === "GET") {
    return (await getLeaveBalances()) as T;
  }

  if (leaveStatusMatch && method === "PATCH") {
    return (await updateLeaveStatus(leaveStatusMatch[1], payload)) as T;
  }

  if (path === "/salary" && method === "GET") {
    const rows = await getSalaryRows();
    return { items: rows } as T;
  }

  if (path === "/salary/me" && method === "GET") {
    const auth = getRequiredAuth();
    const rows = await getSalaryRows();
    const mine = rows.filter(
      (row) => String(row.employeeEmail || "").toLowerCase() === auth.user.email.toLowerCase() || String(row.employeeId || "") === auth.user.id
    );

    return { items: mine } as T;
  }

  if (path === "/salary" && method === "POST") {
    return (await createSalary(payload)) as T;
  }

  if (path === "/attendance" && method === "GET") {
    return { items: await getAttendanceRows() } as T;
  }

  if (path === "/attendance/summary" && method === "GET") {
    return (await getAttendanceSummary()) as T;
  }

  if (path === "/attendance/check-in" && method === "POST") {
    return (await checkIn()) as T;
  }

  if (path === "/attendance/check-out" && method === "POST") {
    return (await checkOut()) as T;
  }

  if (attendanceDeleteMatch && method === "DELETE") {
    return (await deleteAttendance(attendanceDeleteMatch[1])) as T;
  }

  if (path === "/profile/me" && method === "GET") {
    return (await getProfile()) as T;
  }

  if (path === "/profile/me" && method === "PUT") {
    return (await updateProfile(payload)) as T;
  }

  if (path === "/profile/change-password" && method === "PATCH") {
    return (await changePassword(payload)) as T;
  }

  if (path === "/settings" && method === "GET") {
    return (await getSettings()) as T;
  }

  if (path === "/settings" && method === "PUT") {
    return (await saveSettings(payload)) as T;
  }

  if (path === "/settings/notifications/logs" && method === "GET") {
    return (await getNotificationLogs()) as T;
  }

  if (path === "/settings/notifications/run" && method === "POST") {
    return (await runNotificationsNow()) as T;
  }

  throw new Error(`Unsupported API route: ${method} ${path}`);
  };

  const pending = run();
  if (inflightKey) {
    inflightApiRequests.set(inflightKey, pending as Promise<unknown>);
  }

  try {
    return (await pending) as T;
  } finally {
    if (inflightKey) {
      inflightApiRequests.delete(inflightKey);
    }
  }
}
