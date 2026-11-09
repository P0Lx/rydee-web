// Smugi „nadświetlnej” na płótnie; siła od 0 (brak) do 1.
export function createStreaks(canvas: HTMLCanvasElement, origin: (w: number, h: number) => [number, number], colors: () => [string, string]) {
  const ctx = canvas.getContext('2d')!;
  const streaks = Array.from({ length: 150 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random(), s: 0.5 + Math.random() }));
  let power = 0, target = 0, running = false;
  const size = () => { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; };
  size();
  addEventListener('resize', size);

  function draw() {
    power += (target - power) * 0.09;
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    const [cx, cy] = origin(w, h);
    const max = Math.hypot(w, h) * 0.75;
    const [a1, a2] = colors();
    ctx.lineCap = 'round';
    for (const p of streaks) {
      p.r += 0.012 * p.s * (0.4 + power);
      if (p.r > 1) p.r = 0.05;
      const a = p.r * p.r * max, b = a + (40 + 300 * p.r) * power;
      ctx.strokeStyle = `rgba(${p.s > 1.2 ? a1 : a2},${Math.min(1, p.r * 1.6) * power})`;
      ctx.lineWidth = 0.7 + p.r * 2.4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(p.a) * a, cy + Math.sin(p.a) * a);
      ctx.lineTo(cx + Math.cos(p.a) * b, cy + Math.sin(p.a) * b);
      ctx.stroke();
    }
    if (power > 0.005 || target > 0) requestAnimationFrame(draw);
    else { running = false; ctx.clearRect(0, 0, w, h); }
  }

  return (value: number) => {
    target = value;
    if (target > 0 && !running) { running = true; requestAnimationFrame(draw); }
  };
}
