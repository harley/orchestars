// Normalize Vietnamese phone numbers to +84 format and validate
export function normalizeVietnamesePhoneNumber(phone: string): string {
    let p = phone.trim().replace(/[^\d+]/g, '');
    if (p.startsWith('00')) {
      p = '+' + p.slice(2);
    }
    if (p.startsWith('0')) {
      p = '+84' + p.slice(1);
    } else if (p.startsWith('+84')) {
      // already correct
    } else if (p.startsWith('84')) {
      p = '+84' + p.slice(2);
    }
  //   // Validate Vietnamese phone number: +84 followed by 9 or 10 digits
  //   if (!/^\+84\d{9,10}$/.test(p)) {
  //     throw new Error('Invalid Vietnamese phone number format');
  //   }
    return p;
  }