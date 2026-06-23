import type { APIRoute } from "astro";
import records from "../../data/standard-site-records.json";

const DID = "did:plc:qiyhlatbxz3cr2dch5x5o3dy";

export const GET: APIRoute = () => {
  const rkey = records.publication.rkey;
  if (!rkey) {
    return new Response("publication not yet published", { status: 404 });
  }
  return new Response(`at://${DID}/site.standard.publication/${rkey}`, {
    headers: { "Content-Type": "text/plain" },
  });
};
