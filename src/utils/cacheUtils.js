// Cache clearing utility for development
export const clearBrowserCache = () => {
  // Clear service worker cache
  if ('serviceWorker' in navigator && 'caches' in window) {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('All caches cleared');
      // Unregister service worker
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
      // Force page reload
      window.location.reload(true);
    });
  } else {
    // Fallback: just reload the page
    window.location.reload(true);
  }
};

// Add development helper to window object
if (process.env.NODE_ENV === 'development') {
  window.clearCache = clearBrowserCache;
  console.log('Development mode: Use window.clearCache() to clear browser cache');
}