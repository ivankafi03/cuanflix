import crypto from 'crypto';

const SECRET_KEY = process.env.STREAM_SECRET_KEY || 'cuanflix_secret_stream_key_2026_safe_hash_key_x98';
const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.createHash('sha256').update(SECRET_KEY).digest(); // 32 bytes

/**
 * Encrypt real stream / iframe URL into a safe, opaque token
 */
export function encryptStreamToken(text: string): string {
    if (!text) return '';
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // Format: iv:encrypted (base64url safe)
        const combined = `${iv.toString('hex')}:${encrypted}`;
        return Buffer.from(combined).toString('base64url');
    } catch (error) {
        console.error("[Token] Encryption error:", error);
        return Buffer.from(text).toString('base64url'); // Fallback
    }
}

/**
 * Decrypt stream token back to real target URL (Server-side only)
 */
export function decryptStreamToken(token: string): string {
    if (!token) return '';
    try {
        const combined = Buffer.from(token, 'base64url').toString('utf8');
        const [ivHex, encryptedHex] = combined.split(':');
        
        if (!ivHex || !encryptedHex) {
            // Fallback base64url decode
            return Buffer.from(token, 'base64url').toString('utf8');
        }

        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error("[Token] Decryption error:", error);
        try {
            return Buffer.from(token, 'base64url').toString('utf8');
        } catch (_) {
            return '';
        }
    }
}
