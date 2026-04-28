"use client";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginRequest } from "../../src/store/auth/authSlice";
import { RootState } from "../../src/store/rootReducer";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginRequest({ email, password }));
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #__next { height: 100%; overflow: hidden; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sh-spin { animation: spin 0.75s linear infinite; }
        input { font-family: inherit; }
        input::placeholder { color: #3f3f46; }

        .sh-input {
          width: 100%;
          background: #0d0d10;
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 13px 44px 13px 16px;
          font-size: 14px;
          font-family: inherit;
          color: #e4e4e7;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sh-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124,58,237,0.12);
        }
        .sh-input:hover:not(:focus) {
          border-color: rgba(255,255,255,0.14);
        }

        .sh-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
          transition: all 0.2s;
        }
        .sh-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%);
          box-shadow: 0 8px 28px rgba(124,58,237,0.45);
          transform: translateY(-1px);
        }
        .sh-submit:active:not(:disabled) { transform: translateY(0); }
        .sh-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .sh-sso {
          width: 100%;
          padding: 13px;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          color: #71717a;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
        }
        .sh-sso:hover {
          border-color: rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.06);
          color: #a1a1aa;
        }

        .sh-forgot {
          background: none; border: none; padding: 0;
          font-family: inherit; font-size: 12px;
          color: #52525b; cursor: pointer;
          transition: color 0.15s;
        }
        .sh-forgot:hover { color: #a78bfa; }

        .sh-eye {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; padding: 0;
          color: #3f3f46; cursor: pointer;
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .sh-eye:hover { color: #a78bfa; }

        .sh-icon {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          color: #3f3f46; pointer-events: none;
          display: flex; align-items: center;
        }

        .dot-bg {
          background-image: radial-gradient(circle, rgba(167,139,250,0.18) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .sh-pill {
          padding: 5px 14px; border-radius: 999px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          font-size: 11px; color: #71717a;
        }
        @media (max-width: 1024px) {
          html, body, #__next { overflow: auto; }
          .sh-auth-shell { position: static !important; min-height: 100vh !important; flex-direction: column !important; overflow: auto !important; }
          .sh-auth-left { flex: none !important; width: 100% !important; padding: 32px 24px !important; min-height: auto !important; gap: 28px !important; }
          .sh-auth-right { flex: none !important; width: 100% !important; min-height: auto !important; border-left: none !important; border-top: 1px solid rgba(255,255,255,0.06) !important; }
          .sh-auth-card { max-width: 100% !important; padding: 28px 24px 40px !important; }
          .sh-auth-stats { gap: 18px !important; flex-wrap: wrap !important; }
        }
        @media (max-width: 640px) {
          .sh-auth-left { padding: 28px 20px !important; }
          .sh-auth-right { justify-content: flex-start !important; }
          .sh-auth-card { padding: 24px 20px 32px !important; }
        }
      `}</style>

      <div className="sh-auth-shell" style={{
        position: "fixed", inset: 0,
        display: "flex",
        background: "#09090b",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        color: "#fff",
        overflow: "hidden",
      }}>

        {/* ══════════════ LEFT PANEL ══════════════ */}
        <div className="sh-auth-left" style={{
          flex: "0 0 55%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 60px",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(145deg, #0a0a10 0%, #0e0818 60%, #120a1e 100%)",
        }}>
          {/* Glow */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background:
              "radial-gradient(ellipse 60% 55% at 10% 90%, rgba(124,58,237,0.25) 0%, transparent 60%)," +
              "radial-gradient(ellipse 40% 35% at 90% 5%, rgba(192,60,210,0.12) 0%, transparent 55%)",
          }} />
          {/* Dot grid */}
          <div className="dot-bg" style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }} />

          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: "linear-gradient(135deg, #7c3aed, #c026d3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(124,58,237,0.45)",
            }}>
              <svg width="20" height="20" viewBox="0 0 18 18" fill="#fff">
                <path d="M3 3h5v5H3V3zm7 0h5v5h-5V3zm-7 7h5v5H3v-5zm7 2h2v2h-2v-2zm3-2h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 0h2v2h-2v-2z" />
              </svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.01em" }}>
              Staff<span style={{ color: "#a78bfa" }}>Hub</span>
            </span>
          </div>

          {/* Hero */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
              fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#7c3aed",
            }}>
              <span style={{ width: 22, height: 1, background: "#7c3aed", display: "block" }} />
              Workforce Intelligence
            </p>
            <h1 style={{
              fontSize: "clamp(36px, 3.8vw, 58px)",
              fontWeight: 800, lineHeight: 1.1,
              color: "#fafafa", marginBottom: 18,
              letterSpacing: "-0.025em",
              textShadow: "0 0 50px rgba(167,139,250,0.25)",
            }}>
              Run your team<br />
              with{" "}
              <span style={{ color: "#a78bfa", fontStyle: "italic" }}>clarity.</span>
            </h1>
            <p style={{
              fontSize: 14, fontWeight: 300, color: "#52525b",
              lineHeight: 1.8, maxWidth: 340, marginBottom: 28,
            }}>
              Scheduling, payroll, and performance — unified in one workspace built for modern teams.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Shift Scheduling", "Payroll Sync", "HR Analytics", "Leave Tracking"].map((f) => (
                <span key={f} className="sh-pill">{f}</span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="sh-auth-stats" style={{ display: "flex", gap: 36, position: "relative", zIndex: 1 }}>
            {[
              { value: "12k+", label: "Active teams" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "4.9 ★", label: "Avg. rating" },
            ].map((s) => (
              <div key={s.label} style={{ borderLeft: "1px solid rgba(255,255,255,0.10)", paddingLeft: 16 }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#fafafa", letterSpacing: "-0.02em" }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "#3f3f46", marginTop: 3, fontWeight: 300 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ RIGHT PANEL ══════════════ */}
        <div className="sh-auth-right" style={{
          flex: "0 0 45%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f12",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Subtle right bg glow */}
          <div style={{
            position: "absolute", bottom: "-100px", right: "-100px",
            width: 350, height: 350, borderRadius: "50%",
            background: "rgba(124,58,237,0.06)", filter: "blur(80px)",
            pointerEvents: "none",
          }} />

          {/* Top accent line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, transparent 0%, #7c3aed 50%, transparent 100%)",
          }} />

          {/* Form card */}
          <div className="sh-auth-card" style={{
            width: "100%",
            maxWidth: 420,
            padding: "0 48px",
            position: "relative",
            zIndex: 1,
          }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontSize: 28, fontWeight: 700,
                color: "#fafafa", marginBottom: 6,
                letterSpacing: "-0.02em",
              }}>
                Welcome back
              </h2>
              <p style={{ fontSize: 14, color: "#52525b", fontWeight: 300 }}>
                Sign in to your workspace
              </p>
              <div style={{
                marginTop: 16,
                borderRadius: 14,
                border: "1px solid rgba(124,58,237,0.20)",
                background: "rgba(124,58,237,0.08)",
                padding: "12px 14px"
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c4b5fd" }}>
                  Demo Admin Access
                </p>
                <p style={{ marginTop: 6, fontSize: 13, color: "#ddd6fe" }}>
                  Email: <strong style={{ color: "#ffffff" }}>Nirontech@yopmail.com</strong>
                </p>
                <p style={{ marginTop: 4, fontSize: 13, color: "#ddd6fe" }}>
                  Password: <strong style={{ color: "#ffffff" }}>admin</strong>
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.20)",
                borderRadius: 12, padding: "12px 16px", marginBottom: 20,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "#fca5a5", fontWeight: 400 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin}>

              {/* Email field */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block", marginBottom: 8,
                  fontSize: 11, fontWeight: 600,
                  letterSpacing: "0.10em", textTransform: "uppercase",
                  color: "#71717a",
                }}>
                  Email address
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="sh-input"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                  <span className="sh-icon">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Password field */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{
                    fontSize: 11, fontWeight: 600,
                    letterSpacing: "0.10em", textTransform: "uppercase",
                    color: "#71717a",
                  }}>
                    Password
                  </label>
                  <button type="button" className="sh-forgot">Forgot password?</button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    className="sh-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="sh-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <input
                  id="remember"
                  type="checkbox"
                  style={{
                    width: 16, height: 16,
                    accentColor: "#7c3aed",
                    cursor: "pointer",
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                />
                <label htmlFor="remember" style={{
                  fontSize: 13, color: "#52525b",
                  fontWeight: 300, cursor: "pointer", userSelect: "none",
                }}>
                  Keep me signed in for 30 days
                </label>
              </div>

              {/* Submit */}
              <button type="submit" className="sh-submit" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="sh-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path fill="rgba(255,255,255,0.85)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in to StaffHub
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "22px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: 12, color: "#a1a1c3", fontWeight: 300, whiteSpace: "nowrap" }}>
                or continue with
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* Google SSO */}
            <button className="sh-sso">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Continue with Google SSO
            </button>

            {/* Footer */}
            {/* ── Sign up link ── */}
            <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#ffffff", fontWeight: 300 }}>
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                style={{ color: "#ffffff", fontWeight: 500, transition: "color 0.15s", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#7c3aed")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#a78bfa")}
              >
                Create Account →
              </a>
            </p>

            <p style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: "#a1a1c3", fontWeight: 300 }}>
              © {new Date().getFullYear()} StaffHub Inc. · Privacy · Terms
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
