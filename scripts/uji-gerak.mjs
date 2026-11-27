// Uji salindia & animasi setelah hidrasi. Sementara, bukan bagian aplikasi.
import { setTimeout as sleep } from "node:timers/promises";

const url = process.argv[2];
const reduced = process.argv[3] === "reduced";

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
const evalJs = async (expression) =>
  (
    await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
  ).result?.value;

await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
if (reduced) {
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
}
await send("Page.enable");
await send("Page.navigate", { url });
await sleep(4000);

const awal = await evalJs(`(() => {
  const t = document.querySelectorAll(".inv-salindia-titik");
  const aktif = [...t].findIndex((x) => x.hasAttribute("data-aktif"));
  return {
    titik: t.length,
    aktif,
    kenburns: document.querySelectorAll(".inv-kenburns").length,
    bertahap: document.querySelectorAll(".inv-bertahap").length,
    animasiJalan: document.getAnimations().filter((a) => a.playState === "running").length,
  };
})()`);

// 5 detik: salindia harus sudah berganti sendiri (kecuali reduced-motion).
await sleep(5200);
const akhir = await evalJs(`(() => {
  const t = document.querySelectorAll(".inv-salindia-titik");
  return { aktif: [...t].findIndex((x) => x.hasAttribute("data-aktif")) };
})()`);

console.log(
  JSON.stringify(
    { reducedMotion: reduced, awal, aktifSetelah5Detik: akhir.aktif },
    null,
    2,
  ),
);
ws.close();
