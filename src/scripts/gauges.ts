// Blok prędkości z aplikacji na płótnie: układ, wymiary i kolory jak
// w `rydee-app/lib/speed_gauge.dart`, skala do 50 km/h w 5 strefach.
export type GaugeId = 'segments' | 'dial' | 'arc' | 'ring' | 'scale' | 'history';

export interface GaugeSkin { dark: boolean; number: string; label: string; divider: string; ink: string; weight: number; }
export interface GaugeState { gauge: GaugeId; kmh: number; text: string; unit: string; bars: number[]; skin: GaugeSkin; }

const ZONES = ['#378ADD', '#1D9E75', '#639922', '#EF9F27', '#E24B4A'];
const MAX = 50;
const COUNT = ZONES.length;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const fractionOf = (kmh: number) => clamp(kmh / MAX, 0, 1);
const zoneOf = (f: number) => clamp(Math.floor(f * COUNT), 0, COUNT - 1);
const font = (weight: number, size: number) => `${weight} ${size}px "Geist Variable", system-ui, sans-serif`;

function blend(f: number) {
  const pos = f * COUNT;
  const z = zoneOf(f);
  if (z === COUNT - 1) return ZONES[z];
  const t = clamp((pos - z - 0.9) / 0.1, 0, 1);
  const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = rgb(ZONES[z]), b = rgb(ZONES[z + 1]);
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
}

export function drawBlock(c: CanvasRenderingContext2D, w: number, h: number, s: GaugeState) {
  const { skin } = s;
  const f = fractionOf(s.kmh);
  const k = Math.max(0.4, w / 340);
  const inkMedium = skin.dark ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.7)';
  const inkFaint = skin.dark ? 'rgba(255,255,255,.38)' : 'rgba(0,0,0,.38)';
  const dim = skin.dark ? 0.22 : 0.25;
  c.clearRect(0, 0, w, h);
  c.lineCap = 'butt';
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';

  // liczba wpasowana w pole, jak FittedBox w aplikacji
  const fit = (weight: number, maxW: number, maxH: number, extra = 0) => {
    c.font = font(weight, 100);
    const textW = c.measureText(s.text).width;
    return Math.min(maxH / 0.74, maxW / ((textW + extra) / 100));
  };

  // liczba nad wskaźnikiem na całą szerokość
  const stacked = (gh: number, top?: number) => {
    const bottom = 12 * k;
    const space = 8 * k + gh + bottom;
    const from = top ?? space;
    const area = Math.max(10, h - from - space);
    c.font = font(400, 22);
    const unit100 = c.measureText(s.unit).width + 5;
    const size = fit(skin.weight, w * 0.92, area, unit100 * 2);
    c.font = font(skin.weight, size);
    c.fillStyle = skin.number;
    const tw = c.measureText(s.text).width;
    const x = (w - tw) / 2, y = from + area / 2 + size * 0.36;
    c.fillText(s.text, x, y);
    c.font = font(400, size * 0.22);
    c.fillStyle = skin.label;
    c.fillText(s.unit, x + tw + size * 0.05, y);
    return { x: w * 0.05, y: h - bottom - gh, w: w * 0.9 };
  };

  const line = (x1: number, y1: number, x2: number, y2: number, color: string, width: number) => {
    c.strokeStyle = color; c.lineWidth = width;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  };

  if (s.gauge === 'segments') {
    const gh = Math.max(3, 6 * k);
    const box = stacked(gh);
    const n = COUNT * 2, gap = 4 * k;
    const sw = (box.w - gap * (n - 1)) / n;
    const lit = clamp(Math.round(f * n), 0, n);
    for (let i = 0; i < n; i++) {
      c.fillStyle = i < lit ? ZONES[i >> 1] : skin.divider;
      c.beginPath(); c.roundRect(box.x + i * (sw + gap), box.y, sw, gh, 2 * k); c.fill();
    }
  } else if (s.gauge === 'scale') {
    const bar = Math.max(5, 10 * k), gapT = 3 * k, major = 6 * k;
    const box = stacked(bar + gapT + major);
    const zw = box.w / COUNT, fill = f * box.w;
    c.save();
    c.beginPath(); c.roundRect(box.x, box.y, box.w, bar, 2 * k); c.clip();
    for (let z = 0; z < COUNT; z++) {
      const left = z * zw;
      c.fillStyle = ZONES[z];
      c.globalAlpha = dim; c.fillRect(box.x + left, box.y, zw, bar);
      c.globalAlpha = 1;
      if (fill > left) c.fillRect(box.x + left, box.y, Math.min(zw, fill - left), bar);
    }
    c.restore();
    const ticks = COUNT * 2, top = box.y + bar + gapT;
    for (let i = 0; i <= ticks; i++) {
      const x = box.x + clamp((i / ticks) * box.w, 0.75, box.w - 0.75);
      const m = i % 2 === 0;
      line(x, top, x, top + (m ? major : major / 2), m ? inkMedium : inkFaint, m ? 1.5 : 1);
    }
  } else if (s.gauge === 'history') {
    const gh = h * 0.22;
    const box = stacked(gh, 12 * k);
    const slots = s.bars.length, slot = box.w / slots, bw = slot * 0.8;
    let low = Math.min(...s.bars), high = Math.max(...s.bars);
    if (high - low < 10) { const mid = (low + high) / 2; low = mid - 5; high = mid + 5; }
    s.bars.forEach((v, i) => {
      const part = 0.1 + 0.9 * clamp((v - low) / (high - low), 0, 1);
      c.fillStyle = ZONES[zoneOf(fractionOf(v))];
      c.fillRect(box.x + i * slot + (slot - bw) / 2, box.y + gh * (1 - part), bw, gh * part);
    });
  } else if (s.gauge === 'arc' || s.gauge === 'ring') {
    const radius = Math.min(w * 0.33, (h - 16 * k) / 1.8);
    const cx = w / 2, cy = (h - 1.707 * radius) / 2 + radius;
    const start = Math.PI * 0.75, sweep = Math.PI * 1.5;
    if (s.gauge === 'arc') {
      const stroke = radius * 0.16;
      const zs = sweep / COUNT, gap = 1.5 / radius, fill = f * sweep;
      c.lineWidth = stroke;
      for (let z = 0; z < COUNT; z++) {
        const from = z * zs + (z > 0 ? gap / 2 : 0);
        const to = (z + 1) * zs - (z < COUNT - 1 ? gap / 2 : 0);
        c.strokeStyle = ZONES[z];
        c.globalAlpha = dim;
        c.beginPath(); c.arc(cx, cy, radius - stroke / 2, start + from, start + to); c.stroke();
        c.globalAlpha = 1;
        if (fill > from) { c.beginPath(); c.arc(cx, cy, radius - stroke / 2, start + from, start + Math.min(to, fill)); c.stroke(); }
      }
    } else {
      const stroke = radius * 0.13;
      c.lineWidth = stroke;
      c.lineCap = 'round';
      c.strokeStyle = skin.dark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.1)';
      c.beginPath(); c.arc(cx, cy, radius - stroke / 2, start, start + sweep); c.stroke();
      if (f >= 0.01) {
        c.strokeStyle = blend(f);
        c.beginPath(); c.arc(cx, cy, radius - stroke / 2, start, start + f * sweep); c.stroke();
      }
      c.lineCap = 'butt';
    }
    const weight = s.gauge === 'ring' ? 300 : skin.weight;
    const unitLine = radius * 0.17;
    const size = fit(weight, radius * 1.24, radius - unitLine);
    c.font = font(weight, size);
    c.fillStyle = skin.number;
    c.textAlign = 'center';
    const top = cy - radius * 0.45;
    c.fillText(s.text, cx, top + (radius - unitLine) / 2 + size * 0.36);
    c.font = font(400, radius * 0.14);
    c.fillStyle = skin.label;
    c.fillText(s.unit, cx, top + radius - radius * 0.02);
  } else {
    const radius = Math.min(w * 0.41, h * 0.72);
    const cx = w / 2, cy = (h + radius) / 2;
    const r = radius / 86;
    const at = (d: number, a: number): [number, number] => [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
    const angle = (v: number) => Math.PI + v * Math.PI;
    const zs = Math.PI / COUNT, gap = (0.8 * r) / radius;
    c.lineWidth = 3 * r;
    for (let z = 0; z < COUNT; z++) {
      c.strokeStyle = ZONES[z];
      c.beginPath(); c.arc(cx, cy, radius, Math.PI + z * zs + (z > 0 ? gap : 0), Math.PI + (z + 1) * zs); c.stroke();
    }
    const ticks = COUNT * 2;
    for (let i = 0; i <= ticks; i++) {
      const a = angle(i / ticks), m = i % 2 === 0;
      line(...at(82 * r, a), ...at((m ? 72 : 76) * r, a), m ? inkMedium : inkFaint, (m ? 2 : 1) * r);
      if (m && radius > 50) {
        const [x, y] = at(62 * r, a);
        c.font = font(400, 12 * r);
        c.fillStyle = inkFaint;
        c.textAlign = 'center';
        c.fillText(String((i >> 1) * 10), x, i === 0 || i === ticks ? y - 2 * r : y + 4 * r);
      }
    }
    const a = angle(f);
    const dx = -Math.sin(a) * 5 * r, dy = Math.cos(a) * 5 * r;
    const [bx, by] = at(66 * r, a), [tx, ty] = at(80 * r, a);
    c.fillStyle = skin.ink;
    c.beginPath(); c.moveTo(tx, ty); c.lineTo(bx + dx, by + dy); c.lineTo(bx - dx, by - dy); c.closePath(); c.fill();
    const nr = Math.min(w * 0.41, h * 0.78);
    const unit = nr * 0.11;
    const top = h * 0.91 - nr * 0.55, area = h - 2 - top - unit * 1.1;
    const size = fit(skin.weight, nr, area);
    c.font = font(skin.weight, size);
    c.fillStyle = skin.number;
    c.textAlign = 'center';
    c.fillText(s.text, cx, top + area / 2 + size * 0.36);
    c.font = font(400, unit);
    c.fillStyle = skin.label;
    c.fillText(s.unit, cx, h - 3);
  }
}
