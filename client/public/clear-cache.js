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
  
  console.log('All caches cleared - page should be fresh');
});
