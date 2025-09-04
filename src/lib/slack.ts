// src/lib/slack.ts
export async function notifyNewProject(project: {
  id: string | number;
  title?: string | null;
  team?: string | null;
  owner?: string | null;
  summary?: string | null;
  tools?: { tool: { name: string } }[];
  links?: { type: string; url: string }[];
}) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    console.warn("SLACK_WEBHOOK_URL is not set");
    return;
  }

  const base =
    process.env.APP_BASE_URL ?? "https://fetchops-ai-project-catalog.replit.app";

  const toolList =
    project.tools && project.tools.length
      ? project.tools.map((t) => t.tool.name).join(", ")
      : "—";

  const linksList =
    project.links && project.links.length
      ? project.links.map((link) => `<${link.url}|${link.type}>`).join(" • ")
      : "—";

  const textLines = [
    `*New AI project submitted!*`,
    `*Title:* ${project.title || "(Untitled)"}`,
    `*Team:* ${project.team || "—"}`,
    `*Owner:* ${project.owner || "—"}`,
    `*Tools:* ${toolList}`,
    `*Links:* ${linksList}`,
    project.summary ? `*Summary:* ${project.summary}` : undefined,
    `<${base}/projects/${project.id}|View in Catalog>`,
  ].filter(Boolean);

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: textLines.join("\n"),
        unfurl_links: false,
        unfurl_media: false,
      }),
    });
  } catch (err) {
    console.error("Slack notify failed:", err);
  }
}
