/**
 * @file qr.ts
 * @project Owivara - Development
 * @package @owivara/baileys-core
 * @module QR Code Utilities
 *
 * @description
 * QR code generation and handling for WhatsApp linking.
 * Converts Baileys QR string to base64 image for dashboard display.
 *
 * @resurrection_source CLEAN_SLATE — No QR utilities existed in old project
 * @resurrection_status CLEAN_SLATE
 * @hallucination_check PASSED
 */
/**
 * Generate a QR code image as base64 data URL.
 * For displaying in the dashboard.
 *
 * @param qrString - Raw QR string from Baileys
 * @returns Base64 PNG data URL
 */
export declare function generateQRImage(qrString: string): string;
/**
 * Print QR code to terminal (for debugging).
 *
 * @param qrString - Raw QR string from Baileys
 */
export declare function printQRToTerminal(qrString: string): void;
/**
 * Check if a QR code string is valid.
 *
 * @param qr - QR string to validate
 * @returns True if the QR string looks valid
 */
export declare function isValidQR(qr: string): boolean;
/**
 * Generate a clean QR display object for the dashboard.
 *
 * @param qrString - Raw QR string from Baileys
 * @param expiresAt - When this QR expires (5 minutes default)
 * @returns QR display data
 */
export declare function createQRDisplay(qrString: string, expiresAt?: Date): {
    qr: string;
    qr_image: string;
    expires_at: string;
    is_expired: boolean;
};
//# sourceMappingURL=qr.d.ts.map