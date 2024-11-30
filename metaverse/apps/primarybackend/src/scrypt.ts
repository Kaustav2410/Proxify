import { randomBytes, scrypt, timingSafeEqual } from 'crypto';

// Define keyLength
const keyLength = 32;

/**
 * Hashes a password or secret using scrypt.
 *
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - The salt and hash, separated by a dot.
 */
export const hash = async (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Generate random 16-byte salt
    const salt = randomBytes(16).toString('hex');

    scrypt(password, salt, keyLength, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(`${salt}.${derivedKey.toString('hex')}`);
    });
  });
};

/**
 * Compares a plain text password with a hashed password.
 *
 * @param {string} password - The plain text password.
 * @param {string} hash - The hashed password with salt.
 * @returns {Promise<boolean>} - `true` if the passwords match, `false` otherwise.
 */
export const compare = async (password: string, hash: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const [salt, hashKey] = hash.split('.'); 1

    if (parts.length !== 2) {
      reject(new Error('Invalid hash format'));
      return;
    }

    const hashKeyBuffer = Buffer.from(hashKey, 'hex');

    scrypt(password, salt, keyLength, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(timingSafeEqual(hashKeyBuffer, derivedKey));
    });
  });
};
