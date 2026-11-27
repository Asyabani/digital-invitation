// Cari elemen yang min-content-nya memaksa halaman melebar.
// Sementara, untuk inspeksi desain. Bukan bagian aplikasi.
import { setTimeout as sleep } from "node:timers/promises";

const [url, widthArg] = process.argv.slice(2);
const width = Number(widthArg ?? 390);

const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const page = list.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result);
    pending.delete(m.id);
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
  mobile: true,
});
await send("Page.enable");
if (process.env.SHOT_COOKIE) {
  const [name, value] = process.env.SHOT_COOKIE.split("=");
  await send("Network.enable");
  await send("Network.setCookie", { name, value, domain: "localhost", path: "/" });
}
await send("Page.navigate", { url });
await sleep(2500);
if (process.env.SEL) {
  await send("Runtime.evaluate", { expression: `window.__SEL = ${JSON.stringify(process.env.SEL)}` });
}
await sleep(3500);

const { result } = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    // Ukur min-content tiap panel: itu yang menentukan lebar kolom grid.
    const panel = [...document.querySelectorAll(window.__SEL || "section.kain, fieldset, form, table")].map((el) => {
      const sebelum = el.style.width;
      el.style.width = "min-content";
      const w = Math.round(el.getBoundingClientRect().width);
      el.style.width = sebelum;
      return { w, tag: el.tagName.toLowerCase(), text: (el.textContent||"").trim().slice(0,45) };
    }).filter((x) => x.w > document.documentElement.clientWidth - 60)
      .sort((a,b) => b.w - a.w);
    if (panel.length) return { minContent: panel.slice(0, 6) };
    const vw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width <= vw + 1) continue;
      // Hanya laporkan elemen yang TIDAK punya anak selebar dirinya,
      // yaitu sumber lebarnya sendiri.
      const anakLebar = [...el.children].some(
        (c) => c.getBoundingClientRect().width > vw + 1,
      );
      if (anakLebar) continue;
      out.push({
        tag: el.tagName.toLowerCase(),
        w: Math.round(r.width),
        text: (el.textContent || "").trim().slice(0, 60),
        cls: el.className?.toString?.().slice(0, 80) ?? "",
      });
    }
    return { vw, scrollWidth: document.documentElement.scrollWidth, out };
  })()`,
});

console.log(JSON.stringify(result.value, null, 2));
ws.close();
