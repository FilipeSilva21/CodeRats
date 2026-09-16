export interface StorageInterface {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export let sharedStorage: StorageInterface | null = null;

export const injectStorage = (storageImpl: StorageInterface) => {
  sharedStorage = storageImpl;
};
