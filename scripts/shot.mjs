// Alat tangkap layar sementara lewat DevTools Protocol.
// Memakai device metrics override supaya lebar tata letak benar-benar sesuai
// (headless --window-size tidak melakukan itu dan menghasilkan bukti palsu).
// Dipakai saat inspeksi desain, bukan bagian aplikasi.
import { setTimeout as sleep } from "node:timers/promises";
import { writeFile } from "node:fs/promises";

const [url, widthArg, out, fullArg] = process.argv.slice(2);
const width = Number(widthArg ?? 1440);
const full = fullArg !== "viewport";

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
  mobile: width < 700,
});
await send("Page.enable");
if (process.env.SHOT_COOKIE) {
  const [name, value] = process.env.SHOT_COOKIE.split("=");
  await send("Network.enable");
  await send("Network.setCookie", {
    name,
    value,
    domain: "localhost",
    path: "/",
  });
}
await send("Page.navigate", { url });
await sleep(3800);

// Pastikan animasi masuk sudah selesai: elemen yang tersembunyi karena timing
// animasi akan terbaca sebagai elemen hilang dan jadi temuan palsu.
await send("Runtime.evaluate", {
  expression: `
    document.getAnimations().forEach(a => a.finish());
    // Gerak masuk dipicu IntersectionObserver saat bagian masuk layar.
    // Tangkapan layar penuh tidak menggulir, jadi bagian di bawah layar tidak
    // pernah terpicu dan akan terekam kosong — bukti palsu.
    document.querySelectorAll(".inv-masuk").forEach(el => el.classList.add("inv-terlihat"));
  `,
});
await sleep(300);

const shot = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: full,
  ...(full
    ? {
        clip: await (async () => {
          const { result } = await send("Runtime.evaluate", {
            returnByValue: true,
            expression: `({w: document.documentElement.clientWidth, h: Math.min(document.documentElement.scrollHeight, 6000)})`,
          });
          return {
            x: 0,
            y: 0,
            width: result.value.w,
            height: result.value.h,
            scale: 1,
          };
        })(),
      }
    : {}),
});

await writeFile(out, Buffer.from(shot.data, "base64"));
console.log(`${out} · ${width}px`);
ws.close();
