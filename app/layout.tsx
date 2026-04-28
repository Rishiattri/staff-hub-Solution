"use client";

import "./globals.css";
import { Provider } from "react-redux";
import { useEffect } from "react";

import { hydrateAuth } from "../src/store/auth/authSlice";
import { store } from "../src/store";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = localStorage.getItem("staffhub_auth");

    if (!raw) {
      return;
    }

    try {
      store.dispatch(hydrateAuth(JSON.parse(raw)));
    } catch {
      localStorage.removeItem("staffhub_auth");
    }
  }, []);

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <AuthBootstrap>{children}</AuthBootstrap>
        </Provider>
      </body>
    </html>
  );
}
