// Function for HTTP Get requests
function doGet(e) 
{
  // Checks if the request has a parameter named action
  var action = e && e.parameter ? e.parameter.action : null;

  // If it has, returns JSON
  if (action === "getExpiringItems") 
  {
    return ContentService.createTextOutput
    (
      JSON.stringify(getExpiringItems())
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // If no action is specified, Index.html is the web page 
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('ZeroWasteChef')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Function for retrieving email
function getCurrentUser() 
{
  return Session.getActiveUser().getEmail();
}
