// Mirrors backend/utils/passwordPolicy.js + commonPasswords.js — keep these in sync.
const COMMON_PASSWORDS = new Set([
  '123456', '123456789', '12345678', '12345', '1234567', '1234567890',
  'password', 'password1', 'password123', 'passw0rd', 'letmein', 'welcome',
  'qwerty', 'qwerty123', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  'abc123', 'abcd1234', '111111', '000000', '123123', '1q2w3e4r',
  'iloveyou', 'admin', 'administrator', 'root', 'guest', 'test', 'testing',
  'monkey', 'dragon', 'master', 'shadow', 'superman', 'batman', 'trustno1',
  'sunshine', 'princess', 'football', 'baseball', 'basketball', 'soccer',
  'michael', 'jennifer', 'jordan', 'hunter', 'freedom', 'whatever',
  'starwars', 'letmein123', 'login', 'passwordq', 'changeme', 'default',
  'homeinventory', 'inventory', 'welcome1', 'welcome123',
]);

export const PASSWORD_REQUIREMENTS = [
  { key: 'length', label: 'At least 12 characters', test: (pw) => pw.length >= 12 },
  { key: 'uppercase', label: 'One uppercase letter (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lowercase', label: 'One lowercase letter (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { key: 'number', label: 'One number (0-9)', test: (pw) => /[0-9]/.test(pw) },
  { key: 'special', label: 'One special character (!@#$%^&* etc.)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
  {
    key: 'notCommon',
    label: 'Not a commonly used password',
    test: (pw) => !COMMON_PASSWORDS.has(pw.toLowerCase()),
  },
];

export function checkPassword(password) {
  const pw = typeof password === 'string' ? password : '';
  const results = PASSWORD_REQUIREMENTS.map((r) => ({ key: r.key, label: r.label, met: r.test(pw) }));
  return { valid: results.every((r) => r.met), results };
}
