# Documentation: ZeroWasteChef

This document provides a detailed overview of the ZeroWasteChef project, covering the problem statement, SDG alignment, user feedback and iteration process, success metrics, AI integration, technology innovation, and technical architecture.

## Table of Contents
* [1. Problem Statement & SDG Alignment](#1-problem-statement--sdg-alignment)
    * [1.1. Problem Statement](#11-problem-statement)
    * [1.2. UN Sustainable Development Goal(s) and Target(s)](#12-un-sustainable-development-goals-and-targets)
    * [1.3. Reasons for SDG Alignment](#13-reasons-for-sdg-alignment)
* [2. User Feedback & Iteration](#2-user-feedback--iteration)
    * [2.1. User Testing Steps and Feedback](#21-user-testing-steps-and-feedback)
    * [2.2. Implementations Based on User Feedback](#22-implementations-based-on-user-feedback)
* [3. Success Metrics](#3-success-metrics)
    * [3.1. Addressing the Challenge and Success Metrics](#31-addressing-the-challenge-and-success-metrics)
    * [3.2. Google Technologies for Tracking Usage Analytics](#32-google-technologies-for-tracking-usage-analytics)
* [4. AI Integration](#4-ai-integration)
    * [4.1. Use of Google AI Technology](#41-use-of-google-ai-technology)
    * [4.2. AI Integration and Project Improvement](#42-ai-integration-and-project-improvement)
    * [4.3. Impact of No AI Integration](#43-impact-of-no-ai-integration)
* [5. Technology Innovation](#5-technology-innovation)
    * [5.1. Project Differentiation](#51-project-differentiation)
    * [5.2. Opportunities for Long-Term Growth](#52-opportunities-for-long-term-growth)
* [6. Technical Section](#6-technical-section)
    * [6.1. Solution Architecture and Component Responsibilities](#61-solution-architecture-and-component-responsibilities)
    * [6.2. Products and Platforms Chosen for Implementation](#62-products-and-platforms-chosen-for-implementation)
    * [6.3. Coding Challenge Faced During Development](#63-coding-challenge-faced-during-development)
    * [6.4. Uncompleted Features and Future Incorporations](#64-uncompleted-features-and-future-incorporations)

## 1. Problem Statement & SDG Alignment

### 1.1. Problem Statement
Our project, ZeroWasteChef, addresses the problem of food waste due to poor inventory tracking. Many households and small businesses discard usable food because they lose track of expiration dates, leading to unnecessary waste, financial losses, and environmental impact. This issue is often overlooked but has a serious long-term consequence for food security and sustainability. By empowering users with a smarter way to monitor their food inventory, we aim to reduce waste at the consumer level and promote more mindful consumption habits.

### 1.2. UN Sustainable Development Goal(s) and Target(s)
We aligned our project with **SDG 12: Responsible Consumption and Production**, particularly **Target 12.3**, which aims to “halve per capita global food waste at the retail and consumer levels by 2030.” Additionally, our solution also supports **SDG 13: Climate Action**, which calls for urgent action to combat climate change and its impacts.

### 1.3. Reasons for SDG Alignment
Food waste contributes significantly to greenhouse gas emissions and inefficient resource usage due to the decomposition of organic waste in landfills and the resources used to produce, transport, and store uneaten food. By helping users track and manage food before it expires, our system reduces waste and promotes sustainable food practices aligned with SDG 12. This also serves as a contribution to lower the carbon footprint associated with food waste, therefore supporting climate action efforts under SDG 13 as well.

## 2. User Feedback & Iteration

### 2.1. User Testing Steps and Feedback
We managed to get real users to test our solution by sharing our WebApp prototype link with our relatives and friends to test out in a real household-based scenario. We received the following specific feedback points:
1. Users suggested making the expired and expiring items easier to differentiate visually.
2. Users requested the removal of bullet points from the expired section to match the expiring items UI.
3. Users asked for the ability to choose specific units for item quantity.

### 2.2. Implementations Based on User Feedback
Based on the user feedback, we implemented the following enhancements:
1. We learned that users wanted a clearer way to distinguish between expired and expiring items. Hence, we applied **color-coding** for each category in the expiring column, such as **yellow** for "expiring soon" and **red** for "expired." We also standardized the UI for consistency.
2. We learned that users disliked the current layout of the expired section. Hence, we **removed the bullet points** and adjusted the HTML code to ensure alignment and spacing, making the UI consistent with the "expiring soon" section.
3. We learned that users wanted flexibility when entering item quantities. To address this, we **added an option for users to select specific units** (e.g., kg, liters, pieces) when adding items to their inventory.

## 3. Success Metrics

### 3.1. Addressing the Challenge and Success Metrics
The project tackles the growing problem of household food waste by helping users track ingredients that are nearing expiration and generating personalized recipes using Gemini AI. The goal is to reduce food waste by encouraging users to cook with what they already have instead of letting it spoil. Gemini AI enhances the solution by analyzing the user's real-time inventory and suggesting creative, dietary-friendly meals that prioritize soon-to-expire items. This leads to more efficient kitchen management and a noticeable reduction in waste. Users benefit from not only saving money and reducing unnecessary grocery runs but also developing healthier and more sustainable cooking habits.

### 3.2. Google Technologies for Tracking Usage Analytics
The project uses **Google Cloud** to monitor how frequently recipes are generated within the app. This helps to track user interaction and understand how users interact with the recipe feature. By evaluating the frequency and timing of recipe production, we may detect user behavior patterns, such as when they are most likely to cook or check their inventory. This data enables us to improve the project’s performance and adapt to the user’s experience more efficiently. For example, if analytics suggest a reduction in recipe generation on weekends, we can deploy customized notifications or reminders to re-engage consumers.

## 4. AI Integration

### 4.1. Use of Google AI Technology
Yes, **Google’s Gemini API** is used to dynamically generate recipes based on real-time food inventory and expiration data. There is a key reason why Google’s Gemini AI was chosen: **Gemini has a multimodal capability.** Gemini can process both text and images to identify ingredients and expiration dates, enabling context-aware recipe suggestions. For example, if a user’s inventory shows “bread, milk, and milo expiring in 2 days,” Gemini generates recipes like “Milo French Toast” to prioritize soon-to-expire items.

### 4.2. AI Integration and Project Improvement
The project uses Gemini AI to generate recipes based on the user’s current food inventory, especially items that are close to expiration. As users update their inventory, Gemini instantly analyzes available ingredients and dietary preferences to suggest personalized recipes. This effectively reduces food waste. Gemini improves the project's functionality and performance by providing quick and efficient recipe suggestions, removing the need for customers to manually search or plan meals. Besides, Gemini prioritizes expiring items in recipes to help zero waste efforts.

### 4.3. Impact of No AI Integration
Without AI, recipes wouldn’t adapt to dietary preferences or ingredient quantities. Users would manually filter irrelevant suggestions, decreasing engagement. For instance, a vegetarian user with expiring tofu and spinach might be shown recipes containing chicken or beef because the system lacks the intelligence to filter based on dietary preferences.

In addition, supporting 1000++ users would require developers to manually input thousands of unique recipes covering all combinations of ingredients such as broccoli with rice or carrot with tuna and others. This becomes unmanageable quickly. Hence, AI can dynamically generate recipes based on whatever ingredients a user has.

Furthermore, seasonal ingredients or viral food trends would require weeks of manual updates instead of real-time AI adaptation. For example, if avocados become a seasonal trend, a system without AI would require a manual update by developers to include relevant recipes. Therefore, AI can instantly adapt by pulling from current trends and automatically generating relevant suggestions.

## 5. Technology Innovation

### 5.1. Project Differentiation
* **Addressing The Common Person’s Food Wastage:** ZeroWasteChef directly addresses the global issue of food waste by helping the common household reduce their environmental footprint by using ingredients before they expire. On top of that, ZeroWasteChef is accessible from any device (via an Internet Browser) and designed with a user-friendly interface that allows users of varying tech proficiency to use the WebApp's services without any hassle.
* **Integration with Google Sheets:** The app seamlessly integrates with Google Sheets to store and update inventory data. This makes it highly accessible, allowing users to easily manage and update their food data. It’s not only user-friendly but also ensures that users have control over their data without worrying about complex database management.
* **AI-Powered Meal Suggestions using Gemini API:** By leveraging the Gemini API, ZeroWasteChef doesn’t just list expiration dates but also helps users make intelligent decisions about what meals they can cook based on available ingredients. This reduces food waste while making meal planning easier and more resourceful.

### 5.2. Opportunities for Long-Term Growth
* **Integration with Other Platforms:** In the long term, there’s an opportunity to expand the app to integrate with other platforms like mobile apps or voice assistants (e.g., Google Home or Amazon Alexa), making it even more accessible to a larger audience.
* **Collaboration with Food Distribution Services:** ZeroWasteChef could partner with local food distribution services to donate food nearing its expiration date, further contributing to SDG 12. This could extend the app's functionality to not just reduce waste at home but also help surplus food get to those in need.
* **AI-Driven Expiry Predictions:** Over time, incorporating AI or machine learning could predict expiry dates more accurately based on user patterns and product types. This feature could be developed further to help users better plan purchases and meals, reducing food waste in an even smarter way.
* **Expansion to Other Sustainable Practices:** In the future, ZeroWasteChef could evolve to help users with other aspects of sustainability—like waste recycling, eco-friendly packaging, or meal portioning. By expanding to cover a wider range of responsible consumption practices, the app could cater to a growing audience focused on sustainability in all aspects of life.
* **Global Scaling:** As the app becomes more successful in its current form, there's potential for scaling it globally by adding localized meal suggestions and ingredient databases. The project could adapt to different food cultures and expiration norms, making it relevant for various countries.

## 6. Technical Section

### 6.1. Solution Architecture and Component Responsibilities
Our ZeroWasteChef prototype is designed to minimize food waste by providing users with an intuitive system to manage their home food inventory, receive timely expiration warnings, and generate meal suggestions using AI. The application's architecture is composed of the following key components:

* **Google Sheets (Data Storage):**
    * This serves as our persistent data store. It's responsible for storing and managing the user's food inventory, including item names, quantities, expiration dates, added dates, and status.
    * Its responsibilities include:
        * Providing a structured database for food item storage.
        * Enabling easy data retrieval and manipulation via Google Apps Script.
        * Facilitating data persistence.
* **SheetsService.gs (Data Management Layer):**
    * This Google Apps Script component acts as an intermediary between the web application's front-end and the Google Sheets data store.
    * Its responsibilities include:
        * Creating and managing the "Inventory" Google Sheet.
        * Adding, retrieving, deleting, and updating food item data.
        * Calculating expiration dates and applying conditional formatting for status visualization.
        * Providing data to the front end and the Gemini service.
* **GeminiService.gs (AI Meal Suggestion Engine):**
    * This Google Apps Script component interacts with the Gemini API to generate meal suggestions based on the user's inventory.
    * Its responsibilities include:
        * Formulating prompts for the Gemini API.
        * Sending API requests and processing responses.
        * Formatting and delivering meal suggestions to the user.
        * Prioritizing expiring items in the meal suggestions.
* **Code.gs (Web App Server):**
    * This Google Apps Script component handles HTTP requests and responses, acting as the web application's server-side logic.
    * Its responsibilities include:
        * Serving the Index.html web page.
        * Handling API requests from the front-end (e.g., retrieving expiring items, sending item data).
        * Managing user sessions and authentication (if implemented).
* **Index.html (User Interface):**
    * This HTML, CSS, and JavaScript component provides the user interface for the application.
    * Its responsibilities include:
        * Displaying the food inventory and expiration warnings.
        * Providing forms for adding and deleting items.
        * Displaying meal suggestions.
        * Handling user interactions and sending requests to the server-side.
* **appsscript.json (Configuration):**
    * This file configures the Google Apps Script project and ensures that the correct permissions are granted.

**Data Flow:**
1.  The user interacts with the `Index.html` front-end, adding, deleting, or requesting meal suggestions.
2.  JavaScript in `Index.html` sends requests to `Code.gs`.
3.  `Code.gs` calls functions in `SheetsService.gs` to interact with Google Sheets or `GeminiService.gs` to get meal suggestions.
4.  `SheetsService.gs` retrieves, modifies, or adds data in the Google Sheets.
5.  `GeminiService.gs` sends and receives data from the Gemini API.
6.  Data is returned to `Code.gs` and then sent back to `Index.html` for display.

**Technology Choices:**
* Google Apps Script was chosen for its seamless integration with Google Workspace, enabling direct access to Google Sheets and Drive.
* Google Sheets was chosen for its ease of use and quick setup.
* The Gemini API was chosen for its advanced natural language processing capabilities, which are essential for generating relevant and creative meal suggestions.
* HTML, CSS, and JavaScript were chosen for creating a user-friendly and responsive web interface.

### 6.2. Products and Platforms Chosen for Implementation
For the implementation of our ZeroWasteChef prototype, we selected the following products and platforms:

* **Google Apps Script:**
    * This is a core Google Developer Technology and was chosen as the primary development environment.
    * Reasons:
        * **Seamless Integration with Google Workspace:** It provides direct access to Google Sheets, which is crucial for our data storage and manipulation needs.
        * **Rapid Prototyping:** Apps Script's ease of use and quick setup allowed us to rapidly develop and iterate on our prototype.
        * **Server-Side Functionality:** It enables us to create server-side logic for handling data requests, API interactions, and web app functionality.
        * It allowed us to create a web app without the need to manage servers or deal with complex deployment processes.
* **Google Workspace (Sheets):**
    * Google Sheets was chosen as our data storage solution.
    * Reasons:
        * **Accessibility and Ease of Use:** It provides a user-friendly and accessible platform for storing and managing food inventory data.
        * **Data Manipulation Capabilities:** Its built-in functions and Apps Script integration make it easy to manipulate and retrieve data.
        * **Collaboration:** It is easy to share and collaborate with, if that was a requirement.
* **Google AI Studio (Gemini API):**
    * The Gemini API, accessed through Google AI Studio, was chosen for its advanced natural language processing capabilities.
    * Reasons:
        * **AI-Powered Meal Suggestions:** Gemini's ability to understand and generate human-like text allows us to provide relevant and creative meal suggestions based on the user's inventory.
        * **Prioritization of Expiring Items:** Gemini's language processing allows us to instruct it to prioritize expiring items in its suggestions, which is crucial for our goal of reducing food waste.
        * **State of the Art AI:** Gemini is a very capable LLM and provides excellent results.

### 6.3. Coding Challenge Faced During Development
A significant coding challenge arose where the application would occasionally create two separate "Inventory" Google Sheets upon the first launch by a new user. This inconsistent behavior was confusing and disrupted the intended single-source-of-truth for the user's food inventory.

**Initial Debugging and Misdirection:** Initial debugging efforts focused on the `sheetservice.gs` file, specifically the `getUserSheet()` and `getInventorySheet()` functions. The `getUserSheet()` function was designed to retrieve the existing "Inventory" sheet or create one if it didn't exist. The function attemps to get the first sheet in the spreadsheet (which defaults to "Sheet1") and then checked if its name was "Inventory". If not, it would rename it. An initial (incorrect) hypothesis was that the first `getUserSheet()` call would rename "Sheet1" to "Inventory," and the second call, finding no sheet named "Sheet1," would incorrectly trigger the creation of a *new* "Inventory" sheet. Potential issues were also explored within `getInventorySheet()`, which handles the creation of the spreadsheet itself, but these investigations proved fruitless.

**Identifying the Root Cause through Execution Logs:** After spending over two hours on these ultimately incorrect theories, Google Apps Script execution logs gave a deeper insight. The logs revealed a crucial detail, whereby the two client-side functions responsible for loading inventory data, `loadExpiringItems()` and `loadAllItems()`, were being called **almost simultaneously** upon the `DOMContentLoaded` event.

**Analyzing the Parallel Execution:** Examining the `index.html` file confirmed this parallel execution with two separate `addEventListener` calls for the same event. Both `loadExpiringItems()` and `loadAllItems()` begin by calling `google.script.run.getUserSheet()` in `sheetservice.gs`. This meant that the logic to find or create the "Inventory" sheet was being executed twice, concurrently, during the initial application load.

**The Concurrency Conflict:** The parallel execution of `getUserSheet()` created a race condition. In the brief window between the two calls:

1.  The first call to `getUserSheet()` would successfully find no "Inventory" sheet (if it's the very first time the user runs the app), create the "Inventory" spreadsheet, and rename the default "Sheet1" to "Inventory."
2.  The second, concurrent call to `getUserSheet()` would also start its process. Depending on the timing, it might:
    * Still not find an "Inventory" sheet if the first call hadn't completed the renaming process, leading to the creation of a *second* "Inventory" sheet.
    * Find the "Inventory" sheet created by the first call but still proceed with its subsequent data loading logic, which wasn't the primary issue but contributed to potential confusion.

The core problem was the concurrent, independent execution of the sheet initialization logic.

**The Solution:** To address this race condition, a centralized initialization function was implemented in `index.html` called `initializeApp()`. 

### 6.4. Uncompleted Features and Future Incorporations
Given more time, we would have incorporated several features to further enhance the ZeroWasteChef prototype and provide a more comprehensive user experience. We focused on the core functionality of inventory management and AI-driven meal suggestions for this initial version. However, we have identified several key areas for future development:

* **More Sophisticated Expiry Date Handling:**
    * We would implement natural language processing (NLP) to allow users to input expiry dates using natural language (e.g., "in a week," "next Tuesday"). This would significantly improve the ease of data entry and reduce user friction.
* **Image Recognition:**
    * Integrating with image recognition APIs would allow users to automatically identify food items by capturing images with their smartphones. This feature would streamline the process of adding items to the inventory, making it faster and more convenient.
* **Nutritional Information:**
    * Providing nutritional information for suggested recipes would add significant value, particularly for users with dietary restrictions or health goals. This would help users make informed choices about their meals.
* **Shopping List Feature:**
    * Generating a shopping list for missing ingredients in suggested recipes would further reduce food waste and simplify meal planning. This feature would help users purchase only the necessary items.
* **Advanced Filtering and Sorting:**
    * Implementing advanced filtering and sorting options would allow users to easily manage and organize their inventory. Users could filter by category, expiration date, or other criteria.
* **Recipe Personalisation:**
    * Allowing users to specify cuisine styles or dietary requirements would greatly enhance the user experience and result in more relevant meal suggestions.
* **Mobile App Version:**
    * A dedicated mobile app version of ZeroWasteChef would provide a more optimized and seamless experience for users on smartphones. This would improve accessibility and usability, particularly for on-the-go inventory management.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

This concludes the project documentation for ZeroWasteChef. We are excited about the potential of this project to contribute to reducing food waste and promoting more sustainable consumption habits.
