import Storage from 'expo-sqlite/kv-store';

export interface UseLocalStorageReturn {
  setItem: (key: string, value: any) => void;
  getItem: (key: string) => any;
  removeItem: (key: string) => void;
  checkItem: (key: string) => boolean;
}

export const setItem = (key: string, value: any) => {
  Storage.setItemSync(key, value);
};

export const getItem = (key: string) => {
  return Storage.getItemSync(key);
};

export const useLocalStorage = (): UseLocalStorageReturn => {
  const setItem = (key: string, value: any) => {
    Storage.setItemSync(key, value);
  };

  const getItem = (key: string) => {
    return Storage.getItemSync(key);
  };

  const removeItem = (key: string) => {
    Storage.removeItemSync(key);
  };

  const checkItem = (key: string) => {
    return Storage.getItemSync(key) !== null;
  };

  return { setItem, getItem, removeItem, checkItem };
};
