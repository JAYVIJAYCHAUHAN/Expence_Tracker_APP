/**
 * Security utilities for Expense Tracker v2.0.0
 * Helps prevent sensitive data exposure and improves security
 */

// List of fields that should be redacted in logs and error reports
const SENSITIVE_FIELDS = [
  'password', 
  'token', 
  'authToken',
  'apiKey', 
  'secret',
  'cardNumber',
  'cvv',
  'expiry',
  'pin',
  'ssn',
  'taxId'
];

/**
 * Sanitizes an object by redacting sensitive fields
 * @param data Object to sanitize
 * @returns Sanitized object with sensitive fields redacted
 */
export function sanitizeData(data: any): any {
  if (!data) return data;
  
  if (typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Creates a sanitized version of console methods that redacts sensitive information
 */
export function setupSecureLogging(): void {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;
  
  console.log = function(...args: any[]) {
    originalConsoleLog(...args.map(arg => 
      typeof arg === 'object' && arg !== null ? sanitizeData(arg) : arg
    ));
  };
  
  console.error = function(...args: any[]) {
    originalConsoleError(...args.map(arg => 
      typeof arg === 'object' && arg !== null ? sanitizeData(arg) : arg
    ));
  };
  
  console.warn = function(...args: any[]) {
    originalConsoleWarn(...args.map(arg => 
      typeof arg === 'object' && arg !== null ? sanitizeData(arg) : arg
    ));
  };
  
  console.info = function(...args: any[]) {
    originalConsoleInfo(...args.map(arg => 
      typeof arg === 'object' && arg !== null ? sanitizeData(arg) : arg
    ));
  };
}

/**
 * Sanitizes request data by removing sensitive information
 * @param config Axios request config
 * @returns Sanitized config
 */
export function sanitizeRequestData(config: any): any {
  if (config.data) {
    const sanitizedData = sanitizeData(JSON.parse(JSON.stringify(config.data)));
    return {
      ...config,
      data: sanitizedData
    };
  }
  return config;
}

/**
 * Clear all sensitive data from localStorage
 */
export function clearSensitiveData(): void {
  localStorage.removeItem('token');
  sessionStorage.clear();
  document.cookie.split(';').forEach(cookie => {
    document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
}

/**
 * Validates that a string doesn't contain any dangerous content
 * @param input String to validate
 * @returns Whether the string is safe
 */
export function isInputSafe(input: string): boolean {
  if (!input) return true;
  
  // Check for potential script injection
  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  if (scriptPattern.test(input)) return false;
  
  // Check for SQL injection patterns
  const sqlInjectionPattern = /(\b(select|insert|update|delete|from|where|drop|union|table|database)\b|\b(--|;))/gi;
  if (sqlInjectionPattern.test(input)) return false;
  
  return true;
} 