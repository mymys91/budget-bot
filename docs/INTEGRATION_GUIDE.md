# Integration Guide - Complete Setup

This guide helps you verify everything is working correctly and provides troubleshooting steps.

## Pre-Integration Checklist

Before you start, make sure you've completed:

- ✅ Google Sheet "Budget" created with columns: Name, Amount
- ✅ Google Apps Script project created and deployed
- ✅ Script Properties configured with:
  - `SHEET_ID` - Your Google Sheet ID
  - `TELEGRAM_BOT_TOKEN` - Your bot token from BotFather
  - `DEPLOYMENT_URL` - Your Apps Script web app URL
- ✅ Telegram bot created via @BotFather
- ✅ Webhook set in Telegram

## Step 1: Verify Google Apps Script Deployment

1. Open your Google Apps Script project
2. Run the `deployScript()` function
3. Check the execution log - it should show a URL like:
   ```
   Deployment URL: https://script.googleapis.com/macros/d/{DEPLOYMENT_ID}/usercontent
   ```

## Step 2: Verify Telegram Webhook

1. Run the `getWebhookInfo()` function
2. Check the execution logs for output similar to:
   ```json
   {
     "ok": true,
     "result": {
       "url": "https://script.googleapis.com/macros/d/...",
       "has_custom_certificate": false,
       "pending_update_count": 0,
       "ip_address": "...",
       "last_error_date": 0,
       "max_connections": 40
     }
   }
   ```

If `url` is empty, the webhook is not set. Run `setWebhook()` again.

## Step 3: End-to-End Testing

### Test 1: Basic Commands

1. Open Telegram and chat with your bot
2. Send `/start`
3. You should receive:
   ```
   👋 Welcome to Budget Bot!
   
   Commands:
   /start - Show this message
   /add <name> <amount> - Add budget entry
   /list - Show all entries
   /help - Show help
   
   Example: /add Grocery 50
   ```

### Test 2: Add an Entry

1. Send: `/add Groceries 75`
2. Expected response:
   ```
   ✅ Added: Groceries - $75
   ```
3. Check your Google Sheet - a new row should appear:
   ```
   | Groceries | 75 |
   ```

### Test 3: List Entries

1. Send: `/list`
2. Expected response:
   ```
   📋 Budget Entries:
   
   • Groceries: $75
   
   💰 Total: $75
   ```

### Test 4: Multiple Entries

1. Add several more entries:
   - `/add Transport 20`
   - `/add Utilities 100`
   - `/add Entertainment 30`

2. Send `/list` again
3. Should show all entries with total sum

### Test 5: Error Handling

1. Send: `/add OnlyName` (missing amount)
   - Expected: `❌ Invalid format!`

2. Send: `/add Item NotANumber` (invalid amount)
   - Expected: `❌ Amount must be a number!`

3. Send: `/unknown`
   - Expected: `❓ Unknown command.`

## Step 4: Monitor Execution Logs

For debugging, check the execution logs in Google Apps Script:

1. Go to Apps Script editor
2. Click **"Executions"** at the top
3. View recent executions and any errors

Common log messages:
- ✅ `Added: ItemName - Amount` - Entry was added successfully
- ❌ `Error in doPost: ...` - Error processing the request
- ❌ `Sheet not found` - Check sheet name and ID

## Advanced Testing

### Test Message Structure

To see what Telegram is sending:

```javascript
function testWebhook() {
  // Simulate a Telegram message
  const testMessage = {
    message: {
      chat: { id: 123456789 },
      from: { id: 987654321 },
      text: "/add TestItem 100"
    }
  };
  
  const result = handleTelegramMessage(testMessage);
  Logger.log("Test result: " + result);
}
```

### Check Sheet Data

```javascript
function checkSheetData() {
  const sheet = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty("SHEET_ID")
  ).getSheetByName("Budget");
  
  const data = sheet.getDataRange().getValues();
  Logger.log("Sheet data: " + JSON.stringify(data, null, 2));
  
  return data;
}
```

### View Script Properties

```javascript
function viewScriptProperties() {
  const props = PropertiesService.getScriptProperties().getAll();
  Logger.log("Script Properties: " + JSON.stringify(props, null, 2));
  return props;
}
```

## Troubleshooting Guide

### Issue: Bot doesn't respond

**Cause 1: Webhook not set**
- Fix: Run `setWebhook()` function
- Verify with `getWebhookInfo()`

**Cause 2: Wrong deployment URL**
- Fix: Update `DEPLOYMENT_URL` in Script Properties
- Re-run `setWebhook()`

**Cause 3: Permission issues**
- Fix: Re-deploy as Web App with "Anyone" access

### Issue: Data not saving to Sheet

**Cause 1: Wrong Sheet ID**
- Fix: Get correct ID from Sheet URL
- Update `SHEET_ID` in Script Properties

**Cause 2: Sheet name mismatch**
- Fix: Update `SHEET_NAME` in Apps Script code
- Must match exactly (case-sensitive)

**Cause 3: Permissions**
- Fix: Make sure bot account has edit access to the sheet
- Share sheet with the Google account running the script

### Issue: Telegram token error

**Cause: Invalid token**
- Fix: Verify token from BotFather (should be very long)
- Update `TELEGRAM_BOT_TOKEN` in Script Properties

### Issue: Slow responses

**Cause: Apps Script execution time**
- Normal - first request can take 2-5 seconds
- Subsequent requests are usually faster

### Issue: Webhook certificate error

**Cause: Temporary SSL issue**
- Fix: Usually resolves automatically
- Telegram retries webhook delivery automatically

## Performance Optimization

For better performance with many entries:

```javascript
// Cache sheet reference
let sheetCache = null;

function getSheet() {
  if (!sheetCache) {
    const sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
    sheetCache = SpreadsheetApp.openById(sheetId).getSheetByName("Budget");
  }
  return sheetCache;
}
```

## Security Considerations

1. **Never share your bot token** - It's like a password
2. **Keep Sheet IDs private** - Only share what's necessary
3. **Validate input** - The script already does basic validation
4. **Monitor usage** - Check execution logs regularly

## Next Steps

Your budget bot is now fully set up! 🎉

### You can now:
- Add budget entries via Telegram
- View all entries
- Keep your Google Sheet updated automatically
- Extend the functionality (see Advanced Features below)

### Advanced Features to Add:
- Edit existing entries
- Delete entries
- Calculate monthly totals
- Set budget limits
- Export to CSV
- Database logging
- Multiple user support

## Support & Resources

- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Google Sheets API](https://developers.google.com/sheets/api)

---

**Status**: 🚀 Ready for production!

Enjoy your Budget Bot! 💰