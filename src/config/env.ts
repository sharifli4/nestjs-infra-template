/**
 * Environment variable accessor for infrastructure configuration
 * This should only be used for infrastructure-level config checks
 */
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  // Optional Features - Developers can enable/disable as needed
  USE_DATABASE: process.env.USE_DATABASE === 'true',
  USE_REDIS: process.env.USE_REDIS === 'true',
  USE_VAULT: process.env.USE_VAULT === 'true',

  // Vault configuration (only used if USE_VAULT=true)
  VAULT_ADDR: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
  VAULT_TOKEN: process.env.VAULT_TOKEN || '',
  SECRET_PATH: process.env.SECRET_PATH || '',
  MOUNT_PATH: process.env.MOUNT_PATH || 'secret',
};
