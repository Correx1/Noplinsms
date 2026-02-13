// Main JavaScript Entry Point
// Flowbite is loaded via CDN in HTML files

// Initialize Flowbite components when available
document.addEventListener('DOMContentLoaded', function() {
  if (typeof initFlowbite === 'function') {
    initFlowbite();
  }
});
