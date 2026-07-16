import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 700, height: 800 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/register/success", { waitUntil: "networkidle" });
await p.waitForTimeout(3500);
await (await p.$("canvas")).screenshot({ path: "/tmp/badge3.png" });
await b.close(); console.log("done");
