// Constants for Gemini API
const APIKey = PropertiesService.getScriptProperties().getProperty('APIKey'); // Script property
// Use a recent, capable vision model (Flash is good for speed/cost, Pro might be slightly better but slower/costlier)
const VISION_MODEL_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const BaseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
// Use a suitable text model for recipe generation
const TEXT_MODEL_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'; // Flash can work here too

// --- Preference Management Functions ---
/**
 * Saves the user's recipe preference to UserProperties.
 * @param {string} preference The user's preference text.
 */
function saveUserPreference(preference) {
  try {
    PropertiesService.getUserProperties().setProperty('userRecipePreference', preference || '');
    Logger.log(`Preference saved for user: ${preference}`);
  } catch (e) {
    Logger.log(`Error saving user preference: ${e}`);
  }
}

/**
 * Retrieves the user's saved recipe preference from UserProperties.
 * @return {string | null} The saved preference string, or null.
 */
function getUserPreference() {
  try {
    return PropertiesService.getUserProperties().getProperty('userRecipePreference');
  } catch (e) {
    Logger.log(`Error retrieving user preference: ${e}`);
    return null;
  }
}

/**
 * Called on page load. Ensures user sheet exists (via getUserSheet)
 * and returns the saved preference.
 * Assumes getUserSheet() is defined elsewhere (e.g., SheetsService.gs or Code.gs)
 * @return {string | null} The user's saved preference.
 */
function initializeUserData() {
  try {
    // Ensure the sheet exists for the user. Handle potential errors if getUserSheet can fail.
    const sheet = getUserSheet();
    if (!sheet) {
        Logger.log("User sheet could not be accessed or created during initialization.");
        // Depending on getUserSheet implementation, this might already throw an error
    }
  } catch (e) {
     Logger.log(`Error during initial sheet check in initializeUserData: ${e}`);
     // Decide if we should throw this error or just log it and proceed
     // throw new Error("Could not initialize user data sheet.");
  }
  // Always try to return the preference, even if sheet check had issues
  return getUserPreference();
}


// --- Recipe Suggestion Functions ---
/**
 * Entry point for mobile version
 * Saves the provided preference and then gets meal suggestions as text.
 * @param {string} preference The preference text from the user input field.
 * @return {string} The generated meal suggestions or error message.
 */
function savePreferenceAndGetSuggestions(preference, uiType) 
{
  saveUserPreference(preference); // Save the latest preference first
  if (uiType === 'mobile') 
  {
        getMealSuggestionsInternalMobile(); 
      } 
  else {
  return getMealSuggestionsInternalDesktop(); // Then generate suggestions
  }
}

/**
 * Internal function to generate meal suggestions using inventory and saved preference.
 * @return {string} The generated meal suggestions or throws an error.
 */
function getMealSuggestionsInternalMobile() {
  if (!APIKey) {
      Logger.log("Error: API Key script property not set.");
      throw new Error("API Key not configured on server.");
  }

  let sheet;
  try {
    sheet = getUserSheet();
    if (!sheet) throw new Error("User sheet unavailable."); // Check if getUserSheet returns null/undefined
  } catch (e) {
     Logger.log(`Error accessing user sheet for suggestions: ${e}`);
     throw new Error(`Could not access inventory data: ${e.message}`);
  }

  try {
    const dataRange = sheet.getDataRange();
    const data = dataRange.getValues();

    if (data.length <= 1) {
      return "⚠️ Your inventory is empty. Add food items to get suggestions!"; // Return message, not error
    }

    // Format inventory data (skip header row[0])
    const formatted = data.slice(1).map(row => {
        // Basic validation of row data before formatting
        const item = row[0] || 'Unknown Item';
        const quantity = row[1] || 'N/A';
        const expiry = row[2] || 'N/A';
        return `- ${item} (${quantity}), Expires: ${expiry}`;
    }).join('\n');

    const userPreference = getUserPreference(); // Get saved preference

    // Construct Prompt for Gemini API (Text Model)
    let prompt = `You are the ZeroWasteChef assistant. Based on the following inventory items (prioritizing expired and expiring first), suggest 2 distinct recipes.\n\n` +
                 `Current Inventory:\n${formatted}\n\n`;

    if (userPreference && userPreference.trim() !== '') {
      prompt += `User Preference: Please tailor the recipes towards "${userPreference}".\n\n`;
    } else {
      prompt += `User Preference: None specified. Provide general, easy-to-make recipes.\n\n`;
    }

    // Detailed prompt instructions (Keep as before)
    prompt += "For each recipe, provide the following details clearly:\n\n" +
               "RECIPE 1: [CONCISE AND APPEALING NAME IN UPPERCASE]\n" +
               "RECIPE 2: [CONCISE AND APPEALING NAME IN UPPERCASE]\n\n" +
               "For EACH recipe:\n" +
               "1. Ingredients:\n" +
               "   * List all necessary ingredients (from inventory and additional).\n" +
               "   * Mark inventory items clearly, indicating if they are '(expiring)' or '(expired)'.\n" +
               "   * Specify exact quantities (e.g., '100g Chicken Breast (expiring)', '1 tbsp olive oil').\n" +
               "   * Ensure quantities used respect inventory amounts.\n\n" +
               "2. Instructions:\n" +
               "   * Provide clear, numbered steps.\n\n" +
               "3. Prep Time & Cook Time:\n" +
               "   * Estimate times (e.g., 'Prep Time: 15 mins, Cook Time: 20 mins').\n\n" +
               "4. Dietary Considerations (Optional):\n" +
               "   * Note suitability (e.g., 'Vegetarian') or simple adaptations.\n\n" +
               "### Important Guidelines:\n" +
               "* Prioritize using EXPIRED and EXPIRING items.\n" +
               "* Maximize inventory use.\n" +
               "* Prefer recipes needing FEW extra common staples.\n" +
               "* Aim for total time under 45-60 minutes.\n" +
               "* Do not use bold formatting.\n" +
               "* Start the response directly with 'RECIPE 1: ...'. No introductory phrases.";


    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2000 // Allow ample space for two recipes
      },
       safetySettings: [ // Consistent safety settings
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
       ]
    };

    const options = {
        method: 'POST',
        contentType: 'application/json',
        muteHttpExceptions: true, // Handle HTTP errors manually
        payload: JSON.stringify(payload)
    };

    Logger.log("Sending recipe suggestion request to Gemini Text API.");
    const response = UrlFetchApp.fetch(`${TEXT_MODEL_ENDPOINT}?key=${APIKey}`, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    // --- Response Handling ---
    if (responseCode === 200) {
        const jsonResponse = JSON.parse(responseBody);
        // Check for valid response structure
        if (jsonResponse.candidates && jsonResponse.candidates.length > 0 &&
            jsonResponse.candidates[0].content && jsonResponse.candidates[0].content.parts &&
            jsonResponse.candidates[0].content.parts.length > 0 && jsonResponse.candidates[0].content.parts[0].text) {
             Logger.log("Successfully received recipe suggestions.");
             return jsonResponse.candidates[0].content.parts[0].text.trim(); // Return the suggestions
        }
        // Check for safety blocks
        else if (jsonResponse.promptFeedback && jsonResponse.promptFeedback.blockReason) {
             const blockReason = jsonResponse.promptFeedback.blockReason;
             Logger.log(`Recipe generation blocked by safety settings. Reason: ${blockReason}`);
             throw new Error(`Suggestions blocked due to safety settings (${blockReason}).`);
        }
        // Check for other finish reasons (like MAX_TOKENS)
        else if (jsonResponse.candidates && jsonResponse.candidates[0] && jsonResponse.candidates[0].finishReason && jsonResponse.candidates[0].finishReason !== 'STOP') {
             const finishReason = jsonResponse.candidates[0].finishReason;
             Logger.log(`Recipe generation finished unexpectedly: ${finishReason}`);
             throw new Error(`Could not generate full suggestions (${finishReason}).`);
        }
        // Unexpected structure
        else {
             Logger.log(`Unexpected Gemini response structure for suggestions: ${responseBody}`);
             throw new Error("AI response format was unexpected (suggestions).");
        }
    } else {
        // Handle HTTP errors from API
        Logger.log(`Error fetching suggestions: ${responseCode} - ${responseBody}`);
        let errorMsg = `Failed to get suggestions (API Error ${responseCode}).`;
         try { // Try to parse Gemini error message
             const errorJson = JSON.parse(responseBody);
             if (errorJson.error && errorJson.error.message) {
                 errorMsg += ` Details: ${errorJson.error.message}`;
             }
         } catch(e) { /* Ignore JSON parsing error */ }
        throw new Error(errorMsg);
    }
  } catch (error) {
    // Catch any errors from sheet access, API call, or response parsing
    Logger.log(`Error in getMealSuggestionsInternal: ${error} \n Stack: ${error.stack}`);
    // Re-throw the error so frontend's withFailureHandler catches it
    throw new Error(`Server error getting suggestions: ${error.message}`);
  }
}

// Function for sending all data from Inventory sheet to Gemini API for meal suggestions
function getMealSuggestionsInternalDesktop() 
{
  try 
  {
    // Retrieve all data from sheet
    const sheet = getUserSheet();
    const dataRange = sheet.getDataRange();
    const data = dataRange.getValues();

    // If no items in sheet or only header
    if (data.length <= 1) 
    {
      return JSON.stringify({
        error: true,
        message: "⚠️ The sheet is empty. Add food items to get suggestions!"
      });
    }

    const userPreference = getUserPreference(); // Get saved preference

    // Convert data array to formatted string
    const formatted = data.map(row => row.join(', ')).join('\n');

    // Construct Prompt for Gemini API
    let prompt = `Create 2 delicious recipes that prioritize the expired and expiring ingredients from the given inventory data. Return your response in a structured JSON format ONLY with no additional text. Please tailor the recipes towards "${userPreference}", if the value is not null.

    Food inventory data:
    ${formatted}

    Format your response as a valid JSON object with the following structure:
    {
      "recipes": [
        {
          "title": "Recipe Title in Title Case",
          "difficulty": "Easy|Medium|Hard",
          "prepTime": "XX mins",
          "cookTime": "XX mins", 
          "ingredients": [
            {"name": "ingredient1", "quantity": "amount", "expiring": true|false},
            {"name": "ingredient2", "quantity": "amount", "expiring": false}
          ],
          "instructions": ["Step 1 description", "Step 2 description"],
          "dietaryInfo": ["Vegetarian", "Gluten-Free", etc.],
          "imagePrompt": "a short description for generating an image of this dish",
          "nutritionSource": "URL to a reputable source for nutritional information about this dish"
        },
        {
          // Second recipe with same structure
        }
      ]
    }

    ### Rules:
    1. For "image", use one of these keywords that best describes the dish: "appetizing", "hearty", "fresh", "comforting", "spicy", "sweet", "healthy", "indulgent", "light", "savory"
    2. For "difficulty", use "Easy", "Medium", or "Hard" based on cooking skill required
    3. For ingredients "status", mark matching ingredients from the list as "expiring" or "expired". Additional ingredients should be "normal"
    4. For "nutritionSource", provide a URL search at https://www.nutritionvalue.org/search.php?food_query= on the recipe
    5. Prioritize recipes that:
      - Use the largest number of expiring/expired ingredients
      - Require the fewest additional ingredients
      - Are quick to prepare and cook (total time under 45 minutes if possible)
      - Are simple and suitable for a home cook
      - Minimize food waste
    6. Ensure the response is properly formatted as valid JSON that can be parsed
    7. DO NOT include any explanations or text outside the JSON object`;
  
    // Payload made for API request
    const payload = 
    {
      contents: 
      [{
        parts: [{ text: prompt }]
      }],
      generationConfig: 
      {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1500
      }
    };

    // Make the API request
    const response = UrlFetchApp.fetch
    (
      `${BaseURL}?key=${APIKey}`,
      {
        method: 'POST',
        contentType: 'application/json',
        muteHttpExceptions: true,
        payload: JSON.stringify(payload)
      }
    );

    // Parse the API response
    const jsonResponse = JSON.parse(response.getContentText());
    const recipeText = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text || null;
    
    if (!recipeText) {
      return JSON.stringify({
        error: true,
        message: "No suggestions generated."
      });
    }
    
    // Extract JSON from the response (in case there's any text before or after)
    try {
      const jsonMatch = recipeText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Try to parse the JSON to validate it
        const recipesJson = JSON.parse(jsonMatch[0]);
        return JSON.stringify(recipesJson);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      // If JSON parsing fails, return the original text as a fallback
      return JSON.stringify({
        error: true,
        message: "Invalid response format. Please try again.",
        rawResponse: recipeText
      });
    }
  } 
  catch (error) 
  {
    console.error("Error:", error);
    return JSON.stringify({
      error: true,
      message: "🚫 Failed to get suggestions. Please try again later!"
    });
  }
}


// --- Image Identification Function (Item Name) ---
/**
 * Analyzes an image using Gemini Vision and returns the identified item name.
 * @param {string} imageBase64 The Base64 encoded image data (without prefix).
 * @param {string} mimeType The MIME type of the image (e.g., 'image/jpeg').
 * @return {string} The identified item name or throws an error.
 */
function identifyItemFromImage(imageBase64, mimeType) {
  if (!APIKey) throw new Error("Server configuration incomplete (Missing API Key).");
  if (!imageBase64 || !mimeType) throw new Error("No image data received from client.");
  if (!mimeType.startsWith('image/')) throw new Error("Invalid image file type provided.");

  const prompt = "Identify the single, primary food item visible in this image. Respond with only the most likely name, including brand name (if clearly visible and relevant), the specific food name, and type if applicable (e.g., 'Heinz Baked Beans', 'Chiquita Banana', 'Organic Whole Milk', 'Red Delicious Apple'). Capitalize the first letter. If multiple distinct items are equally prominent, pick one. If it's not clearly a food item or is unidentifiable, respond with 'Unknown'.";

  const payload = {
    "contents": [{ "parts": [ { "text": prompt }, { "inline_data": { "mime_type": mimeType, "data": imageBase64 } } ] }],
    "generationConfig": { "temperature": 0.3, "maxOutputTokens": 50, "topP": 0.95 },
    "safetySettings": [ // Consistent Safety Settings
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
    ]
  };
  const options = { 'method': 'post', 'contentType': 'application/json', 'payload': JSON.stringify(payload), 'muteHttpExceptions': true };

  try {
    Logger.log(`Sending item name identification request. MimeType: ${mimeType}`);
    const response = UrlFetchApp.fetch(`${VISION_MODEL_ENDPOINT}?key=${APIKey}`, options);
    const responseCode = response.getResponseCode(); const responseBody = response.getContentText();
    Logger.log(`Item Name Response Code: ${responseCode}`);

    if (responseCode === 200) {
      const jsonResponse = JSON.parse(responseBody);
      if (jsonResponse.candidates && jsonResponse.candidates.length > 0 && jsonResponse.candidates[0].content && jsonResponse.candidates[0].content.parts && jsonResponse.candidates[0].content.parts.length > 0 && jsonResponse.candidates[0].content.parts[0].text) {
        let identifiedText = jsonResponse.candidates[0].content.parts[0].text.trim(); Logger.log(`Item Name raw response: ${identifiedText}`);
        if (identifiedText.toLowerCase() === 'unknown') throw new Error("Could not identify a food item in the image.");
        identifiedText = identifiedText.replace(/["']/g, ""); Logger.log(`Identified item name as: ${identifiedText}`); return identifiedText;
      } else if (jsonResponse.promptFeedback && jsonResponse.promptFeedback.blockReason) {
         const blockReason = jsonResponse.promptFeedback.blockReason; Logger.log(`Item name identification blocked. Reason: ${blockReason}`); throw new Error(`Request blocked (item name) due to safety settings (${blockReason}).`);
      } else if (jsonResponse.candidates && jsonResponse.candidates[0] && jsonResponse.candidates[0].finishReason && jsonResponse.candidates[0].finishReason !== 'STOP') {
          Logger.log(`Item name identification finished unexpectedly: ${jsonResponse.candidates[0].finishReason}`); throw new Error(`AI analysis finished unexpectedly (item name: ${jsonResponse.candidates[0].finishReason}).`);
      } else { Logger.log(`Could not find text in item name response: ${responseBody}`); throw new Error("AI response format was unexpected (item name)."); }
    } else {
      Logger.log(`Error calling Vision API (item name). Status: ${responseCode}. Body: ${responseBody}`); let errorMsg = `Failed to analyze image (item name - API Status ${responseCode}).`; try { const errorJson = JSON.parse(responseBody); if (errorJson.error && errorJson.error.message) errorMsg += ` Details: ${errorJson.error.message}`; } catch (e) { /* ignore */ } throw new Error(errorMsg);
    }
  } catch (error) { Logger.log(`Critical error during item name identification: ${error}`); throw new Error(`Server error during item name analysis: ${error.message}`); }
}


// --- Function to Identify Quantity from Image ---
/**
 * Analyzes an image using Gemini Vision to find the quantity.
 * @param {string} imageBase64 Base64 image data.
 * @param {string} mimeType Image MIME type.
 * @return {string} Identified quantity string or throws an error.
 */
function identifyQuantityFromImage(imageBase64, mimeType) {
  if (!APIKey) throw new Error("Server configuration incomplete (Missing API Key).");
  if (!imageBase64 || !mimeType) throw new Error("No image data received from client.");
  if (!mimeType.startsWith('image/')) throw new Error("Invalid image file type provided.");

  const prompt = "Analyze the image to find the quantity, weight, or count of the main item. Respond with *only* the numerical value and its unit (e.g., '1 litre', '500g', '6 slices', '2 lbs', '750 ml', '3 items'). Be precise. If no quantity is clearly visible or applicable, respond with 'Unknown'.";

  const payload = {
    "contents": [{ "parts": [ { "text": prompt }, { "inline_data": { "mime_type": mimeType, "data": imageBase64 } } ] }],
    "generationConfig": { "temperature": 0.2, "maxOutputTokens": 30, "topP": 0.98 }, // Low temp for factual extraction
    "safetySettings": [ // Consistent Safety Settings
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
    ]
  };
  const options = { 'method': 'post', 'contentType': 'application/json', 'payload': JSON.stringify(payload), 'muteHttpExceptions': true };

  try {
    Logger.log(`Sending quantity identification request. MimeType: ${mimeType}`);
    const response = UrlFetchApp.fetch(`${VISION_MODEL_ENDPOINT}?key=${APIKey}`, options);
    const responseCode = response.getResponseCode(); const responseBody = response.getContentText();
    Logger.log(`Quantity Response Code: ${responseCode}`);

    if (responseCode === 200) {
        const jsonResponse = JSON.parse(responseBody);
        if (jsonResponse.candidates && jsonResponse.candidates.length > 0 && jsonResponse.candidates[0].content && jsonResponse.candidates[0].content.parts && jsonResponse.candidates[0].content.parts.length > 0 && jsonResponse.candidates[0].content.parts[0].text) {
            let identifiedText = jsonResponse.candidates[0].content.parts[0].text.trim(); Logger.log(`Quantity raw response: ${identifiedText}`);
            if (identifiedText.toLowerCase() === 'unknown') throw new Error("Could not identify quantity in the image.");
            identifiedText = identifiedText.replace(/["']/g, ""); // Remove quotes
            Logger.log(`Identified quantity as: ${identifiedText}`); return identifiedText;
        } else if (jsonResponse.promptFeedback && jsonResponse.promptFeedback.blockReason) {
            const blockReason = jsonResponse.promptFeedback.blockReason; Logger.log(`Quantity identification blocked. Reason: ${blockReason}`); throw new Error(`Request blocked (quantity) due to safety settings (${blockReason}).`);
        } else if (jsonResponse.candidates && jsonResponse.candidates[0] && jsonResponse.candidates[0].finishReason && jsonResponse.candidates[0].finishReason !== 'STOP') {
            Logger.log(`Quantity identification finished unexpectedly: ${jsonResponse.candidates[0].finishReason}`); throw new Error(`AI analysis finished unexpectedly (quantity: ${jsonResponse.candidates[0].finishReason}).`);
        } else { Logger.log(`Could not find text in quantity response: ${responseBody}`); throw new Error("AI response format was unexpected (quantity)."); }
    } else {
        Logger.log(`Error calling Vision API (quantity). Status: ${responseCode}. Body: ${responseBody}`); let errorMsg = `Failed to analyze image (quantity - API Status ${responseCode}).`; try { const errorJson = JSON.parse(responseBody); if (errorJson.error && errorJson.error.message) errorMsg += ` Details: ${errorJson.error.message}`; } catch (e) { /* ignore */ } throw new Error(errorMsg);
    }
  } catch (error) { Logger.log(`Critical error during quantity identification: ${error}`); throw new Error(`Server error during quantity analysis: ${error.message}`); }
}


// --- Function to Identify Expiry Date from Image ---
/**
 * Analyzes an image using Gemini Vision to find the expiry date.
 * @param {string} imageBase64 Base64 image data.
 * @param {string} mimeType Image MIME type.
 * @return {string} Identified date string (YYYY-MM-DD) or throws an error.
 */
function identifyExpiryDateFromImage(imageBase64, mimeType) {
  if (!APIKey) throw new Error("Server configuration incomplete (Missing API Key).");
  if (!imageBase64 || !mimeType) throw new Error("No image data received from client.");
  if (!mimeType.startsWith('image/')) throw new Error("Invalid image file type provided.");

  // Prompt Gemini to find *any* date format and specify the output format
  const prompt = "Analyze the image to find the expiry date (may be labeled 'EXP', 'Use By', 'Best Before', 'BB')(if 2 dates are found next to each other, always take the later date as the other date would be the manufacturing date). Respond with *only* the date formatted as YYYY-MM-DD. If the year is ambiguous (e.g., only DD/MM shown), infer the most likely future year (current year or next year). If no date is found, respond with 'Unknown'.";

  const payload = {
    "contents": [{ "parts": [ { "text": prompt }, { "inline_data": { "mime_type": mimeType, "data": imageBase64 } } ] }],
    "generationConfig": { "temperature": 0.1, "maxOutputTokens": 20, "topP": 0.99 }, // Very low temp for date format
    "safetySettings": [ // Consistent Safety Settings
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }, { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
    ]
  };
  const options = { 'method': 'post', 'contentType': 'application/json', 'payload': JSON.stringify(payload), 'muteHttpExceptions': true };

  try {
    Logger.log(`Sending expiry date identification request. MimeType: ${mimeType}`);
    const response = UrlFetchApp.fetch(`${VISION_MODEL_ENDPOINT}?key=${APIKey}`, options);
    const responseCode = response.getResponseCode(); const responseBody = response.getContentText();
    Logger.log(`Expiry Date Response Code: ${responseCode}`);

    if (responseCode === 200) {
        const jsonResponse = JSON.parse(responseBody);
        if (jsonResponse.candidates && jsonResponse.candidates.length > 0 && jsonResponse.candidates[0].content && jsonResponse.candidates[0].content.parts && jsonResponse.candidates[0].content.parts.length > 0 && jsonResponse.candidates[0].content.parts[0].text) {
            let identifiedText = jsonResponse.candidates[0].content.parts[0].text.trim(); Logger.log(`Expiry Date raw response: ${identifiedText}`);
            if (identifiedText.toLowerCase() === 'unknown') throw new Error("Could not identify expiry date in the image.");
            identifiedText = identifiedText.replace(/["']/g, ""); // Remove quotes

            // Basic validation for YYYY-MM-DD format before returning
            if (/^\d{4}-\d{2}-\d{2}$/.test(identifiedText)) {
                 Logger.log(`Identified expiry date as: ${identifiedText}`);
                 return identifiedText;
            } else {
                 Logger.log(`Gemini returned date in unexpected format: ${identifiedText}`);
                 // Throw an error indicating format issue, let frontend show the raw result perhaps
                 throw new Error(`AI returned date '${identifiedText}', requires YYYY-MM-DD format.`);
            }
        } else if (jsonResponse.promptFeedback && jsonResponse.promptFeedback.blockReason) {
            const blockReason = jsonResponse.promptFeedback.blockReason; Logger.log(`Expiry date identification blocked. Reason: ${blockReason}`); throw new Error(`Request blocked (expiry) due to safety settings (${blockReason}).`);
        } else if (jsonResponse.candidates && jsonResponse.candidates[0] && jsonResponse.candidates[0].finishReason && jsonResponse.candidates[0].finishReason !== 'STOP') {
            Logger.log(`Expiry date identification finished unexpectedly: ${jsonResponse.candidates[0].finishReason}`); throw new Error(`AI analysis finished unexpectedly (expiry: ${jsonResponse.candidates[0].finishReason}).`);
        } else { Logger.log(`Could not find text in expiry date response: ${responseBody}`); throw new Error("AI response format was unexpected (expiry)."); }
    } else {
        Logger.log(`Error calling Vision API (expiry). Status: ${responseCode}. Body: ${responseBody}`); let errorMsg = `Failed to analyze image (expiry - API Status ${responseCode}).`; try { const errorJson = JSON.parse(responseBody); if (errorJson.error && errorJson.error.message) errorMsg += ` Details: ${errorJson.error.message}`; } catch (e) { /* ignore */ } throw new Error(errorMsg);
    }
  } catch (error) { Logger.log(`Critical error during expiry date identification: ${error}`); throw new Error(`Server error during expiry date analysis: ${error.message}`); }
}

// Function to record recipe ratings and get Gemini's feedback
function recordRecipeRating(recipeTitle, rating) {
  try {
    // Get or create ratings sheet
    let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    //let ratingsSheet = spreadsheet.getSheetByName("RecipeRatings");
    
    //if (!ratingsSheet) {
    //  ratingsSheet = spreadsheet.insertSheet("RecipeRatings");
    //  ratingsSheet.appendRow(["Recipe Title", "Rating", "Timestamp", "Feedback"]);
    //}
    
    // Create a personalized prompt for Gemini based on the rating
    let tone = "";
    if (rating >= 4) {
      tone = "excited and encouraging";
    } else if (rating === 3) {
      tone = "optimistic";
    } else {
      tone = "constructive and positive";
    }
    
    // Construct feedback request
    const feedbackPrompt = `The user has rated the recipe "${recipeTitle}" ${rating} out of 5 stars.
    
    Please provide a single short, fun, conversational response (maximum 40 characters) in a ${tone} tone that acknowledges their rating.
    
    Examples:
    - "Wow! Glad you loved it! 🔥"
    - "Thanks for your feedback! 👨‍🍳"
    - "We'll keep improving! 🌱"
    
    Your response should be friendly, brief, and have personality. Return ONLY the response with no extra text.`;
    
    // Payload for API request
    const payload = {
      contents: [{
        parts: [{ text: feedbackPrompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 50
      }
    };
    
    // Make API request and wait for response
    const response = UrlFetchApp.fetch(
      `${BaseURL}?key=${APIKey}`,
      {
        method: 'POST',
        contentType: 'application/json',
        muteHttpExceptions: true,
        payload: JSON.stringify(payload)
      }
    );
    
    // Parse the feedback response
    const jsonResponse = JSON.parse(response.getContentText());
    const feedback = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text.trim() || "Thanks for your rating!";
    
    // Add the new rating with feedback
    //ratingsSheet.appendRow([
    //  recipeTitle,
    //  rating,
    //  new Date(),
    //  feedback
    //]);
    
    return feedback;
  } catch (error) {
    console.error("Error recording rating:", error);
    return "Thanks for your rating!";
  }
}
