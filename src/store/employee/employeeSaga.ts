import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../services/api/supabaseClient";

import {
  addEmployeeRequest,
  addEmployeeSuccess,
  addEmployeeFailure,
  getEmployeesRequest,
  getEmployeesSuccess,
  getEmployeesFailure
} from "./employeeSlice";

const EMPLOYEES_TABLE = "employees";

type EmployeePayload = Record<string, unknown>;

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

// ADD EMPLOYEE
function* addEmployee(action: PayloadAction<EmployeePayload>) {
  try {
    const { error } = yield call([supabase, supabase.from(EMPLOYEES_TABLE).insert], [action.payload]);
    if (error) throw error;
    yield put(addEmployeeSuccess());
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Employee create failed");
    yield put(addEmployeeFailure(message));
  }
}


// GET EMPLOYEES
function* getEmployees() {
  try {
    const { data, error } = yield call([supabase, supabase.from(EMPLOYEES_TABLE).select], "*");
    if (error) throw error;
    yield put(getEmployeesSuccess(data || []));
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Employee fetch failed");
    yield put(getEmployeesFailure(message));
  }
}

export default function* employeeSaga() {
  yield takeLatest(addEmployeeRequest.type, addEmployee);
  yield takeLatest(getEmployeesRequest.type, getEmployees);
}
