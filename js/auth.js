// ============================================================
// NaukriGPT — Shared Auth Engine
// Har page me ye 5 lines </body> se pehle daalo:
//
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
// <script src="/js/firebase-config.js"></script>
// <script src="/js/auth.js"></script>
//
// Nav me ye span daalo jahan Login button dikhana ho:
// <span id="authArea"></span>
// ============================================================

const ENFORCE_LIMITS = false; // Razorpay live hote hi true kar dena
const FREE_SCANS = 3;         // free users ke liye scans/month

const Auth = {
  user: null,
  userData: null,
  _readyResolve: null,
  ready: new Promise(res => { /* resolved on auth state */ }),

  init() {
    this.ready = new Promise(res => { this._readyResolve = res; });
    // auth-related CSS inject (har page me alag CSS likhne ki zaroorat nahi)
    const css = `#authArea{display:inline-flex;align-items:center;margin-left:6px}
.login-btn{background:linear-gradient(90deg,#8b5cf6,#2563eb);color:#fff!important;font-weight:700!important;font-size:13px!important;padding:8px 18px!important;border-radius:10px;text-decoration:none;white-space:nowrap}
.user-chip{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:4px 12px 4px 4px;font-size:13px;color:#e2e8f0;white-space:nowrap}
.user-chip .av{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#2563eb);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff}
.user-chip .pro{background:#f59e0b;color:#000;font-size:10px;font-weight:800;padding:2px 8px;border-radius:99px}
.user-chip button{background:transparent;border:none;color:#94a3b8;font-size:12px;cursor:pointer;padding:2px 4px}
.user-chip button:hover{color:#fff}`;
    const st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    if (!FIREBASE_READY || typeof firebase === 'undefined') {
      console.warn('[NaukriGPT] Firebase config nahi lagi — auth OFF hai. FIREBASE-SETUP.md dekho.');
      this._readyResolve(null);
      this.updateAuthArea();
      return;
    }
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    this.db = firebase.firestore();
    firebase.auth().onAuthStateChanged(async (u) => {
      this.user = u;
      this.userData = u ? await this.getUserDoc(u) : null;
      this.updateAuthArea();
      this._readyResolve(u);
    });
  },

  // ---- Firestore user doc (banega agar nahi hai) ----
  async getUserDoc(u) {
    const ref = this.db.collection('users').doc(u.uid);
    const snap = await ref.get();
    if (snap.exists) return snap.data();
    const data = {
      name: u.displayName || (u.email ? u.email.split('@')[0] : 'Student'),
      email: u.email || '',
      isPro: false,          // Razorpay ke baad true hoga
      scans: {},             // {"2026-9": 2}
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await ref.set(data);
    return data;
  },

  monthKey() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1);
  },

  scansUsed() {
    if (!this.userData) return 0;
    return (this.userData.scans && this.userData.scans[this.monthKey()]) || 0;
  },

  // ---- Scan permission check ----
  canScan() {
    if (!this.user) return { allowed: false, reason: 'login' };
    if (this.userData && this.userData.isPro) return { allowed: true, pro: true };
    if (!ENFORCE_LIMITS) return { allowed: true, pro: false, left: Infinity };
    const left = FREE_SCANS - this.scansUsed();
    return left > 0
      ? { allowed: true, pro: false, left }
      : { allowed: false, reason: 'limit' };
  },

  async recordScan() {
    if (!this.user || (this.userData && this.userData.isPro)) return;
    const key = this.monthKey();
    const ref = this.db.collection('users').doc(this.user.uid);
    const used = this.scansUsed();
    await ref.update({ ['scans.' + key]: used + 1 });
    this.userData.scans = this.userData.scans || {};
    this.userData.scans[key] = used + 1;
  },

  // ---- Auth actions ----
  async signup(name, email, pass) {
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, pass);
    await cred.user.updateProfile({ displayName: name });
    return cred.user;
  },
  async login(email, pass) {
    const cred = await firebase.auth().signInWithEmailAndPassword(email, pass);
    return cred.user;
  },
  async googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await firebase.auth().signInWithPopup(provider);
    return cred.user;
  },
  async logout() {
    await firebase.auth().signOut();
    location.reload();
  },

  // ---- Nav me Login / User chip ----
  updateAuthArea() {
    const el = document.getElementById('authArea');
    if (!el) return;
    if (!FIREBASE_READY) {
      el.innerHTML = '<a class="login-btn" href="/login.html">🔑 Login</a>';
      return;
    }
    if (!this.user) {
      const next = encodeURIComponent(location.pathname);
      el.innerHTML = '<a class="login-btn" href="/login.html?next=' + next + '">🔑 Login</a>';
      return;
    }
    const name = (this.userData && this.userData.name) || 'Student';
    const initial = name.charAt(0).toUpperCase();
    const proBadge = (this.userData && this.userData.isPro) ? '<span class="pro">⚡PRO</span>' : '';
    el.innerHTML = '<span class="user-chip"><span class="av">' + initial + '</span>' + name + proBadge
      + '<button onclick="Auth.logout()" title="Logout">Logout</button></span>';
  }
};

// auto-start
document.addEventListener('DOMContentLoaded', () => Auth.init());
