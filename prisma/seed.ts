import { PrismaClient } from "@prisma/client";
console.log('DATABASE_URL at runtime:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  const tools = [
    "Zendesk", "Supportal", "Fraudal", "Kustomer", "Google Drive",
    "Jira", "Slack", "Snowflake", "Databricks", "Comet (Perplexity)",
    "Scout", "Mission Control", "FAST"
  ];
  await Promise.all(
    tools.map((name) =>
      prisma.tool.upsert({
        where: { name },
        create: { name },
        update: {},
      })
    )
  );

  const brian = await prisma.person.upsert({
    where: { slackHandle: "@b.johnson" },
    create: { name: "Brian Johnson", slackHandle: "@b.johnson" },
    update: {},
  });

  const p1 = await prisma.project.create({
    data: {
      title: "Automatic Ticket Triage",
      description:
        "Classify and route Zendesk tickets using an LLM; auto-replies for common intents.",
      team: "Support",
      owner: "Brian Johnson",
      hoursSavedPerWeek: 28,
      tools: {
        create: [
          { tool: { connect: { name: "Zendesk" } } },
          { tool: { connect: { name: "Scout" } } },
        ],
      },
      links: {
        create: [
          { type: "Jira", url: "https://jira.example/AI-123" },
          { type: "Drive", url: "https://drive.google.com/file/example" },
        ],
      },
    },
  });

  const p2 = await prisma.project.create({
    data: {
      title: "Receipt Fraud Anomaly Scorer",
      description:
        "Detects anomalous receipt behavior and routes to Fraudal with priority scoring.",
      team: "Fraud",
      owner: "Sara H.",
      hoursSavedPerWeek: 16,
      tools: {
        create: [
          { tool: { connect: { name: "Fraudal" } } },
          { tool: { connect: { name: "Databricks" } } },
        ],
      },
    },
  });

  await prisma.personProject.createMany({
    data: [
      { personId: brian.id, projectId: p1.id, role: "Owner" },
      { personId: brian.id, projectId: p2.id, role: "Advisor" },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
