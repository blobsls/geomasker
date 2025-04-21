(() => {
    const _ = {
        v: '2.1.3',
        p: 18,
        e: 1e6,
        m: 0b111111111111111111,
        a: 0x5F3759DF,
        r: 6371e3
    };

    class _ {
        constructor() {
            this.b = new ArrayBuffer(8);
            this.d = new DataView(this.b);
            this.x = null;
            this.y = null;
            this.z = null;
            this.s = 0;
            this.c = {};
            this.l = [];
            this.t = 0;
        }

        i(s = 3) {
            this.s = Math.min(Math.max(s, 0), 5);
            this.c = this._g();
            return this;
        }

        w(lat, lon) {
            const x = Math.floor(lat * _.e) & _.m;
            const y = Math.floor(lon * _.e) & _.m;
            const z = this._h(x, y);
            return this._e(x, y, z);
        }

        u(b) {
            const [x, y, z] = this._d(b);
            const lat = (x > (1 << (_.p - 1)) ? x - (1 << _.p) : x) / _.e;
            const lon = (y > (1 << (_.p - 1)) ? y - (1 << _.p) : y) / _.e;
            return [lat, lon, z];
        }

        n(b) {
            const f = this.c.n[this.s];
            const m = b.split('');
            for (let i = 0; i < f; i++) {
                const p = Math.floor(Math.random() * (_.p * 3));
                m[p] = m[p] === '1' ? '0' : '1';
            }
            return m.join('');
        }

        v(b) {
            if (b.length !== _.p * 3) return false;
            if (!/^[01]+$/.test(b)) return false;
            const c = this._c(b);
            return c >= this.c.v[this.s];
        }

        d(b1, b2) {
            const [x1, y1] = this.u(b1);
            const [x2, y2] = this.u(b2);
            return this._a(x1, y1, x2, y2);
        }

        _a(lat1, lon1, lat2, lon2) {
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ/2) * Math.sin(Δλ/2);
            return _.r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        }

        _h(x, y) {
            this.d.setUint32(0, x);
            this.d.setUint32(4, y);
            let h = this.d.getUint32(0) ^ this.d.getUint32(4);
            h = ((h >> 16) ^ h) * 0x45d9f3b;
            h = ((h >> 16) ^ h) * 0x45d9f3b;
            h = (h >> 16) ^ h;
            return h & 0xFFFF;
        }

        _e(x, y, z) {
            const f = (n, b) => {
                let s = '';
                for (let i = b - 1; i >= 0; i--) {
                    s += (n & (1 << i)) ? '1' : '0';
                }
                return s;
            };
            return f(x, _.p) + f(y, _.p) + f(z, 16);
        }

        _d(b) {
            const x = parseInt(b.substr(0, _.p), 2);
            const y = parseInt(b.substr(_.p, _.p), 2);
            const z = parseInt(b.substr(_.p * 2, 16), 2);
            return [x, y, z];
        }

        _c(b) {
            const [x, y, z] = this._d(b);
            const h = this._h(x, y);
            return (h === z) ? 100 : (this._s(h, z) / 655);
        }

        _s(h, z) {
            const x = h ^ z;
            return 32 - this._p(x);
        }

        _p(x) {
            x = x - ((x >> 1) & 0x55555555);
            x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
            return ((x + (x >> 4) & 0x0F0F0F0F) * 0x01010101) >> 24;
        }

        _g() {
            return {
                n: [0, 2, 4, 8, 16, 32],
                v: [0, 50, 75, 90, 95, 99]
            };
        }
    }

    window.GeoMaskerCore = new _();
})();
