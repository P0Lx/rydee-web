// Studio: podgląd ekranu głównego ze stylami i wskaźnikami z aplikacji, na
// wymyślonej trasie. Kolory jak w `rydee-app/lib/app_colors.dart`.
import { drawBlock, type GaugeId, type GaugeSkin } from './gauges';
import { KM, ele, grade, speed, profilePath } from './route';
import { createStreaks } from './streaks';

type Mode = 'dark' | 'light';
interface Skin { bg: string; card: string; speed: string; ink: string; label: string; tile: string; line: string; acc: string; glow: string; r: number; gap: number; weight: number; }

const base = {
  dark: { bg: '#0C0D0F', card: 'transparent', speed: 'transparent', ink: '#FFFFFF', label: '#8D9096', tile: '#8D9096', line: '#2A2C31', acc: '#FFFFFF', glow: '#ff5040', r: 0, gap: 0, weight: 500 },
  light: { bg: '#F3F4F6', card: 'transparent', speed: 'transparent', ink: '#111214', label: '#63666D', tile: '#63666D', line: '#D3D5DA', acc: '#111214', glow: '#ff5040', r: 0, gap: 0, weight: 500 },
};
const skins: Record<string, Record<Mode, Skin>> = {
  minimal: base,
  material: {
    dark: { ...base.dark, bg: '#111318', card: '#1E2129', speed: '#1E2129', ink: '#E6E6EA', label: '#99A0AA', tile: '#99A0AA', line: '#2C303A', acc: '#8FB8FF', glow: '#8FB8FF', r: 12, gap: 4 },
    light: { ...base.light, bg: '#F7F8FC', card: '#FFFFFF', speed: '#FFFFFF', ink: '#1A1C20', label: '#5D6270', tile: '#5D6270', line: '#DDE1EA', acc: '#2F5BB8', glow: '#2F5BB8', r: 12, gap: 4 },
  },
  ios: {
    dark: { ...base.dark, bg: '#000000', card: '#1C1C1E', speed: 'transparent', ink: '#FFFFFF', label: '#8E8E93', tile: '#8E8E93', line: '#38383A', acc: '#0A84FF', glow: '#0A84FF', r: 14, gap: 8, weight: 300 },
    light: { ...base.light, bg: '#F2F2F7', card: '#FFFFFF', speed: 'transparent', ink: '#000000', label: '#6C6C70', tile: '#6C6C70', line: '#C6C6C8', acc: '#007AFF', glow: '#007AFF', r: 14, gap: 8, weight: 300 },
  },
  sport: {
    dark: { ...base.dark, bg: '#000000', card: '#1C1C1E', speed: '#1C1C1E', ink: '#FFFFFF', label: '#9A9A9E', tile: '#FFD60A', line: '#2C2C2E', acc: '#FFD60A', glow: '#FFD60A', r: 0, gap: 3 },
    light: { ...base.light, bg: '#FFFFFF', card: '#EFEFEF', speed: '#EFEFEF', ink: '#000000', label: '#666666', tile: '#9A7400', line: '#DEDEDE', acc: '#9A7400', glow: '#E0A800', r: 0, gap: 3 },
  },
};
const maps = { dark: ['#161616', '#2A2A2A'], light: ['#F8F4F0', '#E4DDD3'] };

const root = document.querySelector<HTMLElement>('.studio');
if (root) {
  const q = <T extends Element>(s: string) => root.querySelector<T>(s)!;
  const decimal = document.documentElement.lang === 'pl' ? ',' : '.';
  const device = q<HTMLElement>('.sd');
  const main = q<HTMLCanvasElement>('[data-main]');
  const thumbs = [...root.querySelectorAll<HTMLCanvasElement>('[data-thumb]')];
  const ghost = q<HTMLElement>('.st-ghost');
  const status = q<HTMLElement>('[data-status]');
  const statusFree = status.dataset.free!, statusPremium = status.dataset.premium!;
  const statusOut = q<HTMLElement>('[data-status-text]');
  const statusLink = q<HTMLElement>('[data-status-link]');
  const range = q<HTMLInputElement>('.st-range');
  const play = q<HTMLButtonElement>('.st-play');
  const dot = q<HTMLElement>('.st-dot');
  const route = q<SVGPathElement>('.sd-done');
  const pin = q<SVGCircleElement>('.sd-pin');
  const readKm = q<HTMLElement>('[data-read="km"]');
  const readEle = q<HTMLElement>('[data-read="ele"]');
  const readGrade = q<HTMLElement>('[data-read="grade"]');
  const motion = matchMedia('(prefers-reduced-motion: no-preference)').matches;

  const W = 1000, H = 90;
  const { d, y } = profilePath(W, H);
  root.querySelectorAll('.st-line').forEach((l) => l.setAttribute('d', d));
  q('.st-fill').setAttribute('d', `${d}L${W} ${H}L0 ${H}Z`);
  const clip = q<SVGRectElement>('.st-clip');
  const length = route.getTotalLength();

  const state = { style: 'minimal', mode: 'dark' as Mode, gauge: 'segments' as GaugeId };
  let x = 0.34, shown = speed(x), playing = false, visible = false, lastThumb = 0;

  const paint = (el: HTMLElement, s: Skin) => {
    const set = (k: string, v: string) => el.style.setProperty(k, v);
    set('--d-bg', s.bg); set('--d-card', s.card); set('--d-speed', s.speed); set('--d-ink', s.ink); set('--d-label', s.label);
    set('--d-tile', s.tile); set('--d-line', s.line); set('--d-acc', s.acc); set('--d-r', String(s.r)); set('--d-gap', String(s.gap));
  };

  const gaugeSkin = (s: Skin, mode: Mode): GaugeSkin => ({ dark: mode === 'dark', number: s.ink, label: s.label, divider: s.line, ink: s.ink, weight: s.weight });

  function fitCanvas(c: HTMLCanvasElement) {
    const ratio = Math.min(2, devicePixelRatio || 1);
    const w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * ratio) || c.height !== Math.round(h * ratio)) { c.width = Math.round(w * ratio); c.height = Math.round(h * ratio); }
    const ctx = c.getContext('2d')!;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx, w, h };
  }

  function draw(now = 0, force = false) {
    const skin = skins[state.style][state.mode];
    const text = String(Math.round(shown));
    const bars = Array.from({ length: 30 }, (_, i) => speed(Math.max(0.005, x - (29 - i) * 0.004)));
    const common = { kmh: shown, text, unit: 'km/h', bars, skin: gaugeSkin(skin, state.mode) };
    const m = fitCanvas(main);
    if (m.w && m.h) drawBlock(m.ctx, m.w, m.h, { ...common, gauge: state.gauge });
    if (force || now - lastThumb > 90) {
      lastThumb = now;
      for (const c of thumbs) {
        const t = fitCanvas(c);
        if (t.w && t.h) drawBlock(t.ctx, t.w, t.h, { ...common, gauge: c.dataset.thumb as GaugeId });
      }
    }
    if (ghost.textContent !== text) ghost.textContent = text;
  }

  function update(now = 0, force = false) {
    const gr = grade(x), km = x * KM, mins = Math.round((km / 24.5) * 60);
    const set = (k: string, v: string) => { const n = device.querySelector(`[data-v="${k}"]`); if (n && n.textContent !== v) n.textContent = v; };
    set('time', `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`);
    set('dist', km.toFixed(1).replace('.', decimal));
    set('hr', String(Math.round(118 + Math.max(0, gr) * 6.5)));
    set('cad', String(Math.round(gr < -3 ? 0 : 84 - Math.max(0, gr) * 2)));
    readKm.textContent = km.toFixed(1).replace('.', decimal);
    readEle.textContent = String(Math.round(ele(x)));
    readGrade.textContent = `${gr > 0.4 ? '+' : ''}${Math.round(gr)}%`;
    clip.setAttribute('width', String(x * W));
    dot.style.left = `${x * 100}%`;
    dot.style.top = `${(y(ele(x)) / H) * 100}%`;
    route.style.strokeDasharray = `${x * 100} 100`;
    const p = route.getPointAtLength(x * length);
    pin.setAttribute('cx', p.x.toFixed(1));
    pin.setAttribute('cy', p.y.toFixed(1));
    const hot = motion && shown >= 50 ? Math.min(1, (shown - 48) / 6) : 0;
    root!.classList.toggle('hot', shown >= 50);
    root!.style.setProperty('--hot', hot.toFixed(3));
    streaks(hot);
    draw(now, force);
  }

  const streaks = createStreaks(q<HTMLCanvasElement>('.st-fx'), (w, h) => [w * 0.5, h * 0.42], () => {
    const hex = skins[state.style][state.mode].glow.slice(1);
    const rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');
    return [rgb, state.mode === 'dark' ? '255,255,255' : '40,40,40'];
  });

  function applyLook() {
    const skin = skins[state.style][state.mode];
    root!.dataset.mode = state.mode;
    device.dataset.look = state.style;
    paint(root!, skin);
    root!.style.setProperty('--st-glow', skin.glow);
    const [land, road] = maps[state.mode];
    device.style.setProperty('--d-map', land);
    device.style.setProperty('--d-road', road);
    root!.querySelectorAll<HTMLElement>('.st-mini').forEach((m) => paint(m, skins[m.dataset.look!][state.mode]));
    const free = state.style === 'minimal' && (state.gauge === 'segments' || state.gauge === 'arc');
    status.classList.toggle('needs', !free);
    statusOut.textContent = free ? statusFree : statusPremium;
    statusLink.hidden = free;
    update(performance.now(), true);
  }

  // przejście trybu: nowy wygląd rozlewa się z miejsca przełącznika
  function switchMode(mode: Mode, from: Element) {
    state.mode = mode;
    const vt = (document as any).startViewTransition as undefined | ((f: () => void) => { ready: Promise<void> });
    if (!motion || !vt) { applyLook(); return; }
    const box = root!.getBoundingClientRect(), o = from.getBoundingClientRect();
    const cx = o.left + o.width / 2 - box.left, cy = o.top + o.height / 2 - box.top;
    const radius = Math.hypot(Math.max(cx, box.width - cx), Math.max(cy, box.height - cy));
    vt.call(document, applyLook).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radius}px at ${cx}px ${cy}px)`] },
        { duration: 650, easing: 'cubic-bezier(.3,.7,.2,1)', pseudoElement: '::view-transition-new(studio)' },
      );
    }).catch(() => {});
  }

  root.querySelectorAll<HTMLFieldSetElement>('fieldset[data-group]').forEach((set) => {
    set.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement;
      const key = set.dataset.group as 'style' | 'gauge' | 'mode';
      if (key === 'mode') switchMode(input.value as Mode, input.closest('label')!);
      else { (state as Record<string, string>)[key] = input.value; applyLook(); }
    });
  });

  let last = 0, looping = false;
  function loop(now: number) {
    if (!visible || !(playing || Math.abs(speed(x) - shown) > 0.05)) { looping = false; return; }
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (playing) {
      x += dt * 0.016;
      if (x > 0.985) x = 0.015;
      range.value = String(Math.round(x * 1000));
    }
    shown += (speed(x) - shown) * Math.min(1, dt * 7);
    update(now);
    requestAnimationFrame(loop);
  }
  const kick = () => { if (!looping && visible) { looping = true; last = performance.now(); requestAnimationFrame(loop); } };
  const setPlaying = (on: boolean) => {
    playing = on;
    play.setAttribute('aria-pressed', String(on));
    play.dataset.on = String(on);
    play.querySelector('[data-label]')!.textContent = on ? play.dataset.pause! : play.dataset.play!;
    if (on) kick();
  };

  play.addEventListener('click', () => setPlaying(!playing));
  range.addEventListener('input', () => {
    setPlaying(false);
    x = Number(range.value) / 1000;
    if (!motion) shown = speed(x);
    kick();
    update(performance.now());
  });

  let started = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !started) { started = true; if (motion) setPlaying(true); }
    kick();
  }, { threshold: 0.2 }).observe(root);

  new ResizeObserver(() => update(performance.now(), true)).observe(main);
  range.value = String(Math.round(x * 1000));
  applyLook();
  document.fonts?.load('500 40px "Geist Variable"').then(() => update(performance.now(), true));
}
