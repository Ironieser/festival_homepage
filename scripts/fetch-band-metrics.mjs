import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import googleTrends from "google-trends-api";
import { chromium } from "playwright";

const ROOT = process.cwd();
const LINEUP_PATH = path.join(ROOT, "src", "data", "lineup.json");
const OUTPUT_PATH = path.join(ROOT, "src", "data", "band-metrics.json");
const SEARCH_WAIT_MS = 4000;
const GOOGLE_BASELINE_KEYWORDS = ["Wang Wen", "惘闻"];
const GOOGLE_TREND_MAX_RETRIES = 4;

const SPOTIFY_MONTHLY_LISTENER_OVERRIDES = new Map([
  ["Ranges", 3385],
  ["Sylvaine", 41989],
  ["GOODBYE, KINGS", 212],
  ["Blue Foundation", 1460026],
  ["caroline", 74152],
  ["EF", 8827],
]);
const SPOTIFY_ARTIST_URL_OVERRIDES = new Map([
  ["Ranges", "https://open.spotify.com/artist/1iqjhf6W2YXUWwa2iKMybf"],
  ["Sylvaine", "https://open.spotify.com/artist/5C9ocrDvsfSz8qcxG70QEe"],
  ["GOODBYE, KINGS", "https://open.spotify.com/artist/2tVN2b4FcfGssyQBbAE9Xa"],
  ["Blue Foundation", "https://open.spotify.com/artist/1FWybrAwiSa0zKibdLfZZr"],
  ["caroline", "https://open.spotify.com/artist/4Ge8xMJNwt6EEXOzVXju9a"],
  ["EF", "https://open.spotify.com/artist/2do4Z40QtYI2DXXc7xIlSs"],
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseMonthlyListeners(text) {
  const patterns = [
    /([\d.,]+\s*[KMB]?)\s+monthly listeners/i,
    /([\d.,]+\s*[万亿千百KMB]?)\s*位月听众/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return normalizeNumber(match[1]);
    }
  }
  return null;
}

function normalizeNumber(value) {
  const raw = value.trim().replace(/,/g, "").toUpperCase();
  if (raw.endsWith("K")) return Math.round(Number(raw.slice(0, -1)) * 1_000);
  if (raw.endsWith("M")) return Math.round(Number(raw.slice(0, -1)) * 1_000_000);
  if (raw.endsWith("B")) return Math.round(Number(raw.slice(0, -1)) * 1_000_000_000);
  const num = Number(raw);
  return Number.isFinite(num) ? Math.round(num) : null;
}

async function findSpotifyArtistUrl(page, bandName) {
  const url = `https://open.spotify.com/search/${encodeURIComponent(
    bandName,
  )}/artists`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(SEARCH_WAIT_MS);

  const artistUrl = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a[href^='/artist/']"));
    const href = anchors
      .map((a) => a.getAttribute("href"))
      .find((h) => typeof h === "string" && h.startsWith("/artist/"));
    return href ? `https://open.spotify.com${href}` : null;
  });

  return artistUrl;
}

async function fetchSpotifyMonthlyListeners(page, bandName) {
  if (SPOTIFY_MONTHLY_LISTENER_OVERRIDES.has(bandName)) {
    return {
      spotifyArtistUrl: SPOTIFY_ARTIST_URL_OVERRIDES.get(bandName) ?? null,
      monthlyListeners: SPOTIFY_MONTHLY_LISTENER_OVERRIDES.get(bandName),
      spotifyError: "使用人工校正值",
    };
  }

  try {
    const artistUrl = await findSpotifyArtistUrl(page, bandName);
    if (!artistUrl) {
      return {
        spotifyArtistUrl: null,
        monthlyListeners: null,
        spotifyError: "未找到 Spotify 艺术家页面",
      };
    }

    await page.goto(artistUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(2500);
    const bodyText = await page.locator("body").innerText();
    const monthlyListeners = parseMonthlyListeners(bodyText);

    return {
      spotifyArtistUrl: artistUrl,
      monthlyListeners,
      spotifyError: monthlyListeners ? null : "已打开页面，但未解析到月听众字段",
    };
  } catch (error) {
    return {
      spotifyArtistUrl: null,
      monthlyListeners: null,
      spotifyError: error instanceof Error ? error.message : "未知错误",
    };
  }
}

function average(values) {
  if (!values.length) return null;
  const sum = values.reduce((acc, cur) => acc + cur, 0);
  return Number((sum / values.length).toFixed(2));
}

async function fetchGoogleTrendScore(bandName) {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
  let lastError = null;

  for (let attempt = 1; attempt <= GOOGLE_TREND_MAX_RETRIES; attempt += 1) {
    try {
      const response = await googleTrends.interestOverTime({
        keyword: [bandName, ...GOOGLE_BASELINE_KEYWORDS],
        startTime,
        endTime,
        geo: "",
      });
      const parsed = JSON.parse(response);
      const timeline = parsed.default?.timelineData ?? [];
      const bandValues = timeline
        .map((item) => item?.value?.[0])
        .filter((v) => Number.isFinite(v));
      const baselineValues = timeline
        .map((item) => item?.value?.[1])
        .filter((v) => Number.isFinite(v));
      const baselineAltValues = timeline
        .map((item) => item?.value?.[2])
        .filter((v) => Number.isFinite(v));

      const bandAvg = average(bandValues);
      const baselineAvg = average(baselineValues);
      const baselineAltAvg = average(baselineAltValues);
      const baselineCandidates = [baselineAvg, baselineAltAvg].filter(
        (v) => Number.isFinite(v) && v > 0,
      );
      const effectiveBaselineAvg = baselineCandidates.length
        ? Math.max(...baselineCandidates)
        : null;
      const ratio =
        Number.isFinite(bandAvg) &&
        Number.isFinite(effectiveBaselineAvg) &&
        effectiveBaselineAvg > 0
          ? Number((bandAvg / effectiveBaselineAvg).toFixed(4))
          : null;

      return {
        googleTrendBaselineKeywords: GOOGLE_BASELINE_KEYWORDS,
        googleTrendAvg30d: bandAvg,
        googleTrendPeak30d: bandValues.length ? Math.max(...bandValues) : null,
        googleTrendDataPoints: bandValues.length,
        googleTrendBaselineAvg30d: effectiveBaselineAvg,
        googleTrendBaselineAvg30dEN: baselineAvg,
        googleTrendBaselineAvg30dZH: baselineAltAvg,
        googleTrendVsBaselineRatio: ratio,
        googleTrendError: null,
      };
    } catch (error) {
      lastError = error;
      if (attempt < GOOGLE_TREND_MAX_RETRIES) {
        // Exponential backoff with jitter helps reduce 429 / anti-bot failures.
        const waitMs = 1200 * 2 ** (attempt - 1) + Math.floor(Math.random() * 700);
        await sleep(waitMs);
      }
    }
  }

  return {
    googleTrendBaselineKeywords: GOOGLE_BASELINE_KEYWORDS,
    googleTrendAvg30d: null,
    googleTrendPeak30d: null,
    googleTrendDataPoints: 0,
    googleTrendBaselineAvg30d: null,
    googleTrendBaselineAvg30dEN: null,
    googleTrendBaselineAvg30dZH: null,
    googleTrendVsBaselineRatio: null,
    googleTrendError: lastError instanceof Error ? lastError.message : "未知错误",
  };
}

async function main() {
  const lineupRaw = await fs.readFile(LINEUP_PATH, "utf-8");
  const lineup = JSON.parse(lineupRaw);
  const bands = lineup.map((item) => item.name);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: "en-US",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  const results = [];
  for (const name of bands) {
    console.log(`\n[${results.length + 1}/${bands.length}] ${name}`);
    const spotify = await fetchSpotifyMonthlyListeners(page, name);
    const trend = await fetchGoogleTrendScore(name);
    const merged = {
      name,
      fetchedAt: new Date().toISOString(),
      ...spotify,
      ...trend,
    };
    results.push(merged);
    console.log(
      `Spotify: ${merged.monthlyListeners ?? "N/A"} | GoogleTrend(30d avg): ${
        merged.googleTrendAvg30d ?? "N/A"
      } | vs ${GOOGLE_BASELINE_KEYWORDS.join(" / ")}: ${
        merged.googleTrendVsBaselineRatio ?? "N/A"
      }`,
    );
    await sleep(1500);
  }

  await browser.close();
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(results, null, 2)}\n`, "utf-8");
  console.log(`\n抓取完成，结果已写入: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("执行失败:", error);
  process.exit(1);
});
