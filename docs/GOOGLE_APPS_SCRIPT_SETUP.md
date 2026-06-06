# Google Apps Script Setup Guide

This guide walks you through setting up Google Apps Script to manage your Google Sheets Budget tracker.

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ New"** and create a **Blank spreadsheet**
3. Name it **"Budget"** (or your preferred name)
4. In the first sheet (default):
   - **Column A**: Add header "Name"
   - **Column B**: Add header "Amount"
5. Save the sheet

Example:
```
| Name      | Amount |
|-----------|--------|
| Grocery   | 50     |
| Transport | 20     |
```

**Note the Sheet ID** from the URL:
```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
                                        ^^^^^^^^
```

## Step 2: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click **"+ New project"**
3. Name it **"BudgetBot"**
4. You'll be taken to the editor

## Step 3: Link the Sheet to Apps Script

1. In the Apps Script editor, go to **Project Settings** (gear icon)
2. Scroll down and copy the **Project Number** (you'll need this)
3. Click **"Attach a library"** (or skip this for now)
4. In your Google Sheet, go to **Extensions → Apps Script**
5. This will create a bound script directly to your sheet (optional but easier)

## Step 4: Write the Apps Script Code

Copy and paste the following code into the Apps Script editor:

```javascript
// Configuration
const SHEET_NAME = "Budget"; // Change if your sheet has a different name
const SHEET_ID = "YOUR_SHEET_ID"; // Replace with your actual Sheet ID

// Main function to handle POST requests from Telegram
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    
    // Handle Telegram webhook
    if (contents.message) {
      return handleTelegramMessage(contents);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: "Invalid request"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Error in doPost: " + error);
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle incoming Telegram messages
function handleTelegramMessage(update) {
  const chatId = update.message.chat.id;
  const messageText = update.message.text;
  const userId = update.message.from.id;
  
  let responseText = "";
  
  try {
    // Parse user input
    if (messageText === "/start") {
      responseText = "👋 Welcome to Budget Bot!\n\n" +
        "Commands:\n" +
        "/start - Show this message\n" +
        "/add <name> <amount> - Add budget entry\n" +
        "/list - Show all entries\n" +
        "/help - Show help\n\n" +
        "Example: /add Grocery 50";
    } 
    else if (messageText === "/list") {
      responseText = getBudgetList();
    }
    else if (messageText === "/help") {
      responseText = "📖 Budget Bot Help\n\n" +
        "To add a budget entry:\n" +
        "/add <name> <amount>\n\n" +
        "Example:\n" +
        "/add Groceries 50\n" +
        "/add Electricity 100\n\n" +
        "To view all entries:\n" +
        "/list";
    }
    else if (messageText.startsWith("/add ")) {
      const parts = messageText.substring(5).trim().split(" ");
      
      if (parts.length < 2) {
        responseText = "❌ Invalid format!\n\n" +
          "Use: /add <name> <amount>\n" +
          "Example: /add Grocery 50";
      } else {
        const name = parts[0];
        const amount = parseFloat(parts[1]);
        
        if (isNaN(amount)) {
          responseText = "❌ Amount must be a number!";
        } else {
          addBudgetEntry(name, amount);
          responseText = `✅ Added: ${name} - $${amount}`;
        }
      }
    }
    else {
      responseText = "❓ Unknown command.\n\nType /help for available commands.";
    }
    
    // Send response back to Telegram
    sendTelegramMessage(chatId, responseText);
    
    return ContentService.createTextOutput("ok");
    
  } catch (error) {
    Logger.log("Error: " + error);
    sendTelegramMessage(chatId, "❌ Error: " + error.toString());
    return ContentService.createTextOutput("error");
  }
}

// Add entry to Google Sheet
function addBudgetEntry(name, amount) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  
  // Add new row with data
  sheet.appendRow([name, amount]);
  
  Logger.log(`Added: ${name} - ${amount}`);
}

// Get all budget entries
function getBudgetList() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return "📋 No entries yet.\n\nAdd one with: /add <name> <amount>";
  }
  
  let message = "📋 Budget Entries:\n\n";
  let total = 0;
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const name = data[i][0];
    const amount = data[i][1];
    if (name && amount) {
      message += `• ${name}: $${amount}\n`;
      total += parseFloat(amount);
    }
  }
  
  message += `\n💰 Total: $${total}`;
  return message;
}

// Send message to Telegram
function sendTelegramMessage(chatId, text) {
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not set in Script Properties!");
  }
  
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML"
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const result = JSON.parse(response.getContentText());
  
  if (!result.ok) {
    throw new Error("Failed to send Telegram message: " + response.getContentText());
  }
  
  return result;
}

// Deploy the script - call this function to get the deployment URL
function deployScript() {
  const url = ScriptApp.getService().getUrl();
  Logger.log("Deployment URL: " + url);
  return url;
}
```

## Step 5: Configure Script Properties

1. In Apps Script, go to **Project Settings** (⚙️ gear icon)
2. Under **Script Properties**, click **"Add script property"**
3. Add:
   - **Property**: `SHEET_ID`
   - **Value**: Your Google Sheet ID (from Step 1)
4. Save

(We'll add the Telegram token in the next phase)

## Step 6: Deploy as Web App

1. Click **"Deploy"** → **"New deployment"**
2. Select type: **Web app**
3. Configure:
   - **Execute as**: Your email address
   - **Who has access**: "Anyone"
4. Click **"Deploy"**
5. You'll see a deployment URL - **Copy this** (you'll need it for Telegram webhook setup)

Example URL:
```
https://script.googleapis.com/macros/d/{DEPLOYMENT_ID}/usercontent
```

## Step 7: Test the Script

1. Go back to your Google Sheet
2. In Apps Script, click **"Run"** → **"deployScript"**
3. Check the logs for the deployment URL
4. You should see it in the execution log

## Next Steps

✅ **Apps Script is now ready!**

Now proceed to [Telegram Bot Setup](./TELEGRAM_BOT_SETUP.md)

## Troubleshooting

### "Script Properties not found"
- Make sure you've added `SHEET_ID` in Project Settings

### "Sheet not found"
- Verify `SHEET_NAME` matches your actual sheet name (check spelling, case-sensitive)
- Verify `SHEET_ID` is correct

### "Deployment URL issues"
- Re-deploy the script as Web App
- Make sure "Who has access" is set to "Anyone"

---

**Status**: 📝 Ready for Telegram setup