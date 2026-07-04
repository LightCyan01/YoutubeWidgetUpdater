function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing GitHub Secret: ${name}`);
  return value;
}

async function request(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();

  if (!response.ok) throw new Error(`${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

function required(value, label) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`YouTube did not return ${label}`);
  return text;
}

function count(value, label) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`YouTube did not return ${label}`);
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`YouTube returned invalid ${label}: ${value}`);
  }

  return number;
}

function descriptionLines(value) {
  const lines = String(value || "No description")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return [lines[0] || "No description", lines.slice(1).join(" ")];
}

function joinDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toISOString().slice(0, 10);
}

function thumbnail(thumbnails = {}) {
  return required(
    thumbnails.maxres?.url ||
      thumbnails.high?.url ||
      thumbnails.medium?.url ||
      thumbnails.default?.url,
    "channel image",
  );
}

async function getChannel() {
  const channelId = env("YOUTUBE_CHANNEL_ID");
  const params = new URLSearchParams({
    part: "snippet,statistics",
    id: channelId,
    key: env("YOUTUBE_API_KEY"),
  });
  const data = await request(`https://www.googleapis.com/youtube/v3/channels?${params}`);
  const channel = data.items?.[0];

  if (!channel) throw new Error(`No YouTube channel found for ${channelId}`);
  return channel;
}

function buildWidget(channel) {
  const snippet = channel.snippet || {};
  const stats = channel.statistics || {};
  const [description1, description2] = descriptionLines(snippet.description);

  return {
    data: {
      dynamic: [
        { type: 1, name: "display_name", value: required(snippet.title, "channel name") },
        { type: 1, name: "description_1", value: description1 },
        { type: 1, name: "description_2", value: description2 },
        { type: 3, name: "profile_picture", value: { url: thumbnail(snippet.thumbnails) } },
        { type: 1, name: "username", value: required(snippet.customUrl, "channel username") },
        { type: 2, name: "subscribers", value: count(stats.subscriberCount, "subscriber count") },
        { type: 1, name: "total_videos", value: count(stats.videoCount, "video count").toLocaleString("en-US") },
        { type: 1, name: "total_views", value: count(stats.viewCount, "view count").toLocaleString("en-US") },
        { type: 1, name: "country", value: snippet.country || "Unknown" },
        { type: 1, name: "join_date", value: joinDate(snippet.publishedAt) },
      ],
    },
  };
}

async function updateDiscord(widget) {
  const applicationId = env("APPLICATION_ID");
  const userId = env("DISCORD_USER_ID");

  await request(`https://discord.com/api/v9/applications/${applicationId}/users/${userId}/identities/0/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bot ${env("BOT_TOKEN")}`,
      "Content-Type": "application/json",
      "User-Agent": "DiscordBot",
    },
    body: JSON.stringify(widget),
  });
}

async function main() {
  log("Fetching YouTube channel data...");
  const widget = buildWidget(await getChannel());

  log("Widget preview:");
  console.log(JSON.stringify(widget, null, 2));

  log("Updating Discord widget...");
  await updateDiscord(widget);
  log("YouTube widget update completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
