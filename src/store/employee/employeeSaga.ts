import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

import {
  addEmployeeRequest,
  addEmployeeSuccess,
  addEmployeeFailure,
  getEmployeesRequest,
  getEmployeesSuccess,
  getEmployeesFailure
} from "./employeeSlice";

const API = "http://localhost:3001/api/employees";

type EmployeePayload = Record<string, unknown>;
type EmployeesResponse = {
  data: unknown;
};
type SagaError = {
  message?: string;
};

// ADD EMPLOYEE
function* addEmployee(action: PayloadAction<EmployeePayload>) {
  try {
    yield call(axios.post, `${API}/add`, action.payload);
    yield put(addEmployeeSuccess());
  } catch (error) {
    const message = (error as SagaError).message || "Employee create failed";
    yield put(addEmployeeFailure(message));
  }
}


// GET EMPLOYEES
function* getEmployees() {
  try {
    const res: EmployeesResponse = yield call(axios.get, API);
    yield put(getEmployeesSuccess(res.data));
  } catch (error) {
    const message = (error as SagaError).message || "Employee fetch failed";
    yield put(getEmployeesFailure(message));
  }
}

export default function* employeeSaga() {
  yield takeLatest(addEmployeeRequest.type, addEmployee);
  yield takeLatest(getEmployeesRequest.type, getEmployees);
}
