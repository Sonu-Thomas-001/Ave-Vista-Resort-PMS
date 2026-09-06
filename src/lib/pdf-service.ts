'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PdfExportOptions {
    format?: 'a4' | 'thermal';
    scale?: number;
    filename?: string;
    onProgress?: (progress: number, message: string) => void;
}

/**
 * Downloads a high-resolution, pixel-perfect PDF file from a DOM element.
 * Supports standard A4 invoices with multi-page pagination and 80mm POS thermal receipts.
 */
export async function downloadPdfFromElement(
    element: HTMLElement,
    filename: string,
    options: PdfExportOptions = {}
): Promise<void> {
    const { format = 'a4', scale = 2, onProgress } = options;

    try {
        onProgress?.(15, 'Preparing document layout...');

        // Ensure element is visible and styled for capture
        const canvas = await html2canvas(element, {
            scale: Math.min(scale, 3), // 2x or 3x for crisp text
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: format === 'thermal' ? 380 : 850,
            onclone: (clonedDoc, clonedElement) => {
                // Ensure cloned element has solid white background and visible text
                clonedElement.style.margin = '0 auto';
                clonedElement.style.boxShadow = 'none';
                clonedElement.style.border = 'none';
                clonedElement.style.background = '#ffffff';
            },
        });

        onProgress?.(60, 'Compiling PDF pages...');

        const imgData = canvas.toDataURL('image/png', 1.0);

        if (format === 'thermal') {
            // 80mm Thermal Receipt (width 80mm, dynamic height)
            const slipWidth = 80;
            const slipHeight = Math.max(50, (canvas.height * slipWidth) / canvas.width);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [slipWidth, slipHeight],
            });

            pdf.addImage(imgData, 'PNG', 0, 0, slipWidth, slipHeight, undefined, 'FAST');
            onProgress?.(95, 'Saving receipt...');
            pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
        } else {
            // Standard A4 Tax Invoice (210mm x 297mm)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 0; // Margins are included in HTML layout
            const contentWidth = pageWidth - margin * 2;
            const contentHeight = (canvas.height * contentWidth) / canvas.width;

            let heightLeft = contentHeight;
            let position = 0;

            // First page
            pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
            heightLeft -= pageHeight;

            // Additional pages if the invoice has lots of items
            while (heightLeft > 5) {
                position = -(pageHeight * (pdf.getNumberOfPages()));
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, undefined, 'FAST');
                heightLeft -= pageHeight;
            }

            onProgress?.(95, 'Saving invoice...');
            pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
        }

        onProgress?.(100, 'Complete');
    } catch (error) {
        console.error('[pdf-service] Failed to generate PDF:', error);
        throw new Error('Failed to generate PDF. Please try printing directly.');
    }
}

/**
 * Cleanly prints a DOM element using an isolated hidden iframe with custom print stylesheets.
 * Removes browser URL and header stamps while ensuring exact color reproduction.
 */
export function printElementIsolated(
    element: HTMLElement,
    format: 'a4' | 'thermal' = 'a4',
    documentTitle: string = 'Ave Vista Resorts Invoice'
): void {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
        // Fallback to window.print if iframe creation fails
        window.print();
        return;
    }

    // Collect all stylesheets from main document head
    let headStyles = '';
    const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
    styleElements.forEach((node) => {
        headStyles += node.outerHTML + '\n';
    });

    const pageCss = format === 'thermal'
        ? `
            @page {
                size: 80mm auto;
                margin: 2mm;
            }
            body {
                width: 76mm !important;
                max-width: 76mm !important;
                margin: 0 auto !important;
                padding: 2mm 0 !important;
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            * {
                box-sizing: border-box !important;
            }
        `
        : `
            @page {
                size: A4 portrait;
                margin: 8mm 10mm;
            }
            body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            * {
                box-sizing: border-box !important;
            }
        `;

    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>${documentTitle}</title>
                ${headStyles}
                <style>
                    ${pageCss}
                    /* Prevent page break inside table rows & summary cards */
                    tr, .infoCard, .summaryRow, .signatures {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                </style>
            </head>
            <body>
                <div id="print-root">
                    ${element.outerHTML}
                </div>
            </body>
        </html>
    `);
    doc.close();

    // Give iframe resources (fonts, images) a brief moment to stabilize then trigger print
    setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Safely remove iframe after print dialog completes
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 1500);
    }, 300);
}
