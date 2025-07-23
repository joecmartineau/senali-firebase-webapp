document.addEventListener('DOMContentLoaded', function() {
  // Force clear all caches on page load
  if ('caches' in window) {
    caches.keys().then(function(names) {
      names.forEach(function(name) {
        console.log('Clearing cache:', name);
        caches.delete(name);
      });
    });
  }
  
  // Clear localStorage and sessionStorage
  if (typeof(Storage) !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
  }
  
  // Add timestamp to force refresh
  console.log('Cache cleared at:', new Date().toISOString());
  console.log('Domain fix applied - ready for Firebase auth');
});
