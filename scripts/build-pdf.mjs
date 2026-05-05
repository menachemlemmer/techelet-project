#!/usr/bin/env node
/**
 * Generate a single PDF of the entire shiur.
 *
 * Flow:
 *   1. Start `astro preview` on localhost:4322 (assumes `npm run build` ran first)
 *   2. Wait for the server to answer /print/all
 *   3. Launch Puppeteer, navigate to /print/all, wait for fonts + network idle
 *   4. page.pdf() → dist-pdf/shiur.pdf
 *   5. Smoke check (file exists, reasonable size)
 *   6. Always clean up: kill preview, close browser
 */
import { spawn, execSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import puppeteer from "puppeteer";

const isWindows = process.platform === "win32";

const PORT = 4322;
const URL = `http://127.0.0.1:${PORT}/print/all`;
const OUTPUT_DIR = "dist-pdf";
const OUTPUT_PATH = `${OUTPUT_DIR}/livnat_hasapir.pdf`;
const READY_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 500;
const MIN_PDF_BYTES = 100_000;

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not up yet
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(
    `preview server did not respond at ${url} within ${timeoutMs}ms`,
  );
}

let preview = null;
let browser = null;

try {
  console.log(`Starting astro preview on port ${PORT}...`);
  // Windows: shell:true so npx.cmd resolves. POSIX: detached:true so the
  // child is its own process group leader, and we can kill the whole tree
  // (npx → node → astro) via process.kill(-pid). Without this, SIGTERM on
  // the shell PID leaves astro preview running and the script hangs.
  preview = spawn(
    "npx",
    ["astro", "preview", "--port", String(PORT), "--host", "127.0.0.1"],
    {
      stdio: ["ignore", "pipe", "pipe"],
      shell: isWindows,
      detached: !isWindows,
    },
  );
  preview.stdout.on("data", (d) => process.stdout.write(`[preview] ${d}`));
  preview.stderr.on("data", (d) => process.stderr.write(`[preview] ${d}`));
  preview.on("exit", (code) => {
    if (code !== null && code !== 0) {
      console.error(`[preview] exited with code ${code}`);
    }
  });

  await waitForServer(URL, READY_TIMEOUT_MS);
  console.log("Preview server ready.");

  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log("Launching Puppeteer...");
  browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: "networkidle0", timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  // Force the specific web fonts to fully download and render before capture
  await page.evaluate(() => Promise.all([
    document.fonts.load('400 16px "EB Garamond"'),
    document.fonts.load('600 16px "EB Garamond"'),
    document.fonts.load('italic 400 16px "EB Garamond"'),
    document.fonts.load('400 16px "Noto Serif Hebrew"'),
    document.fonts.load('600 16px "Noto Serif Hebrew"'),
    document.fonts.load('700 16px "Noto Serif Hebrew"'),
  ]));
  await new Promise(r => setTimeout(r, 1500));

  console.log(`Rendering PDF to ${OUTPUT_PATH}...`);
  // Size AND margins come from @page in print.css (preferCSSPageSize owns
  // size only — margins are separate, and if we pass them here they stack
  // on top of @page's, clipping content on the right.)
  await page.pdf({
    path: OUTPUT_PATH,
    printBackground: true,
    preferCSSPageSize: true,
  });

  if (!existsSync(OUTPUT_PATH)) {
    throw new Error(`PDF not created at ${OUTPUT_PATH}`);
  }
  const size = statSync(OUTPUT_PATH).size;
  if (size < MIN_PDF_BYTES) {
    throw new Error(
      `PDF suspiciously small: ${size} bytes (expected > ${MIN_PDF_BYTES})`,
    );
  }
  console.log(
    `✓ PDF generated: ${OUTPUT_PATH} (${(size / 1024 / 1024).toFixed(2)} MB)`,
  );
} catch (err) {
  console.error("PDF generation failed:", err.message);
  process.exitCode = 1;
} finally {
  if (browser) {
    await browser.close().catch(() => {});
  }
  if (preview && !preview.killed) {
    if (isWindows) {
      // On Windows, preview is a shell that spawned node children — kill the whole tree.
      try {
        execSync(`taskkill /pid ${preview.pid} /t /f`, { stdio: "ignore" });
      } catch {}
    } else {
      // Negative PID = process group; reaches npx + its node children.
      try {
        process.kill(-preview.pid, "SIGTERM");
      } catch {
        try {
          preview.kill("SIGTERM");
        } catch {}
      }
    }
  }
}
