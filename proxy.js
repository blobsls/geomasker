(() => {
    // Core configuration (minified variable names)
    const k = {
        p: 'https://geomasker.api.net/JSON/v6', // API endpoint
        t: 5000, // Timeout (ms)
        r: 3, // Max retries
        v: '1.0.0' // Version
    };

    // Binary encoding/decoding utilities
    const b = {
        // Convert coordinates to binary string
        e: (x, y) => {
            const m = (n, p = 16) => {
                let d = Math.abs(n * 1e6);
                let s = n < 0 ? '1' : '0';
                return s + d.toString(2).padStart(p, '0');
            };
            return m(x) + m(y);
        },
        
        // Convert binary string to coordinates
        d: (s) => {
            const u = (b, p = 16) => {
                let n = parseInt(b.substr(1), 2) / 1e6;
                return b[0] === '1' ? -n : n;
            };
            return [
                u(s.substr(0, 17)),
                u(s.substr(17, 17))
            ];
        }
    };

    // Proxy handler class
    class G {
        constructor() {
            this.q = null; // Current proxy queue
            this.c = {}; // Configuration cache
            this.l = []; // Location pool
            this.s = {}; // Session data
            this.i = 0; // Proxy rotation index
            this.h = new Headers({
                'X-GeoMasker-Version': k.v,
                'Content-Type': 'application/json'
            });
        }

        // Initialize with API key
        async j(a) {
            try {
                this.h.set('Authorization', `Bearer ${a}`);
                const r = await this._f(`${k.p}/init`, 'POST');
                this.c = r.config;
                this.l = r.locations;
                return true;
            } catch (e) {
                console.error(`GeoMasker init failed: ${e}`);
                return false;
            }
        }

        // Get current masked location
        g() {
            if (!this.s.l) return null;
            return b.d(this.s.l);
        }

        // Set new masked location (binary string or coordinates)
        async w(l) {
            let n = Array.isArray(l) ? b.e(l[0], l[1]) : l;
            try {
                const r = await this._f(`${k.p}/mask`, 'POST', { loc: n });
                this.s = { ...this.s, ...r };
                return true;
            } catch (e) {
                console.error(`GeoMasker location update failed: ${e}`);
                return false;
            }
        }

        // Fetch through proxy with geomasking
        async f(u, o = {}) {
            if (!this.q) await this._r();
            
            const p = this.q[this.i++ % this.q.length];
            const t = { ...o, headers: this._m(o.headers) };
            
            try {
                const s = await fetch(u, {
                    ...t,
                    proxy: p,
                    signal: AbortSignal.timeout(k.t)
                });
                
                if (s.headers.get('X-GeoMasker-Refresh')) {
                    await this._r();
                }
                
                return s;
            } catch (e) {
                console.warn(`Proxy ${p.ip} failed, rotating...`);
                await this._r();
                return this.f(u, o);
            }
        }

        // Internal: refresh proxy pool
        async _r() {
            const r = await this._f(`${k.p}/proxies`);
            this.q = r.proxies;
            this.i = 0;
        }

        // Internal: merge headers
        _m(h) {
            const m = new Headers(h);
            this.h.forEach((v, k) => m.set(k, v));
            if (this.s.l) m.set('X-GeoMasker-Location', this.s.l);
            if (this.s.s) m.set('X-GeoMasker-Session', this.s.s);
            return m;
        }

        // Internal: fetch wrapper
        async _f(u, m = 'GET', d = null, a = 0) {
            try {
                const r = await fetch(u, {
                    method: m,
                    headers: this.h,
                    body: d ? JSON.stringify(d) : null,
                    signal: AbortSignal.timeout(k.t)
                });
                
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return await r.json();
            } catch (e) {
                if (a < k.r) {
                    await new Promise(y => setTimeout(y, 1000 * (a + 1)));
                    return this._f(u, m, d, a + 1);
                }
                throw e;
            }
        }
    }
  
    window.GeoMasker = new G();
})();
