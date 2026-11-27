// Uji gerbang "Buka Undangan": menekan tombolnya harus membuka isi DAN
// memulai audio. Sementara, untuk verifikasi. Bukan bagian aplikasi.
import { setTimeout as sleep } from "node:timers/promises";

const url = process.argv[2];
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
const evalJs = async (expression, userGesture = false) => {
  const { result } = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture,
  });
  return result?.value;
};

await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await send("Page.enable");
await send("Page.navigate", { url });
await sleep(3500);

const sebelum = await evalJs(`(() => {
  const btn = [...document.querySelectorAll("button")]
    .find((b) => b.textContent.trim() === "Buka Undangan");
  return {
    adaTombol: Boolean(btn),
    adaAudio: Boolean(document.querySelector("audio")),
    adaIsi: Boolean(document.querySelector("form, [class*=inv-button-outline]")),
    tinggi: document.documentElement.scrollHeight,
  };
})()`);

// Klik dengan userGesture supaya kebijakan autoplay browser berlaku apa adanya.
await evalJs(
  `[...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Buka Undangan")?.click()`,
  true,
);
await sleep(2500);

const sesudah = await evalJs(`(() => {
  const a = document.querySelector("audio");
  return {
    masihAdaTombol: [...document.querySelectorAll("button")]
      .some((b) => b.textContent.trim() === "Buka Undangan"),
    adaIsi: Boolean(document.querySelector("form, [class*=inv-button-outline]")),
    tinggi: document.documentElement.scrollHeight,
    audioSrc: a ? a.currentSrc.slice(0, 60) : null,
    audioJalan: a ? !a.paused : null,
    audioWaktu: a ? Number(a.currentTime.toFixed(2)) : null,
    fokus: document.activeElement?.tagName?.toLowerCase() ?? null,
  };
})()`);

console.log(JSON.stringify({ sebelum, sesudah }, null, 2));
ws.close();
