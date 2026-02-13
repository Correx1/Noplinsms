/**
 * PDF Generator
 * Uses html2canvas and jsPDF to capture the page and save as PDF
 */

document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('download-pdf-btn');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', generatePDF);
    }
});

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    // Hide controls before capture
    const controls = document.querySelectorAll('.no-print');
    controls.forEach(el => el.style.display = 'none');

    const content = document.querySelector('.print-template') || document.body;

    try {
        const canvas = await html2canvas(content, {
            scale: 2, // Higher resolution
            useCORS: true, // For images
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        
        // A4 Paper Size
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        // Print first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Multi-page logic (simplified)
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        // Auto Download
        pdf.save('download.pdf');

    } catch (err) {
        console.error('PDF Generation Error:', err);
        alert('Error creating PDF. Please try printing to PDF instead.');
    } finally {
        // Restore controls
        controls.forEach(el => el.style.display = '');
    }
}
