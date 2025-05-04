// Function for retrieving the existing spreadsheet or creates a new one
function getInventorySheet() 
{
  const files = DriveApp.getFilesByName("ZeroWasteChef Inventory");
  let spreadsheet;
  
  if (files.hasNext()) 
  {
    // Use existing Inventory file
    spreadsheet = SpreadsheetApp.open(files.next());
  } 
  else 
  {
    // Create a new Inventory file it does not exist
    spreadsheet = SpreadsheetApp.create("ZeroWasteChef Inventory");
  }

  return spreadsheet;
}

// Function for getting Inventory sheet from the spreadsheet
function getUserSheet() 
{
  const ss = getInventorySheet();
  let sheet = ss.getSheets()[0];

  // If sheet default name, rename
  if (sheet.getName() !== "ZeroWasteChef Inventory") 
  {
    sheet.setName("ZeroWasteChef Inventory");
  } 
  
  // If sheet is empty, adds a header
  if (sheet.getLastRow() === 0) 
  {
  sheet.appendRow(['Item', 'Quantity', 'Expiry Date', 'Added On', 'Status', 'Notified Soon', 'Notified Tomorrow']);
  sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#f0f0f0');
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(3, 150);
  }
  
  return sheet;
}


// Reuses the Inventory spreadsheet
function getRatingSheet() {
  const ss = getInventorySheet(); // Make sure this function exists and returns the correct Spreadsheet
  let sheet = ss.getSheetByName("Recipe Ratings");

  if (!sheet) {
    sheet = ss.insertSheet("Recipe Ratings");
    sheet.appendRow(["Recipe Name", "Rating (1-5)"]);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#f0f0f0');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

// Appends the rating to the sheet
function rateRecipe(recipeName, rating) {
  const sheet = getRatingSheet();

  if (rating < 1 || rating > 5) {
    return "❌ Rating must be between 1 and 5.";
  }

  sheet.appendRow([recipeName.trim(), rating]);
  return "✅ Rating submitted successfully!";
}

// Test function to simulate rating a recipe
function testRateRecipe() {
  const testName = "Pasta Primavera";
  const testRating = 4;
  const result = rateRecipe(testName, testRating);
  Logger.log(result);
}

// Function for adding new items (Simplified)
function addItem(name, quantity, expiryDateString) {
  const sheet = getUserSheet(); // Assumes this returns the Sheet object

  // 1. Parse the incoming date string 'YYYY-MM-DD'
  const parts = expiryDateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const day = parseInt(parts[2], 10);

  // 2. Create a new Date object, explicitly setting time to 00:00:00
  const expiryDateObject = new Date(year, month, day, 0, 0, 0, 0);

  const addedOnDate = new Date(); // Get current time for "Added On"
  const status = null; // Status column value

  // Add a new row with the provided details
  sheet.appendRow([
    name,
    quantity,
    expiryDateObject, // Use the date object with time set to midnight
    addedOnDate,
    status
  ]);

  colorStatus(sheet); // Call your existing coloring function
}

// Function for retrieving items that are either expiring soon / expired
function getExpiringItems()
{
  const sheet = getUserSheet();
  if (!sheet) return { expiring: [], expired: [], totalCount: 0 };

  const data = sheet.getDataRange().getValues();
  const totalItemsCount = data.length > 1 ? data.length - 1 : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiringItems = [];
  const expiredItems = [];

  for (let i = 1; i < data.length; i++)
  {
    const row = data[i];
    const item = row[0];
    const quantity = row[1];
    const expiryDateValue = row[2];

    if (!item || !expiryDateValue) {
      continue;
    }

    let expiryDate;

    if (expiryDateValue instanceof Date && !isNaN(expiryDateValue.getTime())) {
        expiryDate = new Date(expiryDateValue);
    } else if (typeof expiryDateValue === 'string') {
        const parts = expiryDateValue.split('/');
        if (parts.length === 3) {
             expiryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
             if (isNaN(expiryDate.getTime())) {
                 expiryDate = null;
             }
        } else {
            expiryDate = new Date(expiryDateValue);
            if (isNaN(expiryDate.getTime())) {
                 expiryDate = null;
            }
        }
    } else {
        expiryDate = null;
    }

    if (expiryDate !== null)
    {
      expiryDate.setHours(0, 0, 0, 0);
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysUntilExpiry = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      const itemData = {
        item: item,
        quantity: quantity,
        expiryDate: expiryDate.toLocaleDateString('en-GB'),
      };

      if (daysUntilExpiry >= 0 && daysUntilExpiry <= 3)
      {
        expiringItems.push(itemData);
      }
      else if (daysUntilExpiry < 0)
      {
        expiredItems.push(itemData);
      }
    }
  }

  return {
    expiring: expiringItems,
    expired: expiredItems,
    totalCount: totalItemsCount,
  };
}

// Function for applying color-coded Status column
function colorStatus(sheet) {
  const rules = [];

  const lastRow = sheet.getLastRow();

  // Highlight 'Status' column (Column E) rules
  const statusRange = sheet.getRange(2, 5, lastRow - 1, 1);
  const expiringRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(C2<>"", C2<=TODAY()+3)')
    .setBackground('#FFF2CC') // Light yellow
    .setRanges([statusRange])
    .build();

  const expiredRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(C2<>"", C2<TODAY())')
    .setBackground('#FFCCCC') // Light red
    .setRanges([statusRange])
    .build();

  rules.push(expiredRule, expiringRule);

  // Highlight 'Notified Soon' column (Column F) yellow if TRUE
  const notifiedSoonRange = sheet.getRange(2, 6, lastRow - 1, 1);
  const soonRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=F2=TRUE')
    .setBackground('#FFF2CC') // Light yellow
    .setRanges([notifiedSoonRange])
    .build();
  rules.push(soonRule);

  // Highlight 'Notified Tomorrow' column (Column G) red if TRUE
  const notifiedTomorrowRange = sheet.getRange(2, 7, lastRow - 1, 1);
  const tomorrowRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=G2=TRUE')
    .setBackground('#FFCCCC') // Light red
    .setRanges([notifiedTomorrowRange])
    .build();
  rules.push(tomorrowRule);

  // Apply all rules
  sheet.setConditionalFormatRules(rules);
}

// Function for deleting item
function deleteItem(itemName) 
{
  try 
  {
    const sheet = getUserSheet();
    const data = sheet.getDataRange().getValues();

    // Find row with matching item name
    for (let i = 1; i < data.length; i++) 
    {
      if (data[i][0] === itemName) 
      { 
        // Delete i + 1 because sheet rows are 1-indexed
        sheet.deleteRow(i + 1); 
        return "Item deleted!";
      }
    }
    return "Item not found.";
  } 
  catch (error) 
  {
    Logger.log("Error deleting item: " + error);
    return "Error deleting item: " + error;
  }
}

// Function for deleting all items
function deleteAllItems() 
{
  try 
  {
    const sheet = getUserSheet();

    // Clear all rows after header
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    return "All items deleted!";
  } 
  catch (error) 
  {
    Logger.log("Error deleting all items: " + error);
    return "Error deleting all items: " + error;
  }
}

// Function for retrieving all items
function getAllItems() 
{
  try 
  {
    const sheet = getUserSheet();
    const data = sheet.getDataRange().getValues();
    const items = [];

    // Start from row 2 to skip header
    for (let i = 1; i < data.length; i++) 
    {
      const row = data[i];
      items.push
      ({
        item: row[0],
        quantity: row[1],
        expiryDate: row[2] instanceof Date ? row[2].toLocaleDateString() : 'Invalid Date' // Handle potential invalid dates
      });
    }

    return items;
  } 
  catch (error) 
  {
    Logger.log("Error getting all items: " + error);
    return [];
  }
}

// Function to run checkAndNotifyExpiringItems automatically
function createTimeDrivenTrigger() {
  // Creates a trigger to run the checkAndNotifyExpiringItems function daily at midnight
  ScriptApp.newTrigger('checkAndNotifyExpiringItems')
           .timeBased()
           .everyDays(1)  // Run every day
           .atHour(0)      // Set to run at midnight
           .create();
}

function checkAndNotifyExpiringItems() {
  const sheet = getUserSheet();
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const soonItems = [];
  const tomorrowItems = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const expiryDate = new Date(row[2]);
    const notifiedSoon = row[5];
    const notifiedTomorrow = row[6];

    if (expiryDate instanceof Date && !isNaN(expiryDate)) {
      expiryDate.setHours(0, 0, 0, 0);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 3 && daysUntilExpiry > 1 && !notifiedSoon) {
        soonItems.push(row[0]);
        sheet.getRange(i + 1, 6).setValue(true);
      } else if (daysUntilExpiry === 1 && !notifiedTomorrow) {
        tomorrowItems.push(row[0]);
        sheet.getRange(i + 1, 7).setValue(true);
      }
    }
  }

  var userEmail = Session.getActiveUser().getEmail(); // Dynamically fetch the user's email

  // Send "expiring soon" email if there are items
  if (soonItems.length > 0) {
    MailApp.sendEmail({
      to: userEmail,
      subject: "🔔 Items Expiring Soon (<4 days)",
      htmlBody: `
        <div style="font-family:Roboto,Arial,sans-serif;color:#202124;">
          <h2 style="color:#188038;">🔔 Heads-up! These Items Are Expiring Soon</h2>
          <p>Hello,</p>
          <p>The following items are expiring in less than 4 days:</p>
          <ul>
            ${soonItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
          <p>Please use them before they expire to reduce food waste. 🌍</p>
          <br>
          <p style="color:#5f6368;">– Your <strong>ZeroWasteChef</strong> Assistant</p>
        </div>
      `
    });
  }

  // Send "expiring tomorrow" email if there are items
  if (tomorrowItems.length > 0) {
    MailApp.sendEmail({
      to: userEmail,
      subject: "⚠️ Items Expiring Tomorrow!",
      htmlBody: `
        <div style="font-family:Roboto,Arial,sans-serif;color:#202124;">
          <h2 style="color:#d93025;">⚠️ Urgent: Use These Items Today!</h2>
          <p>Hello,</p>
          <p>The following items will expire <strong>tomorrow</strong>:</p>
          <ul>
            ${tomorrowItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
          <p>Please consider using them today to avoid food waste. 💡</p>
          <br>
          <p style="color:#5f6368;">– Your <strong>ZeroWasteChef</strong> Assistant</p>
        </div>
      `
    });
  }
}

// Function for retrieving saved recipes
function getRecipeHistory() 
{
  try 
  {
    // Search for files with the pattern "ZeroWasteChef_Recipe_xxx"
    const filePattern = "title contains 'ZeroWasteChef_Recipe_'";
    const files = DriveApp.searchFiles(filePattern);
    const recipes = [];
    
    // Collect all matching files
    while (files.hasNext()) {
      const file = files.next();
      
      // Extract the recipe name from the file title
      const fileName = file.getName();
      const recipeName = fileName.replace("ZeroWasteChef_Recipe_", "");
      
      recipes.push
      ({
        id: file.getId(),
        title: recipeName,
        url: file.getUrl(),
        lastModified: formatDate(file.getLastUpdated())
      });
    }
    
    return recipes;
  } catch (error) {
    Logger.log("Error getting recipe history: " + error);
    return [];
  }
}

// Helper function to format date
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "MMM dd, yyyy");
}
