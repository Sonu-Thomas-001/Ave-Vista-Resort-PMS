import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface Expense {
    id: string;
    title: string;
    category_id: string;
    amount: number;
    date: string;
    payment_mode: string;
    notes?: string;
    expense_categories?: {
        id: string;
        name: string;
        color: string;
    };
    profiles?: {
        full_name: string;
    };
}

export const exportToPDF = async (expenses: Expense[], fileName: string = 'expenses-report') => {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const { height } = page.getSize();
        let yPosition = height - 50;

        // Set title
        page.drawText('Expense Report', {
            x: 50,
            y: yPosition,
            size: 24,
            font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
            color: rgb(16, 185, 129),
        });

        yPosition -= 40;

        // Add generated date
        page.drawText(`Generated: ${new Date().toLocaleDateString('en-IN')}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font: await pdfDoc.embedFont(StandardFonts.Helvetica),
            color: rgb(107, 114, 128),
        });

        yPosition -= 30;

        // Table headers
        const headers = ['Date', 'Title', 'Category', 'Amount (₹)', 'Payment Mode', 'Added By'];
        const colWidths = [80, 120, 100, 90, 80, 125];
        let xPosition = 50;

        page.drawText('Date', { x: xPosition, y: yPosition, size: 10, font: await pdfDoc.embedFont(StandardFonts.HelveticaBold) });
        xPosition += colWidths[0];
        page.drawText('Title', { x: xPosition, y: yPosition, size: 10, font: await pdfDoc.embedFont(StandardFonts.HelveticaBold) });
        xPosition += colWidths[1];
        page.drawText('Category', { x: xPosition, y: yPosition, size: 10, font: await pdfDoc.embedFont(StandardFonts.HelveticaBold) });
        xPosition += colWidths[2];
        page.drawText('Amount', { x: xPosition, y: yPosition, size: 10, font: await pdfDoc.embedFont(StandardFonts.HelveticaBold) });
        xPosition += colWidths[3];
        page.drawText('Payment', { x: xPosition, y: yPosition, size: 10, font: await pdfDoc.embedFont(StandardFonts.HelveticaBold) });
        xPosition += colWidths[4];
        page.drawText('Added By', { x: xPosition, y: yPosition, size: 10, font: await pdfDoc.embedFont(StandardFonts.HelveticaBold) });

        yPosition -= 20;

        // Draw horizontal line
        page.drawLine({
            start: { x: 50, y: yPosition },
            end: { x: 545, y: yPosition },
            thickness: 1,
            color: rgb(229, 231, 235),
        });

        yPosition -= 15;

        // Add rows
        let totalAmount = 0;
        for (const expense of expenses) {
            if (yPosition < 60) {
                // New page if needed
                const newPage = pdfDoc.addPage([595, 842]);
                yPosition = 800;
            }

            xPosition = 50;
            const dateStr = new Date(expense.date).toLocaleDateString('en-IN');

            page.drawText(dateStr, { x: xPosition, y: yPosition, size: 9, font: await pdfDoc.embedFont(StandardFonts.Helvetica) });
            xPosition += colWidths[0];

            const title = (expense.title || '').substring(0, 20);
            page.drawText(title, { x: xPosition, y: yPosition, size: 9, font: await pdfDoc.embedFont(StandardFonts.Helvetica) });
            xPosition += colWidths[1];

            const category = expense.expense_categories?.name || 'Unknown';
            page.drawText(category, { x: xPosition, y: yPosition, size: 9, font: await pdfDoc.embedFont(StandardFonts.Helvetica) });
            xPosition += colWidths[2];

            const amountStr = `₹${expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            page.drawText(amountStr, { x: xPosition, y: yPosition, size: 9, font: await pdfDoc.embedFont(StandardFonts.Helvetica) });
            xPosition += colWidths[3];

            page.drawText(expense.payment_mode || 'Cash', { x: xPosition, y: yPosition, size: 9, font: await pdfDoc.embedFont(StandardFonts.Helvetica) });
            xPosition += colWidths[4];

            const addedBy = (expense.profiles?.full_name || 'System').substring(0, 20);
            page.drawText(addedBy, { x: xPosition, y: yPosition, size: 9, font: await pdfDoc.embedFont(StandardFonts.Helvetica) });

            totalAmount += expense.amount;
            yPosition -= 15;
        }

        // Summary
        yPosition -= 10;
        page.drawLine({
            start: { x: 50, y: yPosition },
            end: { x: 545, y: yPosition },
            thickness: 1,
            color: rgb(229, 231, 235),
        });

        yPosition -= 20;
        page.drawText(`Total Expenses: ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, {
            x: 50,
            y: yPosition,
            size: 12,
            font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
            color: rgb(16, 185, 129),
        });

        // Save PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('PDF export error:', error);
        throw new Error('Failed to export PDF');
    }
};

export const exportToExcel = (expenses: Expense[], fileName: string = 'expenses-report') => {
    try {
        // Create CSV content
        const headers = ['Date', 'Title', 'Category', 'Amount (₹)', 'Payment Mode', 'Notes', 'Added By'];
        const rows = expenses.map((expense) => [
            new Date(expense.date).toLocaleDateString('en-IN'),
            expense.title,
            expense.expense_categories?.name || 'Unknown',
            expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            expense.payment_mode || 'Cash',
            expense.notes || '',
            expense.profiles?.full_name || 'System',
        ]);

        // Add summary row
        const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        rows.push(['', '', 'TOTAL', totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }), '', '', '']);

        // Create CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map((row) =>
                row.map((cell) => {
                    // Escape cells containing commas or quotes
                    if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                        return `"${cell.replace(/"/g, '""')}"`;
                    }
                    return cell;
                }).join(',')
            ),
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Excel export error:', error);
        throw new Error('Failed to export Excel');
    }
};
