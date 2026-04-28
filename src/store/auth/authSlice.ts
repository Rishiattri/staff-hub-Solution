import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthSuccessPayload, LoginPayload, SignupPayload } from "./authTypes";

const initialState: AuthState = {
  loading: false,
  error: null,
  isAuthenticated: false,
  user: null,
  token: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest: (state, action: PayloadAction<LoginPayload>) => {
      void action.payload;
      
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<AuthSuccessPayload>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    signupRequest: (state, action: PayloadAction<SignupPayload>) => {
      void action.payload;
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (state, action: PayloadAction<AuthSuccessPayload>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    signupFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    hydrateAuth: (state, action: PayloadAction<AuthSuccessPayload | null>) => {
      if (!action.payload) {
        return;
      }

      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  signupRequest,
  signupSuccess,
  signupFailure,
  hydrateAuth,
  logout
} = authSlice.actions;

export default authSlice.reducer;
