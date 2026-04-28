import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  signupRequest,
  signupSuccess,
  signupFailure
} from "./authSlice";
import type { AuthSuccessPayload, LoginPayload, SignupPayload } from "./authTypes";

const API_URL = "http://localhost:3001/api";

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "Request failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Request failed";
}

function persistAuth(data: AuthSuccessPayload) {
  if (typeof window !== "undefined") {
    localStorage.setItem("staffhub_auth", JSON.stringify(data));
  }
}

function* handleLogin(action: { payload: LoginPayload }): Generator {
  try {
    const res = (yield call(axios.post, `${API_URL}/login`, action.payload)) as {
      data: AuthSuccessPayload;
    };

    persistAuth(res.data);
    yield put(loginSuccess(res.data));
  } catch (error) {
    yield put(loginFailure(getErrorMessage(error)));
  }
}

function* handleSignup(action: { payload: SignupPayload }): Generator {
  try {
    const res = (yield call(axios.post, `${API_URL}/signup`, action.payload)) as {
      data: AuthSuccessPayload;
    };

    persistAuth(res.data);
    yield put(signupSuccess(res.data));
  } catch (error) {
    yield put(signupFailure(getErrorMessage(error)));
  }
}

export function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(signupRequest.type, handleSignup);
}
