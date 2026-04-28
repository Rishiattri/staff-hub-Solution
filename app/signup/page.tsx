"use client";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signupRequest } from "../../src/store/auth/authSlice";
import { RootState } from "../../src/store/rootReducer";

export default function SignupPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    if (password.length < 8) { setValidationError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setValidationError("Passwords do not match."); return; }
    if (!agreed) { setValidationError("Please accept the Terms of Service to continue."); return; }
        dispatch(signupRequest({ fullName, email, password, confirmPassword }));
  };

  const getStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = getStrength(password);
  const strengthColors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const displayError = validationError || error;

  const eyeOpen = <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>;
  const eyeClosed = <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

  const css = `
    @keyframes sh-spin{to{transform:rotate(360deg)}}
    .sh-spin{animation:sh-spin .75s linear infinite}
    .sh-dot-grid{background-image:radial-gradient(circle,rgba(167,139,250,.18) 1px,transparent 1px);background-size:28px 28px}
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{height:100%;font-family:'Segoe UI',system-ui,-apple-system,sans-serif}
    input,button{font-family:inherit}
    input::placeholder{color:#3f3f46}
    .sh-input{width:100%;background:#0d0d10;border:1.5px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 44px 12px 14px;font-size:14px;color:#e4e4e7;outline:none;transition:border-color .2s,box-shadow .2s}
    .sh-input:focus{border-color:#7c3aed;box-shadow:0 0 0 4px rgba(124,58,237,.12)}
    .sh-input:hover:not(:focus){border-color:rgba(255,255,255,.16)}
    .sh-btn{width:100%;padding:14px;border:none;border-radius:12px;color:#fff;font-size:15px;font-weight:600;letter-spacing:.02em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s;background:linear-gradient(135deg,#7c3aed,#9333ea);box-shadow:0 4px 20px rgba(124,58,237,.35)}
    .sh-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px rgba(124,58,237,.45)}
    .sh-btn:disabled{opacity:.5;cursor:not-allowed}
    .sh-sso{width:100%;padding:13px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.09);border-radius:12px;color:#71717a;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s}
    .sh-sso:hover{border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#a1a1aa}
    .sh-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;padding:0;color:#3f3f46;cursor:pointer;display:flex;align-items:center;transition:color .15s}
    .sh-eye:hover{color:#a78bfa}
    .sh-lbl{display:block;margin-bottom:7px;font-size:11px;font-weight:600;letter-spacing:.10em;text-transform:uppercase;color:#71717a}
    .sh-link{color:#a78bfa;font-weight:500;text-decoration:none;transition:color .15s}
    .sh-link:hover{color:#c4b5fd}
    @media (max-width: 1024px){
      html,body{overflow:auto}
      .sh-auth-shell{position:static !important;min-height:100vh !important;flex-direction:column !important;overflow:auto !important}
      .sh-auth-left{flex:none !important;width:100% !important;padding:32px 24px !important;gap:28px !important}
      .sh-auth-right{flex:none !important;width:100% !important;border-left:none !important;border-top:1px solid rgba(255,255,255,.06) !important}
      .sh-auth-card{max-width:100% !important;padding:32px 24px 40px !important}
    }
    @media (max-width: 640px){
      .sh-auth-left{padding:28px 20px !important}
      .sh-auth-card{padding:24px 20px 32px !important}
      .sh-signup-grid{grid-template-columns:1fr !important}
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="sh-auth-shell" style={{ position:"fixed", inset:0, display:"flex", background:"#09090b", color:"#fff", overflow:"hidden", fontFamily:"'Segoe UI',system-ui,-apple-system,sans-serif" }}>

        {/* LEFT */}
        <div className="sh-auth-left" style={{ flex:"0 0 42%", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"40px 48px", position:"relative", overflow:"hidden", background:"linear-gradient(145deg,#0a0a10 0%,#0e0818 60%,#120a1e 100%)" }}>
          <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 60% 55% at 10% 90%,rgba(124,58,237,.25) 0%,transparent 60%),radial-gradient(ellipse 40% 35% at 90% 5%,rgba(192,60,210,.12) 0%,transparent 55%)" }} />
          <div className="sh-dot-grid" style={{ position:"absolute", inset:0, opacity:.4, pointerEvents:"none" }} />

          {/* Brand */}
          <div style={{ display:"flex", alignItems:"center", gap:12, position:"relative", zIndex:1 }}>
            <div style={{ width:40, height:40, borderRadius:11, flexShrink:0, background:"linear-gradient(135deg,#7c3aed,#c026d3)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(124,58,237,.45)" }}>
              <svg width="20" height="20" viewBox="0 0 18 18" fill="#fff"><path d="M3 3h5v5H3V3zm7 0h5v5h-5V3zm-7 7h5v5H3v-5zm7 2h2v2h-2v-2zm3-2h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 0h2v2h-2v-2z"/></svg>
            </div>
            <span style={{ fontSize:16, fontWeight:700 }}>Staff<span style={{ color:"#a78bfa" }}>Hub</span></span>
          </div>

          {/* Hero */}
          <div style={{ position:"relative", zIndex:1 }}>
            <p style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, fontSize:10, fontWeight:700, letterSpacing:".18em", textTransform:"uppercase", color:"#7c3aed" }}>
              <span style={{ display:"block", width:20, height:1, background:"#7c3aed" }} />Get started free
            </p>
            <h1 style={{ fontSize:"clamp(32px,3.8vw,62px)", fontWeight:1000, lineHeight:1.12, color:"#fafafa", marginBottom:14, letterSpacing:"-.025em", textShadow:"0 0 50px rgba(167,139,250,.25)" }}>
              Start managing<br/>your team<br/><span style={{ color:"#a78bfa", fontStyle:"italic" }}>today. Free.</span>
            </h1>
            <p style={{ fontSize:13, fontWeight:300, color:"#52525b", lineHeight:1.8, maxWidth:280, marginBottom:26 }}>
              No credit card required. Set up in under 2 minutes.
            </p>
          
          </div>

          {/* Stats */}
          <div style={{ display:"flex", gap:22, position:"relative", zIndex:1 }}>
            {[{ v:"Free", l:"14-day trial" }, { v:"12k+", l:"Teams onboarded" }, { v:"4.9 ★", l:"App rating" }].map((s) => (
              <div key={s.l} style={{ borderLeft:"1px solid rgba(255,255,255,.10)", paddingLeft:14 }}>
                <p style={{ fontSize:17, fontWeight:700, color:"#fafafa", letterSpacing:"-.02em" }}>{s.v}</p>
                <p style={{ fontSize:11, color:"#3f3f46", marginTop:3, fontWeight:300 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="sh-auth-right" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:"#0f0f12", borderLeft:"1px solid rgba(255,255,255,.06)", position:"relative", }}>
          <div style={{ position:"absolute", bottom:-96, right:-96, width:320, height:320, borderRadius:"50%", background:"rgba(124,58,237,.07)", filter:"blur(80px)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#7c3aed,transparent)" }} />

          <div className="sh-auth-card" style={{ width:"100%", maxWidth:480, padding:"36px 48px", position:"relative", zIndex:1 }}>

            <div style={{ marginBottom:22 }}>
              <h2 style={{ fontSize:25, fontWeight:700, color:"#fafafa", letterSpacing:"-.02em", marginBottom:5 }}>Create your account</h2>
              <p style={{ fontSize:13, color:"#52525b", fontWeight:300 }}>Already have an account? <a href="/login" className="sh-link">Sign in →</a></p>
            </div>

            {displayError && (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.20)", borderRadius:12, padding:"11px 16px" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#f87171", flexShrink:0, display:"block" }} />
                <p style={{ fontSize:13, color:"#fca5a5" }}>{displayError}</p>
              </div>
            )}

            <form onSubmit={handleSignup} style={{ display:"flex", flexDirection:"column", gap:15 }}>

              {/* Name + Email */}
              <div className="sh-signup-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label className="sh-lbl">Full name</label>
                  <input className="sh-input" style={{ padding:"12px 14px" }} type="text" placeholder="Jane Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
                </div>
                <div>
                  <label className="sh-lbl">Work email</label>
                  <div style={{ position:"relative" }}>
                    <input className="sh-input" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#3f3f46", pointerEvents:"none", display:"flex" }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="sh-lbl">Password</label>
                <div style={{ position:"relative" }}>
                  <input className="sh-input" type={showPassword?"text":"password"} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
                  <button type="button" className="sh-eye" onClick={() => setShowPassword(!showPassword)}>{showPassword ? eyeOpen : eyeClosed}</button>
                </div>
                {password.length > 0 && (
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                      {[1,2,3,4].map((i) => (
                        <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i<=strength ? strengthColors[strength] : "rgba(255,255,255,.08)", transition:"background .3s" }} />
                      ))}
                    </div>
                    <p style={{ fontSize:11, fontWeight:500, color:strengthColors[strength] }}>{strengthLabels[strength]} password</p>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div>
                <label className="sh-lbl">Confirm password</label>
                <div style={{ position:"relative" }}>
                  <input className="sh-input" style={{ paddingRight:70 }} type={showConfirm?"text":"password"} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
                  <button type="button" className="sh-eye" style={{ right:36 }} onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? eyeOpen : eyeClosed}</button>
                  {confirmPassword.length > 0 && (
                    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", display:"flex" }}>
                      {password === confirmPassword
                        ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                        : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      }
                    </span>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                <input id="terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width:16, height:16, marginTop:2, accentColor:"#7c3aed", cursor:"pointer", flexShrink:0 }} />
                <label htmlFor="terms" style={{ fontSize:13, color:"#52525b", fontWeight:300, cursor:"pointer", userSelect:"none", lineHeight:1.5 }}>
                  I agree to the <a href="/terms" className="sh-link">Terms of Service</a> and <a href="/privacy" className="sh-link">Privacy Policy</a>
                </label>
              </div>

              {/* Submit */}
              <button type="submit" className="sh-btn" disabled={loading}>
                {loading
                  ? <><svg className="sh-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path fill="rgba(255,255,255,0.85)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account…</>
                  : <>Create free account <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg></>
                }
              </button>
            </form>

            <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px 0" }}>
              <div style={{ flex:1, height:1, background:"rgba(255,255,255,.06)" }} />
              <span style={{ fontSize:12, color:"#3f3f46", fontWeight:300 }}>or sign up with</span>
              <div style={{ flex:1, height:1, background:"rgba(255,255,255,.06)" }} />
            </div>

            <button className="sh-sso">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
              Continue with Google
            </button>

            <p style={{ marginTop:18, textAlign:"center", fontSize:13, color:"#52525b", fontWeight:300 }}>
              Already have an account? <a href="/login" className="sh-link">Sign in →</a>
            </p>
            <p style={{ marginTop:10, textAlign:"center", fontSize:11, color:"#27272a", fontWeight:300 }}>
              © {new Date().getFullYear()} StaffHub Inc. · Privacy · Terms
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
