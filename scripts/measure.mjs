// Alat ukur sementara: cari elemen yang melebarkan halaman di lebar tertentu.
// Dipakai saat inspeksi desain, bukan bagian aplikasi.
import { setTimeout as sleep } from "node:timers/promises";

const [url, widthArg] = process.argv.slice(2);
const width = Number(widthArg ?? 390);

const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const page = list.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();

ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
});
await new Promise((r) => ws.addEventListener("open", r));

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const n = ++id;
    pending.set(n, resolve);
    ws.send(JSON.stringify({ id: n, method, params }));
  });

await send("Emulation.setDeviceMetricsOverride", {
  width,
  height: 900,
  deviceScaleFactor: 1,
  mobile: width < 700,
});
await send("Page.enable");
await send("Page.navigate", { url });
await sleep(3500);

const { result } = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.right > vw + 1 || r.left < -1) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute("class") || "").slice(0, 110),
          left: Math.round(r.left),
          right: Math.round(r.right),
          w: Math.round(r.width),
          depth: (() => { let d = 0, p = el; while ((p = p.parentElement)) d++; return d; })(),
        });
      }
    }
    return {
      viewport: vw,
      scrollWidth: document.documentElement.scrollWidth,
      bodyWidth: Math.round(document.body.getBoundingClientRect().width),
      offenders: out.sort((a, b) => b.right - a.right || a.depth - b.depth).slice(0, 14),
    };
  })()`,
});

console.log(JSON.stringify(result.value, null, 2));
ws.close();
