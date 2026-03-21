const fs = require('fs');
const sidebar = fs.readFileSync('components/sidebar.html', 'utf8');

const searchString = '<!-- ══════════════ MANAGE USERS ══════════════ -->';
const menuIndex = sidebar.indexOf(searchString);

if (menuIndex !== -1) {
    const menus = sidebar.substring(menuIndex);
    
    // Reconstruct owner sidebar to guarantee clean tags
    const ownerClean = `
<aside
  id="logo-sidebar"
  class="fixed top-0 left-0 z-40 w-64 h-screen pt-[4.5rem] transition-transform -translate-x-full bg-primary-800 border-r border-primary-800 sm:translate-x-0 dark:bg-primary-800 dark:border-primary-900"
  aria-label="Sidebar"
>
  <div class="h-full px- pb-4 overflow-y-auto bg-primary-600 dark:bg-primary-800">
      <ul class="space-y-2 font-medium">

         <!-- Owner Dashboard -->
         <li onclick="loadOwnerDashboard(); setActiveLink(this); return false;" class="border-b border-white/20 flex items-center p-4 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-900 group active-nav-link">
            <a href="#" class="w-full flex items-center">
               <i class="fas fa-crown w-5 h-5 text-yellow-400 transition duration-75 group-hover:text-yellow-300"></i>
               <span class="ms-3 font-bold tracking-wide">Dashboard</span>
            </a>
         </li>

         <!-- Branch Management -->
         <li onclick="loadBranchesPage(); setActiveLink(this); return false;" class="border-b border-white/20 flex items-center p-4 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-900 group">
            <a href="#" class="w-full flex items-center">
               <i class="fas fa-sitemap w-5 h-5 text-white transition duration-75 group-hover:text-white"></i>
               <span class="ms-3 font-bold tracking-wide">Branches</span>
            </a>
         </li>
         
` + menus;
    
    fs.writeFileSync('components/owner-sidebar.html', ownerClean);
    console.log('Successfully injected menus into owner sidebar');
} else {
    console.log('Failed to find merge string');
}
