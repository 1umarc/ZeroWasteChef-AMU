// Constants for Gemini API
const APIKey = PropertiesService.getScriptProperties().getProperty('APIKey');
const BaseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Function for sending all data from Inventory sheet to Gemini API for meal suggestions
function getMealSuggestions() 
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
      return "⚠️ The sheet is empty. Add food items to get suggestions!";
    }

    // Convert data array to formatted string
    const formatted = data.map(row => row.join(', ')).join('\n');

    // Construct Prompt for Gemini API
    const prompt = `Suggest 2 recipes that prioritizes the expired and expiring ingredients:\n\n${formatted}\n\n` +
               "For each recipe, provide the following details:\n\n" +
               "1. **Recipe Name:** A concise and appealing name (ensure the title is in UPPERCASE and comes after title RECIPE 1 or RECIPE 2).\n\n" +
               "2. **Ingredients:**\n" +
               "   * List all ingredients, including those from the provided list and any additional ingredients needed.\n" +
               "   * (ensure the quantity used from the provided list matches the quantity stated and uses the same measurement format).\n" +
               "   * Specify quantities for each ingredient (e.g., '1 tbsp olive oil', '2 cloves garlic, minced').\n" +
               "   * Clearly indicate which ingredients are expired and expiring (prioritise these ingredients first) (e.g., '(expiring)').\n\n" +
               "3. **Instructions:**\n" +
               "   * Provide clear, numbered steps for preparing the recipe.\n" +
               "   * Assume the user has basic kitchen skills and equipment.\n" +
               "   * Be concise but thorough.\n\n" +
               "4. **Prep Time & Cook Time:**\n" +
               "   * Estimate the preparation time (time spent chopping, mixing, etc.).\n" +
               "   * Estimate the cooking time.\n" +
               "   * Format as 'Prep Time: [Time], Cook Time: [Time]' (e.g., 'Prep Time: 15 mins, Cook Time: 20 mins').\n\n" +
               "5. **Dietary Considerations (Optional):**\n" +
               "   * If the recipe is naturally suitable for a specific diet, mention it (e.g., 'Vegetarian', 'Gluten-Free').\n" +
               "   * If the recipe can be easily adapted, suggest how (e.g., 'Vegan: Omit the cheese.').\n\n" +
               "### Prioritize recipes that:\n" +
               "* Use the largest number of the provided expiring ingredients.\n" +
               "* Require the fewest additional ingredients.\n" +
               "* Are quick to prepare and cook (total time under 45 minutes, if possible).\n" +
               "* Are simple and suitable for a home cook.\n" +
               "* Minimize food waste.\n" + 
               "Skip your first sentence and don't use any bold formatting in your text.\n";
    

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
        maxOutputTokens: 1000
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
    return jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestions generated.";
  } 
  catch (error) 
  {
    console.error("Error:", error);
    return "🚫 Failed to get suggestions. Please try again later!";
  }
}
