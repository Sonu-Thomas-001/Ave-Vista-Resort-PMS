'use client';

import React, { useState, useRef } from 'react';
import { X, Printer, Download, ZoomIn, ZoomOut, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';
import styles from './InvoicePreviewModal.module.css';
import { downloadPdfFromElement, printElementIsolated } from '@/lib/pdf-service';

interface InvoicePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    filename: string;
    format?: 'a4' | 'thermal';
    showFormatToggle?: boolean;
    onFormatChange?: (format: 'a4' | 'thermal') => void;
    children: React.ReactNode;
}

export function InvoicePreviewModal({
    isOpen,
    onClose,
    title,
    subtitle,
    filename,
    format = 'a4',
    showFormatToggle = false,
    onFormatChange,
    children,
}: InvoicePreviewModalProps) {
    const [zoom, setZoom] = useState<number>(1);
    const [downloading, setDownloading] = useState<boolean>(false);
    const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
    const paperRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const handleZoomIn = () => {
        setZoom(prev => Math.min(1.4, Number((prev + 0.1).toFixed(1))));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(0.6, Number((prev - 0.1).toFixed(1))));
    };

    const handleZoomReset = () => {
        setZoom(1);
    };

    const handlePrint = () => {
        if (!paperRef.current) return;
        printElementIsolated(paperRef.current, format, title);
    };

    const handleDownload = async () => {
        if (!paperRef.current || downloading) return;
        setDownloading(true);
        setDownloadSuccess(false);

        try {
            await downloadPdfFromElement(paperRef.current, filename, {
                format,
                scale: 2,
            });
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);
        } catch (err) {
            console.error('Download PDF error:', err);
            alert('Could not generate PDF download directly. Please use the Print button and choose "Save as PDF".');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalWindow} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <header className={styles.modalHeader}>
                    <div className={styles.headerLeft}>
                        <div className={styles.iconBox}>
                            <FileText size={20} />
                        </div>
                        <div className={styles.titleBox}>
                            <h2 className={styles.docTitle}>{title}</h2>
                            <p className={styles.docSub}>{subtitle || 'Official Resort Document • Ready for Print & Export'}</p>
                        </div>
                    </div>

                    <div className={styles.headerControls}>
                        {/* Format Switcher */}
                        {showFormatToggle && onFormatChange && (
                            <div className={styles.formatToggle}>
                                <button
                                    type="button"
                                    className={`${styles.formatBtn} ${format === 'a4' ? styles.formatBtnActive : ''}`}
                                    onClick={() => onFormatChange('a4')}
                                >
                                    A4 Invoice
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.formatBtn} ${format === 'thermal' ? styles.formatBtnActive : ''}`}
                                    onClick={() => onFormatChange('thermal')}
                                >
                                    80mm Slip
                                </button>
                            </div>
                        )}

                        {/* Zoom Controls */}
                        <div className={styles.zoomControls}>
                            <button
                                type="button"
                                className={styles.zoomBtn}
                                onClick={handleZoomOut}
                                title="Zoom Out"
                                disabled={zoom <= 0.6}
                            >
                                <ZoomOut size={15} />
                            </button>
                            <span className={styles.zoomText}>{Math.round(zoom * 100)}%</span>
                            <button
                                type="button"
                                className={styles.zoomBtn}
                                onClick={handleZoomIn}
                                title="Zoom In"
                                disabled={zoom >= 1.4}
                            >
                                <ZoomIn size={15} />
                            </button>
                            {zoom !== 1 && (
                                <button
                                    type="button"
                                    className={styles.zoomBtn}
                                    onClick={handleZoomReset}
                                    title="Reset to 100%"
                                >
                                    <RotateCcw size={13} />
                                </button>
                            )}
                        </div>

                        {/* Close button */}
                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={onClose}
                            title="Close Preview"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </header>

                {/* Body / Document Viewport */}
                <div className={styles.modalBody}>
                    <div
                        className={styles.paperSheetWrapper}
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <div
                            ref={paperRef}
                            className={`${styles.paperSheet} ${format === 'thermal' ? styles.paperThermal : styles.paperA4}`}
                        >
                            {children}
                        </div>
                    </div>
                </div>

                {/* Footer Toolbar */}
                <footer className={styles.modalFooter}>
                    <div className={styles.footerHint}>
                        {downloadSuccess ? (
                            <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                <CheckCircle2 size={16} /> PDF Downloaded Successfully
                            </span>
                        ) : (
                            <span>High-fidelity 300 DPI layout ready for export</span>
                        )}
                    </div>

                    <div className={styles.actionBtns}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                        >
                            Close
                        </button>

                        <button
                            type="button"
                            className={styles.printBtn}
                            onClick={handlePrint}
                            title="Print cleanly without browser headers"
                        >
                            <Printer size={16} />
                            Print
                        </button>

                        <button
                            type="button"
                            className={styles.downloadPdfBtn}
                            onClick={handleDownload}
                            disabled={downloading}
                            title="Download PDF directly to your device"
                        >
                            {downloading ? (
                                <>
                                    <div className={styles.spinner} />
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <Download size={16} />
                                    Download PDF
                                </>
                            )}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
