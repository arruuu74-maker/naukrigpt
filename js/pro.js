/* ============================================================
   NaukriGPT Pro Gate v1 — Free limits + Pro locks
   Har page me firebase-config.js KE BAAD lagao:
   <script src="js/pro.js"></script>
   ============================================================ */
const PRO_LIMITS = {
  scan: { free: 3,  period: 'month', name: 'Resume Scan' },
  chat: { free: 10, period: 'day',   name: 'AI Chat' }
};

const ProGate = {
  user: null,
  data: null,
  ready: false,

  monthKey() { return new Date().toISOString().slice(0, 7); },
  dayKey()   { return new Date().toISOString().slice(0, 10); },

  init() {
    if (typeof firebase === 'undefined') { console.warn('ProGate: firebase nahi mila'); return; }
    firebase.auth().onAuthStateChanged(async (u) => {
      this.user = u;
      if (u) {
        try {
          const ref = firebase.firestore().collection('users').doc(u.uid);
          const snap = await ref.get();
          if (!snap.exists) {
            this.data = { email: u.email || '', isPro: false,
              scansUsed: 0, scansMonth: this.monthKey(),
              chatsUsed: 0, chatsDate: this.dayKey(),
              createdAt: firebase.firestore.FieldValue.serverTimestamp() };
            await ref.set(this.data);
          } else {
            this.data = snap.data() || {};
            // Month/day rollover — naya period to counter reset
            const upd = {};
            if (this.data.scansMonth !== this.monthKey()) { upd.scansUsed = 0; upd.scansMonth = this.monthKey(); }
            if (this.data.chatsDate !== this.dayKey())     { upd.chatsUsed = 0; upd.chatsDate = this.dayKey(); }
            if (Object.keys(upd).length) { await ref.update(upd); Object.assign(this.data, upd); }
          }
        } catch (e) { console.warn('ProGate db:', e.message); }
      } else { this.data = null; }
      this.ready = true;
      this.paintBadges();
    });
  },

  usedCount(f) {
    if (!this.data) return 0;
    return f === 'scan' ? (this.data.scansUsed || 0) : (this.data.chatsUsed || 0);
  },

  // Gate: true = allowed, false = blocked (modal dikhega)
  async canUse(feature) {
    let t = 0;
    while (!this.ready && t < 30) { await new Promise(r => setTimeout(r, 100)); t++; }
    if (!this.user) { this.loginModal(); return false; }
    if (this.data && this.data.isPro) return true;
    const lim = PRO_LIMITS[feature];
    if (this.usedCount(feature) >= lim.free) { this.lockedModal(feature); return false; }
    return true;
  },

  // Successful use ke baad counter badhao (fire & forget)
  use(feature) {
    if (!this.user || (this.data && this.data.isPro)) { this.paintBadges(); return; }
    try {
      const field = feature === 'scan' ? 'scansUsed' : 'chatsUsed';
      firebase.firestore().collection('users').doc(this.user.uid)
        .set({ [field]: firebase.firestore.FieldValue.increment(1) }, { merge: true });
      this.data[field] = (this.data[field] || 0) + 1;
    } catch (e) {}
    this.paintBadges();
  },

  paintBadges() {
    document.querySelectorAll('[data-pro-badge]').forEach(el => {
      const f = el.getAttribute('data-pro-badge');
      const lim = PRO_LIMITS[f];
      if (!this.user) {
        el.innerHTML = '🔓 <a href="login.html" style="color:#8b5cf6;font-weight:700">Login</a> karke free limit pao';
      } else if (this.data && this.data.isPro) {
        el.innerHTML = '⭐ <b style="color:#f59e0b">PRO</b> — Unlimited ' + lim.name;
      } else {
        const left = Math.max(0, lim.free - this.usedCount(f));
        el.innerHTML = '🎫 Free ' + lim.name + ': <b>' + left + '/' + lim.free + '</b> left' +
          ' <a href="pricing.html" style="color:#8b5cf6;font-weight:700">Go Pro 🚀</a>';
      }
    });
  },

  _overlay(html) {
    this._close();
    const d = document.createElement('div');
    d.id = 'progate-modal';
    d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
    d.onclick = (e) => { if (e.target === d) this._close(); };
    d.innerHTML = '<div style="background:#141428;border:1px solid #8b5cf6;border-radius:20px;padding:28px;max-width:360px;width:100%;text-align:center;color:#fff">' + html + '</div>';
    document.body.appendChild(d);
  },
  _close() { const d = document.getElementById('progate-modal'); if (d) d.remove(); },

  loginModal() {
    this._overlay(
      '<div style="font-size:44px;margin-bottom:10px">🔐</div>' +
      '<h3 style="margin-bottom:8px">Login zaroori hai</h3>' +
      '<p style="color:#94a3b8;font-size:14px;margin-bottom:18px">Free limit paane ke liye pehle login karo — 30 second ka kaam hai!</p>' +
      '<a href="login.html" style="display:block;background:#8b5cf6;color:#fff;font-weight:700;border-radius:12px;padding:13px;text-decoration:none;margin-bottom:10px">Login / Sign Up</a>' +
      '<button onclick="ProGate._close()" style="background:transparent;border:1px solid rgba(255,255,255,.2);color:#94a3b8;border-radius:12px;padding:10px 20px;cursor:pointer">Band karo</button>'
    );
  },

  lockedModal(feature) {
    const lim = PRO_LIMITS[feature];
    const per = lim.period === 'month' ? 'mahine' : 'din';
    this._overlay(
      '<div style="font-size:44px;margin-bottom:10px">🔒</div>' +
      '<h3 style="margin-bottom:8px">Free limit khatam!</h3>' +
      '<p style="color:#94a3b8;font-size:14px;margin-bottom:6px">Is ' + per + ' ke <b style="color:#fff">' + lim.free + ' free</b> ' + lim.name + ' use ho gaye.</p>' +
      '<p style="color:#94a3b8;font-size:14px;margin-bottom:18px">⭐ <b style="color:#f59e0b">Pro</b> lo — <b style="color:#fff">UNLIMITED</b> sab kuch, sirf ₹199/month!</p>' +
      '<a href="pricing.html" style="display:block;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;font-weight:700;border-radius:12px;padding:13px;text-decoration:none;margin-bottom:10px">Go Pro 🚀 — ₹199/month</a>' +
      '<button onclick="ProGate._close()" style="background:transparent;border:1px solid rgba(255,255,255,.2);color:#94a3b8;border-radius:12px;padding:10px 20px;cursor:pointer">Baad me</button>'
    );
  }
};

ProGate.init();
