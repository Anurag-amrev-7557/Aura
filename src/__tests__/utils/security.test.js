import {
  sanitizeHTML,
  validateFile,
  sanitizeTextInput,
  isValidEmail,
  generateSecureId,
  validateJSON
} from '../../utils/security';

describe('Security Utils', () => {
  describe('sanitizeHTML', () => {
    test('escapes HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeHTML(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    test('handles empty input', () => {
      expect(sanitizeHTML('')).toBe('');
      expect(sanitizeHTML(null)).toBe('');
      expect(sanitizeHTML(undefined)).toBe('');
    });

    test('preserves safe content', () => {
      const input = 'This is safe content';
      expect(sanitizeHTML(input)).toBe(input);
    });
  });

  describe('validateFile', () => {
    test('accepts valid PDF file', () => {
      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      const result = validateFile(file);
      expect(result.isValid).toBe(true);
    });

    test('rejects oversized file', () => {
      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 20 * 1024 * 1024 }); // 20MB
      
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size must be less than');
    });

    test('rejects invalid file type', () => {
      const file = new File(['content'], 'virus.exe', { type: 'application/x-executable' });
      Object.defineProperty(file, 'size', { value: 1024 });
      
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File type not supported');
    });

    test('rejects file with suspicious name', () => {
      const file = new File(['content'], 'file<script>.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 });
      
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid characters in filename');
    });
  });

  describe('sanitizeTextInput', () => {
    test('removes control characters', () => {
      const input = 'Normal text\x00\x01\x08\x0B\x0C\x0E';
      const result = sanitizeTextInput(input);
      expect(result).toBe('Normal text');
    });

    test('trims whitespace', () => {
      const input = '  Text with spaces  ';
      const result = sanitizeTextInput(input);
      expect(result).toBe('Text with spaces');
    });

    test('limits length', () => {
      const input = 'a'.repeat(1000);
      const result = sanitizeTextInput(input, 100);
      expect(result.length).toBe(100);
    });

    test('handles non-string input', () => {
      expect(sanitizeTextInput(null)).toBe('');
      expect(sanitizeTextInput(undefined)).toBe('');
      expect(sanitizeTextInput(123)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    test('validates correct email', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    test('rejects invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('generateSecureId', () => {
    test('generates ID of correct length', () => {
      const id = generateSecureId(16);
      expect(id.length).toBe(16);
    });

    test('generates unique IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });

    test('generates alphanumeric characters only', () => {
      const id = generateSecureId(100);
      expect(id).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe('validateJSON', () => {
    test('validates correct JSON', () => {
      const result = validateJSON('{"key": "value"}');
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
    });

    test('rejects invalid JSON', () => {
      const result = validateJSON('invalid json');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid JSON format');
    });

    test('handles complex JSON', () => {
      const complexJson = JSON.stringify({
        array: [1, 2, 3],
        nested: { key: 'value' },
        boolean: true,
        null: null
      });
      
      const result = validateJSON(complexJson);
      expect(result.isValid).toBe(true);
      expect(result.data.array).toEqual([1, 2, 3]);
    });
  });
});
