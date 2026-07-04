# Youtube Statistics Widget for Discord

This will show your youtube statistics on your discord profile

Based on [ItsDenji777/SteamWidgetUpdater](https://github.com/ItsDenji777/SteamWidgetUpdater).

## Setup

1. Fork this repository.
2. Import `youtube_widget.json` with your Discord widget import tool or If you're new, use this tutorial: https://hub.tcno.co/discord/widgets/
4. Add these [GitHub Actions secrets](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions):

| Secret | Value | Where |
| --- | --- | --- |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | [Google API credentials](https://developers.google.com/youtube/registering_an_application) |
| `YOUTUBE_CHANNEL_ID` | Your Channel ID | [YouTube advanced settings](https://support.google.com/youtube/answer/3250431) |
| `BOT_TOKEN` | Discord bot token | [Discord Developer Portal](https://discord.com/developers/applications) |
| `APPLICATION_ID` | Discord application ID | [Discord Application ID](https://support-dev.discord.com/hc/en-us/articles/360028717192-Where-can-I-find-my-Application-Team-Server-ID) |
| `DISCORD_USER_ID` | Your Discord user ID | [Discord User ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID) |

## Run

The workflow runs daily at midnight UTC and can also be started from:

`Actions -> Update YouTube Widget -> Run workflow`

Local check:

```bash
node youtube-widget.js --self-test
```
