// Breadcrumb functionality
const Breadcrumb = {
  generate() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(segment => segment && segment !== 'pages');
    
    const breadcrumbContainer = document.getElementById('breadcrumb');
    if (!breadcrumbContainer) return;

    let breadcrumbHTML = `
      <li class="inline-flex items-center">
        <a href="/pages/admin/dashboard.html" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600">
          <svg class="w-3 h-3 me-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
          </svg>
          Home
        </a>
      </li>
    `;

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      const displayName = segment.replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      if (isLast) {
        breadcrumbHTML += `
          <li aria-current="page">
            <div class="flex items-center">
              <svg class="w-3 h-3 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2">${displayName}</span>
            </div>
          </li>
        `;
      } else {
        breadcrumbHTML += `
          <li>
            <div class="flex items-center">
              <svg class="w-3 h-3 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span class="ms-1 text-sm font-medium text-gray-700 md:ms-2">${displayName}</span>
            </div>
          </li>
        `;
      }
    });

    breadcrumbContainer.innerHTML = breadcrumbHTML;
  }
};

export default Breadcrumb;
