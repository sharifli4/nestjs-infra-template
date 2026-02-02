import nodeVault from 'node-vault';

interface VaultResponse {
  data?: {
    data?: Record<string, unknown>;
  };
}

export const vaultLoader = async (): Promise<Record<string, unknown>> => {
  try {
    const vaultClient = nodeVault({
      endpoint: process.env.VAULT_ADDR,
      token: process.env.VAULT_TOKEN,
      apiVersion: 'v1',
    });

    const response = (await vaultClient.read(
      `${process.env.MOUNT_PATH ?? ''}/data/${process.env.SECRET_PATH ?? ''}`,
    )) as VaultResponse;

    if (!response?.data?.data) {
      throw new Error('Secret not found in Vault');
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch secrets from Vault: ${error.message}`);
    }
    throw new Error('Failed to fetch secrets from Vault');
  }
};
