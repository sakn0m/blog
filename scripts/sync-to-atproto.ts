import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { StandardSitePublisher } from "@kckempf/astro-standard-site";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "../src/lib/consts";

const RECORDS_PATH = resolve(import.meta.dirname, "../src/data/standard-site-records.json");
const POSTS_DIR = resolve(import.meta.dirname, "../src/content/posts");
const DID = "did:plc:qiyhlatbxz3cr2dch5x5o3dy";
const HANDLE = "jojo.news";

interface RecordsFile {
  publication: { rkey: string };
  documents: Record<string, string>;
}

function parseFrontmatter(
  raw: string
): { data: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) {
      const val = kv[2].trim();
      if (val === "true") data[kv[1]] = true;
      else if (val === "false") data[kv[1]] = false;
      else if (/^\d{4}-\d{2}-\d{2}$/.test(val)) data[kv[1]] = new Date(val);
      else data[kv[1]] = val;
    }
  }
  return { data, body: match[2] };
}

function readRecords(): RecordsFile {
  try {
    return JSON.parse(readFileSync(RECORDS_PATH, "utf-8"));
  } catch {
    return { publication: { rkey: "" }, documents: {} };
  }
}

function writeRecords(records: RecordsFile) {
  writeFileSync(RECORDS_PATH, JSON.stringify(records, null, 2) + "\n");
}

function colorToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

async function main() {
  const password = process.env.ATPROTO_APP_PASSWORD;
  if (!password) {
    console.error("ATPROTO_APP_PASSWORD env var required");
    process.exit(1);
  }

  console.log("Authenticating...");

  const publisher = new StandardSitePublisher({
    identifier: DID,
    password,
  });
  await publisher.login();
  console.log(`Authenticated as ${publisher.getDid()}`);

  const records = readRecords();

  // --- Publication ---
  if (!records.publication.rkey) {
    console.log("Checking for existing publication...");
    const existingPubs = await publisher.listPublications();
    const pub = existingPubs.find((p) => p.value.url === SITE_URL);
    if (pub) {
      const rkey = pub.uri.split("/").pop()!;
      records.publication.rkey = rkey;
      console.log(`Found existing publication: ${rkey}`);
    } else {
      console.log("Creating publication...");
      const result = await publisher.publishPublication({
        name: SITE_TITLE,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        basicTheme: {
          background: colorToRgb("#FDFBF7"),
          foreground: colorToRgb("#1C1917"),
          accent: colorToRgb("#8B5E3C"),
          accentForeground: { r: 255, g: 255, b: 255 },
        },
        preferences: { showInDiscover: true },
      });
      const rkey = result.uri.split("/").pop()!;
      records.publication.rkey = rkey;
      console.log(`Publication created: ${result.uri}`);
    }
  } else {
    console.log(`Publication rkey: ${records.publication.rkey}`);
  }

  // --- Documents ---
  const existingDocs = await publisher.listDocuments();
  const existingByPath = new Map<string, { uri: string; cid: string }>();
  for (const doc of existingDocs) {
    const path = doc.value.path;
    if (path) existingByPath.set(path, doc);
  }

  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  console.log(`\nProcessing ${files.length} posts...`);

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = readFileSync(join(POSTS_DIR, file), "utf-8");
    const { data } = parseFrontmatter(raw);

    if (data.draft) {
      console.log(`  [SKIP] ${slug} (draft)`);
      continue;
    }

    const title = (data.title as string) || slug;
    const date = data.date instanceof Date ? data.date : new Date(data.date as string);
    const description = (data.description as string) || undefined;
    const path = `/posts/${slug}`;

    const documentInput = {
      site: SITE_URL,
      title,
      publishedAt: date.toISOString(),
      path,
      description,
    };

    const existingKey = records.documents[slug];
    if (existingKey) {
      console.log(`  [UPDATE] ${slug} (${existingKey})`);
      await publisher.updateDocument(existingKey, documentInput);
    } else {
      const existing = existingByPath.get(path);
      if (existing) {
        const rkey = existing.uri.split("/").pop()!;
        records.documents[slug] = rkey;
        console.log(`  [UPDATE] ${slug} (${rkey} - found via list)`);
        await publisher.updateDocument(rkey, documentInput);
      } else {
        console.log(`  [CREATE] ${slug}`);
        const result = await publisher.publishDocument(documentInput);
        const rkey = result.uri.split("/").pop()!;
        records.documents[slug] = rkey;
        console.log(`    → ${result.uri}`);
      }
    }
  }

  writeRecords(records);
  console.log("\nDone. Records written to src/data/standard-site-records.json");
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
