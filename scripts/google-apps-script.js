/**
 * Budget Bot - Google Apps Script
 * Handles Telegram webhook and manages Google Sheets Budget entries
 */

// Configuration
const SHEET_NAME = "Budget"; // Change if your sheet has a different name

/**
 * Main function to handle POST requests from Telegram
 * This is the webhook endpoint
 */
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

/**
 * Handle incoming Telegram messages
 */
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

/**
 * Add entry to Google Sheet
 */
function addBudgetEntry(name, amount) {
  const sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(SHEET_NAME);
  
  // Add new row with data
  sheet.appendRow([name, amount]);
  
  Logger.log(`Added: ${name} - ${amount}`);
}

/**
 * Get all budget entries formatted for Telegram
 */
function getBudgetList() {
  const sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return "📋 No entries yet.\n\nAdd one with: /add <name> <amount>";
  }
  
  let message = "📋 Budget Entries:\n\n";
  let total = 0;
  
  // Skip header row (row 0)
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

/**
 * Send message to Telegram
 */
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

/**
 * Deploy the script and get the deployment URL
 * Run this to verify deployment
 */
function deployScript() {
  const url = ScriptApp.getService().getUrl();
  Logger.log("Deployment URL: " + url);
  return url;
}

/**
 * Set webhook for Telegram bot
 */
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

/**
 * Get webhook status info
 */
function getWebhookInfo() {
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  const url = `https://api.telegram.org/bot${token}/getWebhookInfo`;
  
  const response = UrlFetchApp.fetch(url);
  const result = JSON.parse(response.getContentText());
  
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Get bot information
 */
function getBotInfo() {
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  const url = `https://api.telegram.org/bot${token}/getMe`;
  
  const response = UrlFetchApp.fetch(url);
  const result = JSON.parse(response.getContentText());
  
  Logger.log("Bot Info: " + JSON.stringify(result, null, 2));
  return result;
}

/**
 * Remove webhook (if needed)
 */
function removeWebhook() {
  const token = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
  const url = `https://api.telegram.org/bot${token}/deleteWebhook`;
  
  const response = UrlFetchApp.fetch(url);
  const result = JSON.parse(response.getContentText());
  
  Logger.log("Delete response: " + JSON.stringify(result, null, 2));
  return result;
}

/**
 * Check sheet data (for debugging)
 */
function checkSheetData() {
  const sheetId = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(SHEET_NAME);
  
  const data = sheet.getDataRange().getValues();
  Logger.log("Sheet data: " + JSON.stringify(data, null, 2));
  
  return data;
}

/**
 * View script properties (for debugging)
 */
function viewScriptProperties() {
  const props = PropertiesService.getScriptProperties().getAll();
  Logger.log("Script Properties: " + JSON.stringify(props, null, 2));
  return props;
}