// DocService.gs
function saveRecipeToDoc(recipeObject) {
  try {
    // Basic validation
    if (!recipeObject || !recipeObject.title || !Array.isArray(recipeObject.ingredients) || !Array.isArray(recipeObject.instructions)) {
      throw new Error("Invalid recipe data provided.");
    }

    const recipeTitle = recipeObject.title.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_') || 'Untitled'; // Sanitize title for filename
    const docTitle = `ZeroWasteChef_Recipe_${recipeTitle}`;

    // Create a new Google Doc
    const doc = DocumentApp.create(docTitle);
    const body = doc.getBody();

    // Format the content in the Doc
    body.appendParagraph(recipeObject.title).setHeading(DocumentApp.ParagraphHeading.TITLE);
    body.appendParagraph(`Difficulty: ${recipeObject.difficulty || 'N/A'}`);
    body.appendParagraph(`Time: Prep ${recipeObject.prepTime || 'N/A'} + Cook ${recipeObject.cookTime || 'N/A'}`);
    body.appendParagraph(''); // Add a blank line

    body.appendParagraph('Ingredients:').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    recipeObject.ingredients.forEach(ingredient => {
      if (ingredient && ingredient.name) {
        const ingredientText = `${ingredient.name}${ingredient.quantity ? ' - ' + ingredient.quantity : ''}${ingredient.expiring ? ' (expiring)' : ''}`;
        body.appendListItem(ingredientText).setGlyphType(DocumentApp.GlyphType.BULLET);
      }
    });
     body.appendParagraph(''); // Add a blank line


    body.appendParagraph('Instructions:').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    recipeObject.instructions.forEach((instruction, index) => {
       if (typeof instruction === 'string' && instruction.trim()) {
          body.appendListItem(instruction).setGlyphType(DocumentApp.GlyphType.NUMBER);
       }
    });
    body.appendParagraph(''); // Add a blank line

    if (recipeObject.dietaryInfo && Array.isArray(recipeObject.dietaryInfo) && recipeObject.dietaryInfo.length > 0) {
         body.appendParagraph(`Dietary Info: ${recipeObject.dietaryInfo.join(', ')}`);
         body.appendParagraph('');
    }


    // Optional: Add a link to the image if imagePrompt exists
    if (recipeObject.imagePrompt) {
        body.appendParagraph('Recipe Image:').setHeading(DocumentApp.ParagraphHeading.HEADING2);
        // Note: You cannot directly embed images from external URLs easily in GAS Docs creation.
        // You could fetch the image data via UrlFetchApp (with potential limitations/errors)
        // or just include the prompt or a link. Including the prompt is simpler.
        body.appendParagraph(`Generated from prompt: "${recipeObject.imagePrompt}"`);
        body.appendParagraph('');
    }

    // Optional: Add nutritional info link - FIX IS HERE
     if (recipeObject.nutritionSource) {
          body.appendParagraph('Nutritional Information:').setHeading(DocumentApp.ParagraphHeading.HEADING2);

          var sourcePara = body.appendParagraph('Source: '); // 1. Create the paragraph "Source: "

          // 2. Append the URL text to the paragraph, getting the Text element
          var linkTextElement = sourcePara.appendText(recipeObject.nutritionSource);

          // 3. Set the link URL on the Text element
          linkTextElement.setLinkUrl(recipeObject.nutritionSource);

           body.appendParagraph(''); // Add a blank line after the source link
     }


    // Save and close the document
    doc.saveAndClose();

    // Return the URL of the created document
    const docUrl = doc.getUrl();
    console.log(`Recipe "${recipeObject.title}" saved to Google Doc: ${docUrl}`); // Log in GAS dashboard
    return docUrl; // Return the URL for the success handler

  } catch (e) {
    console.error("Error saving recipe to doc:", e); // Log error in GAS dashboard
    // Throw the error so the client-side failure handler is triggered
    throw new Error("Failed to save recipe to Google Docs: " + e.message);
  }
}
// const RECIPE_DOC_NAME = "ZeroWasteChef_Recipes";

// /**
//  * Finds the user's recipe Google Doc by name, or creates it if it doesn't exist.
//  * Runs under the user's authority due to webapp settings.
//  * @return {GoogleAppsScript.Document.Document} The Google Document object.
//  * @throws {Error} If the document cannot be found or created.
//  */
// function findOrCreateRecipeDoc_() { // Underscore indicates private helper function
//   try {
//     const files = DriveApp.getFilesByName(RECIPE_DOC_NAME);
//     let doc;

//     if (files.hasNext()) {
//       const file = files.next();
//       Logger.log(`Found existing recipe doc: ${file.getId()}`);
//       doc = DocumentApp.openById(file.getId());
//     } else {
//       Logger.log(`Creating new recipe doc: ${RECIPE_DOC_NAME}`);
//       doc = DocumentApp.create(RECIPE_DOC_NAME);
//       // Add a header to the new document
//       doc.getBody().appendParagraph(RECIPE_DOC_NAME)
//            .setHeading(DocumentApp.ParagraphHeading.TITLE);
//       doc.getBody().appendParagraph(`Generated recipes saved from the ZeroWasteChef app.`);
//       doc.getBody().appendHorizontalRule();
//       doc.saveAndClose(); // Save initial content
//       // Re-open to ensure we have the latest state? Usually not needed immediately after create.
//       // doc = DocumentApp.openById(doc.getId()); // Can uncomment if needed
//        Logger.log(`Created and saved new doc: ${doc.getId()}`);
//     }
//     return doc;
//   } catch (e) {
//     Logger.log(`Error finding or creating recipe doc: ${e}`);
//     throw new Error(`Could not access or create the recipe document "${RECIPE_DOC_NAME}". Please check Drive permissions or try again later. Error: ${e.message}`);
//   }
// }

// /**
//  * Saves the provided recipe text to the user's "ZeroWasteChef_Recipes" Google Doc.
//  * Inserts the new recipe at the beginning of the document.
//  * This function is called directly from the client-side JavaScript.
//  * @param {string} recipeText The recipe text generated by the AI.
//  * @return {string} A success message.
//  * @throws {Error} If saving fails.
//  */
// function saveRecipeToDoc(recipeText) {
//   if (!recipeText || typeof recipeText !== 'string' || recipeText.trim().length < 20) { // Basic validation
//      throw new Error("Invalid or empty recipe text provided.");
//   }

//   try {
//     const doc = findOrCreateRecipeDoc_();
//     const body = doc.getBody();

//     // Insert content at the beginning (index 0)
//     // Existing content will be pushed down.
//     body.insertParagraph(0, "").appendHorizontalRule(); // Separator below new content
//     body.insertParagraph(0, recipeText.trim());          // The recipe
//     body.insertParagraph(0, `Recipe saved: ${new Date().toLocaleString()}`) // Timestamp heading
//          .setHeading(DocumentApp.ParagraphHeading.HEADING2);
//      body.insertParagraph(0, "").appendHorizontalRule(); // Separator above new content

//     doc.saveAndClose();
//     Logger.log(`Successfully appended recipe to doc: ${doc.getId()}`);
//     return "Recipe successfully saved to Google Doc!";

//   } catch (e) {
//     Logger.log(`Error saving recipe to doc: ${e}`);
//     // Rethrow error to be caught by frontend failure handler
//     throw new Error(`Failed to save recipe: ${e.message}`);
//   }
// }
