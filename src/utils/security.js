/**
 * Security utilities for input sanitization and validation
 */

// HTML entity encoding map
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeHTML(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Validate and sanitize file upload
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result
 */
export function validateFile(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/markdown',
    'application/json',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];

  const allowedExtensions = /\.(pdf|docx?|txt|md|json|png|jpe?g)$/i;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSize / (1024 * 1024)}MB`
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload PDF, DOCX, DOC, TXT, MD, JSON, PNG, or JPG files.'
    };
  }

  // Check for suspicious file names
  if (/[<>:"/\\|?*\x00-\x1f]/.test(file.name)) {
    return {
      isValid: false,
      error: 'Invalid characters in filename'
    };
  }

  return { isValid: true };
}

/**
 * Sanitize text input for API calls
 * @param {string} input - The input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized input
 */
export function sanitizeTextInput(input, maxLength = 10000) {
  if (typeof input !== 'string') return '';
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim and limit length
  sanitized = sanitized.trim().slice(0, maxLength);
  
  return sanitized;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a secure random ID
 * @param {number} length - Length of the ID
 * @returns {string} - Random ID
 */
export function generateSecureId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Content Security Policy headers
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.gemini.google.com https://jsearch.p.rapidapi.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
};

/**
 * Rate limiting utility (simple in-memory implementation)
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  getRemainingTime(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const oldestRequest = Math.min(...userRequests);
    
    if (userRequests.length < this.maxRequests) {
      return 0;
    }
    
    return Math.max(0, this.windowMs - (now - oldestRequest));
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Validate JSON input
 * @param {string} jsonString - JSON string to validate
 * @returns {Object} - Validation result
 */
export function validateJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    return { isValid: true, data: parsed };
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON format' };
  }
}
