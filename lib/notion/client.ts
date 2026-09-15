import { Client } from "@notionhq/client";

const FALLBACK_CONTENT_PIPELINE_DATA_SOURCE_ID =
  "38148c16-95da-4a40-b6f0-bc664ca04e02";

export function getNotionClient() {
  const auth = process.env.NOTION_ACCESS_TOKEN;

  if (!auth) {
    throw new Error(
      "NOTION_ACCESS_TOKEN is not configured. Add it to the Vercel project environment before saving to Notion.",
    );
  }

  return new Client({
    auth,
    notionVersion: "2026-03-11",
  });
}

export function getContentPipelineDataSourceId() {
  return (
    process.env.NOTION_CONTENT_PIPELINE_DATA_SOURCE_ID ||
    FALLBACK_CONTENT_PIPELINE_DATA_SOURCE_ID
  );
}
