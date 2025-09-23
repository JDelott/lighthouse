import CryptoJS from 'crypto-js';

// HIPAA-compliant encryption utilities
// In production, these keys should be stored in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required for security');
}
const IV_LENGTH = 16; // For AES, this is always 16

export interface EncryptedData {
  encrypted: string;
  iv: string;
  timestamp: string;
}

/**
 * Encrypts sensitive data using AES-256-CBC
 * @param data - The data to encrypt
 * @returns Encrypted data object with IV and timestamp
 */
export const encryptSensitiveData = (data: string): EncryptedData => {
  try {
    // Generate random IV for each encryption
    const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);
    
    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return {
      encrypted: encrypted.toString(),
      iv: iv.toString(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
};

/**
 * Decrypts sensitive data
 * @param encryptedData - The encrypted data object
 * @returns Decrypted string
 */
export const decryptSensitiveData = (encryptedData: EncryptedData): string => {
  try {
    const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, ENCRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error('Decryption resulted in empty string');
    }
    
    return decryptedString;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
};

/**
 * Encrypts PHI (Protected Health Information) fields
 * @param patient - Patient object with PHI
 * @returns Patient object with encrypted PHI
 */
export const encryptPatientPHI = (patient: any): any => {
  const encryptedPatient = { ...patient };
  
  // Encrypt sensitive fields
  if (patient.dateOfBirth) {
    encryptedPatient.dateOfBirth = encryptSensitiveData(patient.dateOfBirth);
  }
  
  if (patient.phone) {
    encryptedPatient.phone = encryptSensitiveData(patient.phone);
  }
  
  if (patient.email) {
    encryptedPatient.email = encryptSensitiveData(patient.email);
  }
  
  if (patient.address) {
    encryptedPatient.address = {
      street: encryptSensitiveData(patient.address.street),
      city: encryptSensitiveData(patient.address.city),
      state: encryptSensitiveData(patient.address.state),
      zipCode: encryptSensitiveData(patient.address.zipCode)
    };
  }
  
  if (patient.insuranceId) {
    encryptedPatient.insuranceId = encryptSensitiveData(patient.insuranceId);
  }
  
  if (patient.emergencyContact) {
    encryptedPatient.emergencyContact = {
      ...patient.emergencyContact,
      phone: encryptSensitiveData(patient.emergencyContact.phone)
    };
  }
  
  return encryptedPatient;
};

/**
 * Decrypts PHI fields
 * @param encryptedPatient - Patient object with encrypted PHI
 * @returns Patient object with decrypted PHI
 */
export const decryptPatientPHI = (encryptedPatient: any): any => {
  const patient = { ...encryptedPatient };
  
  try {
    // Decrypt sensitive fields
    if (encryptedPatient.dateOfBirth && typeof encryptedPatient.dateOfBirth === 'object') {
      patient.dateOfBirth = decryptSensitiveData(encryptedPatient.dateOfBirth);
    }
    
    if (encryptedPatient.phone && typeof encryptedPatient.phone === 'object') {
      patient.phone = decryptSensitiveData(encryptedPatient.phone);
    }
    
    if (encryptedPatient.email && typeof encryptedPatient.email === 'object') {
      patient.email = decryptSensitiveData(encryptedPatient.email);
    }
    
    if (encryptedPatient.address && typeof encryptedPatient.address.street === 'object') {
      patient.address = {
        street: decryptSensitiveData(encryptedPatient.address.street),
        city: decryptSensitiveData(encryptedPatient.address.city),
        state: decryptSensitiveData(encryptedPatient.address.state),
        zipCode: decryptSensitiveData(encryptedPatient.address.zipCode)
      };
    }
    
    if (encryptedPatient.insuranceId && typeof encryptedPatient.insuranceId === 'object') {
      patient.insuranceId = decryptSensitiveData(encryptedPatient.insuranceId);
    }
    
    if (encryptedPatient.emergencyContact && typeof encryptedPatient.emergencyContact.phone === 'object') {
      patient.emergencyContact = {
        ...encryptedPatient.emergencyContact,
        phone: decryptSensitiveData(encryptedPatient.emergencyContact.phone)
      };
    }
  } catch (error) {
    console.error('Failed to decrypt patient PHI:', error);
    throw new Error('Failed to decrypt patient information');
  }
  
  return patient;
};

/**
 * Hashes sensitive data for searching/indexing while maintaining privacy
 * @param data - The data to hash
 * @returns SHA-256 hash
 */
export const hashForIndex = (data: string): string => {
  return CryptoJS.SHA256(data + ENCRYPTION_KEY).toString();
};

/**
 * Creates a secure audit trail hash
 * @param auditData - The audit data to hash
 * @returns Secure hash for audit integrity
 */
export const createAuditHash = (auditData: any): string => {
  const dataString = JSON.stringify(auditData);
  return CryptoJS.SHA256(dataString + ENCRYPTION_KEY + new Date().toISOString()).toString();
};

/**
 * Verifies audit trail integrity
 * @param auditData - The audit data
 * @param expectedHash - The expected hash
 * @returns Boolean indicating if audit data is intact
 */
export const verifyAuditIntegrity = (auditData: any, expectedHash: string): boolean => {
  try {
    const calculatedHash = createAuditHash(auditData);
    return calculatedHash === expectedHash;
  } catch (error) {
    console.error('Audit verification failed:', error);
    return false;
  }
};

/**
 * Securely generates a random ID
 * @returns Cryptographically secure random ID
 */
export const generateSecureId = (): string => {
  const randomBytes = CryptoJS.lib.WordArray.random(16);
  return randomBytes.toString();
};

/**
 * Masks sensitive data for display purposes
 * @param data - The data to mask
 * @param visibleChars - Number of characters to show at the end
 * @returns Masked string
 */
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  
  const masked = '*'.repeat(data.length - visibleChars);
  const visible = data.slice(-visibleChars);
  
  return masked + visible;
};

/**
 * Validates encryption key strength
 * @param key - The encryption key to validate
 * @returns Boolean indicating if key meets security requirements
 */
export const validateEncryptionKey = (key: string): boolean => {
  // Key should be at least 32 characters for AES-256
  if (key.length < 32) return false;
  
  // Should contain mix of characters
  const hasUppercase = /[A-Z]/.test(key);
  const hasLowercase = /[a-z]/.test(key);
  const hasNumbers = /\d/.test(key);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(key);
  
  return hasUppercase && hasLowercase && hasNumbers && hasSpecialChars;
};
