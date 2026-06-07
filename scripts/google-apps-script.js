/**
 * Budget Bot - Google Apps Script
 * Handles Telegram webhook and manages Google Sheets Budget entries
 */

// Configuration
const CONFIG = {
  BOT_TOKEN: PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN'),
  DEPLOYMENT_URL: PropertiesService.getScriptProperties().getProperty('DEPLOYMENT_URL'),
  ALLOWED_CHAT_ID: PropertiesService.getScriptProperties().getProperty('ALLOWED_CHAT_ID'),
  SHEET_ID: PropertiesService.getScriptProperties().getProperty('SHEET_ID'),
  SHEET_BUDGET: "Budgets",
  SHEET_TRANSACTION: "Transactions",
  TIME_ZONE: Session.getScriptTimeZone(),
};


// Message templates (customize these)
const MESSAGES = {
  welcome: "👋 Welcome to Budget Bot!\n\n" +
    "Commands:\n" +
    "/start - Show this message\n" +
    "/create <name> <amount> - Create budget entry\n" +
    "/budgets - Show all budget entries\n" +
    "/log <budget> <name> <amount> - Add transaction to budget\n" +
    "/help - Show help\n\n" +
    "Example: /create Grocery 50",
    
  help: "📖 Budget Bot Help\n\n" +
    "To create a budget entry:\n" +
    "/create <name> <amount>\n\n" +
    "Example:\n" +
    "/create Groceries 50\n" +
    "/create Electricity 100\n\n" +
    "To view budget entries:\n" +
    "/budgets",
    
  addBudgetSuccess: "✅ Created: {name} - ${amount}",
  addBudgetInvalidFormat: "❌ Invalid format!\n\nUse: /create <name> <amount>\nExample: /create Grocery 50",
  addInvalidAmount: "❌ Amount must be a number!",
  
  listEmpty: "📋 No budget entries yet.\n\nCreate one with: /create <name> <amount>",
  listHeader: "📋 Budget Entries:\n\n",
  listTotal: "\n💰 Total: ${total}",
  
  unknownCommand: "❓ Unknown command.\n\nType /help for available commands.",
  error: "❌ Error: {error}"
};


/**
 * Main function to handle POST requests from Telegram
 * This is the webhook endpoint
 */
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var chatId = data.message.chat.id;
  
  var text = data.message.text;
  var response = "Hello World!";


  if (text === "/start") {
      response = MESSAGES.welcome;
  } 
  else if (text === "/budgets") {
    response = getBudgetList();
  }
  else if (text === "/help") {
    response = MESSAGES.help;       
  }
  else if (text.startsWith("/create ")) {
    const parts = text.substring(8).trim().split(" ");
    
    if (parts.length < 2) {
      response = MESSAGES.addBudgetInvalidFormat;
    } else {
      const name = parts[0];
      const amount = parseFloat(parts[1]);
      
      if (isNaN(amount)) {
        response = MESSAGES.addInvalidAmount;
      } else {
        addBudgetEntry(name, amount);
        response = MESSAGES.addBudgetSuccess.replace("{name}", name).replace("{amount}", amount);
      }
    }
  }
  else {
    response = MESSAGES.unknownCommand;
  }
  
  sendMessage(chatId, response);
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
      responseText = MESSAGES.welcome;
    } 
    else if (messageText === "/budgets") {
      responseText = getBudgetList();
    }
    else if (messageText === "/help") {
      responseText = MESSAGES.help;       
    }
    else if (messageText.startsWith("/create ")) {
      const parts = messageText.substring(8).trim().split(" ");
      
      if (parts.length < 2) {
        responseText = MESSAGES.addBudgetInvalidFormat;
      } else {
        const name = parts[0];
        const amount = parseFloat(parts[1]);
        
        if (isNaN(amount)) {
          responseText = MESSAGES.addInvalidAmount;
        } else {
          addBudgetEntry(name, amount);
          responseText = MESSAGES.addBudgetSuccess.replace("{name}", name).replace("{amount}", amount);
        }
      }
    }
    else {
      responseText = MESSAGES.unknownCommand;
    }
    
    // Send response back to Telegram
    sendTelegramMessage(chatId, responseText);
    
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
                         .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in handling message: " + error);
    
    // Try to alert the user, but wrap it so a failed alert doesn't break the return
    try {
      sendTelegramMessage(chatId, "❌ Error: " + error.toString());
    } catch (sendError) {
      Logger.log("Failed to send error message to user: " + sendError);
    }
    
    // FIX: Tell Telegram "OK" so it stops retrying this broken update
    return ContentService.createTextOutput(JSON.stringify({ ok: true, internal_error: true }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Add entry to Google Sheet
 */
function addBudgetEntry(name, amount) {  
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_BUDGET);
  
  // Add new row with data
  sheet.appendRow([name, amount]);
  
  Logger.log(`Added: ${name} - ${amount}`);
}

/**
 * Get all budget entries formatted for Telegram
 */
function getBudgetList() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_BUDGET);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return "📋 No entries yet.";
  }
  
  let message = "📋 Budget Entries:\n\n";
  
  // Skip header row (row 0)
  for (let i = 1; i < data.length; i++) {
    const name = data[i][0];
    const amount = data[i][1];
    if (name && amount) {
      message += `• ${name}: $${amount}\n`;
    }
  }
 
  return message;
}

/**
 * Send message to Telegram
 */

function sendMessage(chatId, text) {
  var url = "https://api.telegram.org/bot" + CONFIG.BOT_TOKEN + "/sendMessage";
  var payload = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  };
  UrlFetchApp.fetch(url, payload);
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
  const token = CONFIG.BOT_TOKEN;
  const deploymentUrl = CONFIG.DEPLOYMENT_URL;
  
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
  const token = CONFIG.BOT_TOKEN;
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
  const token = CONFIG.BOT_TOKEN;
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
  const token = CONFIG.BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/deleteWebhook`;
  
  const response = UrlFetchApp.fetch(url);
  const result = JSON.parse(response.getContentText());
  
  Logger.log("Delete response: " + JSON.stringify(result, null, 2));
  return result;
}
