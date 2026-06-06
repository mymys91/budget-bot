/**
 * Configuration Template for Budget Bot
 * 
 * Store these values in Google Apps Script Project Settings
 * under "Script Properties" (⚙️ gear icon)
 */

// ========================================
// REQUIRED CONFIGURATION
// ========================================

// 1. SHEET_ID
// Get from your Google Sheet URL:
// https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
//                                        ^^^^^^^^
// Example: "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t"
const SHEET_ID = "YOUR_SHEET_ID_HERE";

// 2. TELEGRAM_BOT_TOKEN
// Get from @BotFather on Telegram
// Looks like: "123456789:ABCDEfghIJKlmNOpqrsTUvwXYZ1a2B3c4D5e"
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";

// 3. DEPLOYMENT_URL
// Get from deploying the Apps Script as Web App
// Looks like: "https://script.googleapis.com/macros/d/DEPLOYMENT_ID/usercontent"
const DEPLOYMENT_URL = "YOUR_DEPLOYMENT_URL_HERE";

// ========================================
// OPTIONAL CONFIGURATION
// ========================================

// Sheet name where budget data is stored
const SHEET_NAME = "Budget";

// Message templates (customize these)
const MESSAGES = {
  welcome: "👋 Welcome to Budget Bot!\n\n" +
    "Commands:\n" +
    "/start - Show this message\n" +
    "/add <name> <amount> - Add budget entry\n" +
    "/list - Show all entries\n" +
    "/help - Show help\n\n" +
    "Example: /add Grocery 50",
    
  help: "📖 Budget Bot Help\n\n" +
    "To add a budget entry:\n" +
    "/add <name> <amount>\n\n" +
    "Example:\n" +
    "/add Groceries 50\n" +
    "/add Electricity 100\n\n" +
    "To view all entries:\n" +
    "/list",
    
  addSuccess: "✅ Added: {name} - ${amount}",
  addInvalidFormat: "❌ Invalid format!\n\nUse: /add <name> <amount>\nExample: /add Grocery 50",
  addInvalidAmount: "❌ Amount must be a number!",
  
  listEmpty: "📋 No entries yet.\n\nAdd one with: /add <name> <amount>",
  listHeader: "📋 Budget Entries:\n\n",
  listTotal: "\n💰 Total: ${total}",
  
  unknownCommand: "❓ Unknown command.\n\nType /help for available commands.",
  error: "❌ Error: {error}"
};

// ========================================
// HOW TO USE THIS FILE
// ========================================

/*
1. Get your SHEET_ID:
   - Open your Google Sheet
   - Look at the URL: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
   - Copy the ID

2. Get your TELEGRAM_BOT_TOKEN:
   - Open Telegram and search for @BotFather
   - Send /newbot
   - Follow instructions
   - Copy the token it provides

3. Get your DEPLOYMENT_URL:
   - In Google Apps Script, click "Deploy"
   - Select "New deployment"
   - Choose "Web app" type
   - Click "Deploy"
   - Copy the URL shown

4. Add to Script Properties:
   - In Google Apps Script, click ⚙️ (Project Settings)
   - Go to "Script Properties" section
   - Click "Add script property" for each:
   
   Property Name: SHEET_ID
   Value: [paste your sheet ID]
   
   Property Name: TELEGRAM_BOT_TOKEN
   Value: [paste your bot token]
   
   Property Name: DEPLOYMENT_URL
   Value: [paste your deployment URL]
   
   Click "Save"

5. Set the webhook:
   - In Apps Script, run the setWebhook() function
   - Check logs for success message
   - Done!

*/

// ========================================
// VALIDATION FUNCTION
// ========================================

function validateConfiguration() {
  const props = PropertiesService.getScriptProperties().getAll();
  
  const required = ["SHEET_ID", "TELEGRAM_BOT_TOKEN", "DEPLOYMENT_URL"];
  const missing = [];
  
  required.forEach(prop => {
    if (!props[prop]) {
      missing.push(prop);
    }
  });
  
  if (missing.length > 0) {
    Logger.log("❌ Missing configuration: " + missing.join(", "));
    throw new Error("Missing required configuration: " + missing.join(", "));
  }
  
  Logger.log("✅ Configuration is valid!");
  return true;
}

// ========================================
// DEBUG FUNCTION
// ========================================

function debugConfiguration() {
  Logger.log("=== Budget Bot Configuration Debug ===");
  
  const props = PropertiesService.getScriptProperties().getAll();
  
  Logger.log("SHEET_ID: " + (props.SHEET_ID ? "✅ Set" : "❌ Missing"));
  Logger.log("TELEGRAM_BOT_TOKEN: " + (props.TELEGRAM_BOT_TOKEN ? "✅ Set" : "❌ Missing"));
  Logger.log("DEPLOYMENT_URL: " + (props.DEPLOYMENT_URL ? "✅ Set" : "❌ Missing"));
  
  try {
    if (props.SHEET_ID) {
      const sheet = SpreadsheetApp.openById(props.SHEET_ID);
      Logger.log("✅ Can access Google Sheet");
    }
  } catch (e) {
    Logger.log("❌ Cannot access Google Sheet: " + e);
  }
  
  if (props.TELEGRAM_BOT_TOKEN) {
    const url = `https://api.telegram.org/bot${props.TELEGRAM_BOT_TOKEN}/getMe`;
    try {
      const response = UrlFetchApp.fetch(url);
      const result = JSON.parse(response.getContentText());
      if (result.ok) {
        Logger.log("✅ Telegram bot token is valid");
        Logger.log("   Bot username: @" + result.result.username);
      } else {
        Logger.log("❌ Telegram bot token is invalid");
      }
    } catch (e) {
      Logger.log("❌ Cannot validate Telegram token: " + e);
    }
  }
  
  Logger.log("=== End Debug ===");
}