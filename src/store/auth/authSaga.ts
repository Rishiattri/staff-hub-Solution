import { call, put, takeLatest } from "redux-saga/effects";
import { supabase } from "../../services/api/supabaseClient";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  signupRequest,
  signupSuccess,
  signupFailure
} from "./authSlice";
import type { AuthSuccessPayload, LoginPayload, SignupPayload } from "./authTypes";

function getErrorMessage(error: unknown) {
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
    const { email, password } = action.payload;
    const { data, error } = yield call([supabase.auth, supabase.auth.signInWithPassword], { email, password });
    if (error) throw error;
    const payload: AuthSuccessPayload = {
      token: data.session?.access_token || "",
      user: {
        id: data.user?.id || "",
        fullName: data.user?.user_metadata?.fullName || data.user?.email || "",
        email: data.user?.email || "",
        role: data.user?.role || "employee"
      }
    };
    persistAuth(payload);
    yield put(loginSuccess(payload));
  } catch (error) {
    yield put(loginFailure(getErrorMessage(error)));
  }
}

function* handleSignup(action: { payload: SignupPayload }): Generator {
  try {
    const { email, password, fullName } = action.payload;
    const { data, error } = yield call([supabase.auth, supabase.auth.signUp], {
      email,
      password,
      options: { data: { fullName } }
    });
    if (error) throw error;
    const payload: AuthSuccessPayload = {
      token: data.session?.access_token || "",
      user: {
        id: data.user?.id || "",
        fullName: data.user?.user_metadata?.fullName || data.user?.email || "",
        email: data.user?.email || "",
        role: data.user?.role || "employee"
      }
    };
    persistAuth(payload);
    yield put(signupSuccess(payload));
  } catch (error) {
    yield put(signupFailure(getErrorMessage(error)));
  }
}

export function* authSaga() {
  yield takeLatest(loginRequest, handleLogin);
  yield takeLatest(signupRequest, handleSignup);
}
