/**
 * Generates a unique 10-character alphanumeric code
 * Format: XXXX-XXXX-XX (uppercase letters and numbers)
 */
export function generateUniqueCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""

  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  // Format: XXXX-XXXX-XX
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 10)}`
}

/**
 * Validates if a code matches the expected format
 */
export function isValidCode(code: string): boolean {
  const codeRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{2}$/
  return codeRegex.test(code)
}
