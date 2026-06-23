import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { StandardSitePublisher } from "@kckempf/astro-standard-site";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "../src/lib/consts";

const RECORDS_PATH = resolve(import.meta.dirname, "../src/data/standard-site-records.json");
const POSTS_DIR = resolve(import.meta.dirname, "../src/content/posts");
const FAVICON_PATH = resolve(import.meta.dirname, "../public/favicon.png");
const DID = "did:plc:qiyhlatbxz3cr2dch5x5o3dy";

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
  const existingPubs = await publisher.listPublications();
  let pubRkey: string | null = records.publication.rkey || null;

  if (!pubRkey) {
    const pub = existingPubs.find((p) => p.value.url === SITE_URL);
    if (pub) {
      pubRkey = pub.uri.split("/").pop()!;
      records.publication.rkey = pubRkey;
      console.log(`Found existing publication: ${pubRkey}`);
    }
  }

  if (!pubRkey) {
    console.log("Creating publication...");
    const result = await publisher.publishPublication({
      name: SITE_TITLE,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      preferences: { showInDiscover: true },
    });
    pubRkey = result.uri.split("/").pop()!;
    records.publication.rkey = pubRkey;
    console.log(`Publication created: ${result.uri}`);
  } else {
    console.log(`Publication rkey: ${pubRkey}`);
  }

  // Ensure publication has no basicTheme (publisher doesn't add $type discriminators)
  const pub = existingPubs.find((p) => p.uri.endsWith(pubRkey!));
  if (pub?.value?.basicTheme) {
    console.log("Removing invalid basicTheme from publication...");
    const agent = publisher.getAtpAgent();
    await agent.api.com.atproto.repo.putRecord({
      repo: DID,
      collection: "site.standard.publication",
      rkey: pubRkey!,
      record: {
        $type: "site.standard.publication",
        url: SITE_URL,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        preferences: { showInDiscover: true },
      },
    });
    console.log("Publication updated.");
  }

  // Upload publication icon if missing
  if (!pub?.value?.icon || !pub.value.icon.ref?.$link) {
    console.log("Uploading publication icon...");
    const faviconBytes = readFileSync(FAVICON_PATH);
    const agent = publisher.getAtpAgent();
    const blobRes = await agent.api.com.atproto.repo.uploadBlob(faviconBytes, {
      encoding: "image/png",
    });
    console.log(`  Blob uploaded: ${blobRes.data.blob.ref.$link}`);
    await agent.api.com.atproto.repo.putRecord({
      repo: DID,
      collection: "site.standard.publication",
      rkey: pubRkey!,
      record: {
        $type: "site.standard.publication",
        url: SITE_URL,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        icon: blobRes.data.blob,
        preferences: { showInDiscover: true },
      },
    });
    console.log("  Icon added to publication.");
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
    const { data, body } = parseFrontmatter(raw);

    if (data.draft) {
      console.log(`  [SKIP] ${slug} (draft)`);
      continue;
    }

    const title = (data.title as string) || slug;
    const date = data.date instanceof Date ? data.date : new Date(data.date as string);
    const frontDescription = data.description as string | undefined;
    const bodyDesc = body
      .replace(/[#*_`\[\]()>~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const description = frontDescription
      ?? (bodyDesc.length > 300
        ? bodyDesc.slice(0, 300) + '...'
        : bodyDesc)
      || undefined;
    const path = `/posts/${slug}`;

    const pubAtUri = `at://${DID}/site.standard.publication/${records.publication.rkey}`;
    const documentInput = {
      site: pubAtUri,
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
