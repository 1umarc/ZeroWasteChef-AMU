// Function for retrieving the existing spreadsheet or creates a new one
function getInventorySheet() 
{
  const files = DriveApp.getFilesByName("Inventory");
  let spreadsheet;
  
  if (files.hasNext()) 
  {
    // Use existing Inventory file
    spreadsheet = SpreadsheetApp.open(files.next());
  } 
  else 
  {
    // Create a new Inventory file it does not exist
    spreadsheet = SpreadsheetApp.create("Inventory");
  }

  return spreadsheet;
}

// Function for getting Inventory sheet from the spreadsheet
function getUserSheet() 
{
  const ss = getInventorySheet();
  let sheet = ss.getSheets()[0];

  // If sheet default name, rename
  if (sheet.getName() !== "Inventory") 
  {
    sheet.setName("Inventory");
  } 
  
  // If sheet is empty, adds a header
  if (sheet.getLastRow() === 0) 
  {
    sheet.appendRow(['Item', 'Quantity', 'Expiry Date', 'Added On', 'Status']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#f0f0f0');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(3, 150);
  }
  
  return sheet;
}

// Function for adding new items
function addItem(name, quantity, expiryDate) 
{
  const sheet = getUserSheet();
  const expiry = new Date(expiryDate);
  const status = null;
  
  // Add a new row with the provided details
  sheet.appendRow
  ([
    name, 
    quantity, 
    expiry, 
    new Date(), 
    status
  ]);
  
  colorStatus(sheet);
}

// Function for retrieving items that are either expiring soon / expired
function getExpiringItems() 
{
  const sheet = getUserSheet();
  if (!sheet) return { expiring: [], expired: [] };

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiringItems = [];
  const expiredItems = [];

  // Start from row 2 to skip headers
  for (let i = 1; i < data.length; i++) 
  {
    const row = data[i];

    // Validate expiryDate
    if (row[2] instanceof Date && !isNaN(row[2])) 
    {
      const expiryDate = new Date(row[2]);
      expiryDate.setHours(0, 0, 0, 0);

      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry > 0 && daysUntilExpiry <= 3) 
      {
        // Expiring soon (0 to 4 days left)
        expiringItems.push
        ({
          item: row[0],
          quantity: row[1],
          expiryDate: expiryDate.toLocaleDateString(),
        });
      } 
      else if (daysUntilExpiry <= 0) 
      {
        // Expired items (past expiry date)
        expiredItems.push
        ({
          item: row[0],
          quantity: row[1],
          expiryDate: expiryDate.toLocaleDateString(),
        });
      }
    } 
    else 
    {
      Logger.log("Invalid date in row " + (i + 1) + ": " + row[2]);
    }
  }

  return {expiring: expiringItems, expired: expiredItems};
}

// Function for applying color-coded Status column
function colorStatus(sheet) 
{
  const range = sheet.getRange(2, 5, sheet.getLastRow()-1, 1);
  
  // Highlight expiring items (Yellow)
  const expiringRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(C2<>"",C2<=TODAY()+3)')
    .setBackground('#FFF2CC')
    .setRanges([range])
    .build();

  // Highlight expired items (Red)
  const expiredRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(C2<>"",C2<TODAY())')
    .setBackground('#FFCCCC')
    .setRanges([range])
    .build();
  
  sheet.setConditionalFormatRules([expiredRule, expiringRule]);
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
