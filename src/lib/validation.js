// Enforces the +91 country code and a valid 10-digit Indian mobile
// number (starting with 6-9), e.g. +919876543210.
const INDIAN_MOBILE_REGEX = /^\+91[6-9]\d{9}$/;

export function isValidIndianMobile(value) {
  return INDIAN_MOBILE_REGEX.test((value || '').trim());
}

export const MOBILE_HINT = 'Must start with +91 followed by a 10-digit number, e.g. +919876543210';
