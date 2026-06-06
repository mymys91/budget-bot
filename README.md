# Budget Bot - Telegram Integration with Google Sheets

A Telegram chatbot that integrates with Google Sheets via Google Apps Script to manage your budget records. Users can add budget entries (Name and Amount) directly through Telegram.

## Architecture Overview

```
Telegram User
    ↓
Telegram Bot API
    ↓
Google Apps Script (Webhook)
    ↓
Google Sheets (Budget)
```

## Features

- ✅ Add budget records via Telegram chat
- ✅ Store data in Google Sheets
- ✅ Simple conversational interface
- ✅ Real-time data synchronization

## Quick Setup

### Phase 1: Google Apps Script Setup
- Create Google Apps Script project
- Set up Budget Google Sheet
- Deploy as web app
- Create API endpoints

### Phase 2: Telegram Bot Setup
- Create bot with BotFather
- Configure webhook
- Integrate with Google Apps Script

### Phase 3: Testing & Deployment
- Test bot commands
- Deploy to production
- Monitor and maintain

## Directory Structure

```
budget-bot/
├── README.md                          # This file
├── docs/
│   ├── GOOGLE_APPS_SCRIPT_SETUP.md   # Detailed Google Apps Script guide
│   ├── TELEGRAM_BOT_SETUP.md         # Telegram bot configuration guide
│   └── INTEGRATION_GUIDE.md          # Integration instructions
├── scripts/
│   ├── google-apps-script.js         # Main Apps Script code
│   └── config.js                     # Configuration template
└── telegram-bot/
    ├── bot-code.js                   # Telegram bot implementation (optional)
    └── webhook-handler.js            # Webhook handler for Google Apps Script
```

## Getting Started

1. **[Google Apps Script Setup](./docs/GOOGLE_APPS_SCRIPT_SETUP.md)** - Start here
2. **[Telegram Bot Setup](./docs/TELEGRAM_BOT_SETUP.md)** - Then create your bot
3. **[Integration Guide](./docs/INTEGRATION_GUIDE.md)** - Finally, connect them

## Prerequisites

- Google Account with access to Google Sheets
- Telegram Account
- Basic understanding of webhooks and APIs

## Support

For issues or questions, refer to:
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)

---

**Status**: 🚀 Ready for setup