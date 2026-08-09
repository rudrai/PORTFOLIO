// Speed Insights initialization for static site
// This script loads and initializes Vercel Speed Insights
(function() {
  // Import and inject Speed Insights when the DOM is ready
  if (typeof window !== 'undefined') {
    // For production deployment on Vercel, Speed Insights will automatically track
    // web vitals and performance metrics
    
    // The Speed Insights script is injected via the module system
    // Import the injectSpeedInsights function
    import('https://cdn.jsdelivr.net/npm/@vercel/speed-insights@1/dist/index.mjs')
      .then(({ injectSpeedInsights }) => {
        // Initialize Speed Insights
        injectSpeedInsights({
          debug: false, // Set to true for debugging
          // Additional configuration can be added here
        });
        console.log('Speed Insights initialized');
      })
      .catch((error) => {
        console.error('Failed to load Speed Insights:', error);
      });
  }
})();
