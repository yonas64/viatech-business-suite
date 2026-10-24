import * as SecureStore from 'expo-secure-store';

export const loadSavedToken = (key: string) => SecureStore.getItemAsync(key);
export const saveToken = (key: string, value: string) => SecureStore.setItemAsync(key, value);
export const clearSavedToken = (key: string) => SecureStore.deleteItemAsync(key);
