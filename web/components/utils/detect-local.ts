export const detectLocale = () => {
    // Get the user's preferred language from the browser
    const userLocale = navigator.language || 'en-US';
  
    // Convert to a format that Moment.js understands (e.g., 'en', 'fr', etc.)
    // You might need a mapping from browser locales to Moment.js locales
    return userLocale.split('-')[0]; // 'en', 'fr', etc.
  };