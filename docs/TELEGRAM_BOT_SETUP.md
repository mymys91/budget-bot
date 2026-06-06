# Telegram Bot Setup Guide

This guide walks you through creating and configuring your Telegram bot.

## Step 1: Create a Telegram Bot with BotFather

1. Open Telegram and search for **@BotFather**
2. Start a chat with BotFather
3. Send `/newbot`
4. BotFather will ask you to enter a name (e.g., "Budget Bot")
5. Enter a username (must end with "bot", e.g., "my_budget_bot")
6. BotFather will send you a **token** that looks like:
   ```
   123456789:ABCDEfghIJKlmNOpqrsTUvwXYZ1a2B3c4D5e
   ```

**⚠️ IMPORTANT**: Save this token securely. You'll need it for the next steps.

## Step 2: Store Bot Token in Google Apps Script

1. Go back to your Google Apps Script project
2. Click **Project Settings** (⚙️ gear icon)
3. Under **Script Properties**, click **"Add script property"**
4. Add:
   - **Property**: `TELEGRAM_BOT_TOKEN`
   - **Value**: Paste your bot token here (from BotFather)
5. Click **"Add property"**
6. Save

## Step 3: Configure Webhook

The webhook tells Telegram to send messages to your Google Apps Script.

### Get Your Deployment URL

From the [Google Apps Script Setup](./GOOGLE_APPS_SCRIPT_SETUP.md), you should have a deployment URL like:
```
https://script.googleapis.com/macros/d/{DEPLOYMENT_ID}/usercontent
```

### Set Webhook Using Apps Script

1. In Google Apps Script, create a new function to set the webhook:

```javascript
function setWebhook() {
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  const deploymentUrl = PropertiesService.getScriptProperties().getProperty("DEPLOYMENT_URL");
  
  if (!token || !deploymentUrl) {
    throw new Error("TELEGRAM_BOT_TOKEN or DEPLOYMENT_URL not set!");
  }
  
  const url = `https://api.telegram.org/bot${token}/setWebhook`;
  
  const payload = {
    url: deploymentUrl,
    drop_pending_updates: true
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());
  
  Logger.log("Webhook response: " + response.getContentText());
  
  if (result.ok) {
    Logger.log("✅ Webhook set successfully!");
  } else {
    Logger.log("❌ Error: " + result.description);
  }
  
  return result;
}
```

2. Add your deployment URL to Script Properties:
   - **Property**: `DEPLOYMENT_URL`
   - **Value**: Your Apps Script deployment URL

3. Run the `setWebhook()` function:
   - Click **"Run"** → **"setWebhook"**
   - Check the execution log for success message

## Step 4: Test Your Bot

1. Open Telegram
2. Search for your bot username (e.g., @my_budget_bot)
3. Click **"Start"**
4. Try commands:
   - `/start` - Welcome message
   - `/help` - Help information
   - `/add Grocery 50` - Add an entry
   - `/list` - Show all entries

### Expected Responses

```
/start
→ Welcome to Budget Bot!
  Commands: /start, /add, /list, /help

/add Groceries 50
→ ✅ Added: Groceries - $50

/list
→ 📋 Budget Entries:
  • Groceries: $50
  💰 Total: $50
```

## Step 5: Verify Webhook Status

To check if your webhook is active:

```javascript
function getWebhookInfo() {
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  const url = `https://api.telegram.org/bot${token}/getWebhookInfo`;
  
  const response = UrlFetchApp.fetch(url);
  const result = JSON.parse(response.getContentText());
  
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
```

Run this function and check the logs to see webhook status.

## Advanced Configuration

### Get Bot Information

```javascript
function getBotInfo() {
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  const url = `https://api.telegram.org/bot${token}/getMe`;
  
  const response = UrlFetchApp.fetch(url);
  const result = JSON.parse(response.getContentText());
  
  Logger.log("Bot Info: " + JSON.stringify(result, null, 2));
  return result;
}
```

### Remove Webhook (if needed)

```javascript
function removeWebhook() {
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  const url = `https://api.telegram.org/bot${token}/deleteWebhook`;
  
  const response = UrlFetchApp.fetch(url);
  const result = JSON.parse(response.getContentText());
  
  Logger.log("Delete response: " + JSON.stringify(result, null, 2));
  return result;
}
```

## Troubleshooting

### "Webhook set failed"
- Check that your bot token is correct
- Ensure deployment URL is valid and accessible
- Make sure the Apps Script is deployed as "Web app" with "Anyone" access

### Bot not responding to messages
- Check webhook status with `getWebhookInfo()`
- Verify bot token in Script Properties
- Check execution logs for errors

### "Certificate pinning failed"
- This is usually temporary. The webhook will retry automatically

### Messages not appearing in Google Sheet
- Verify `SHEET_ID` is correct in Script Properties
- Check sheet name matches exactly (case-sensitive)
- Look at execution logs in Apps Script for errors

## Next Steps

✅ **Telegram bot is now configured!**

Now proceed to [Integration Guide](./INTEGRATION_GUIDE.md) for final testing.

---

**Status**: 🤖 Ready for integration