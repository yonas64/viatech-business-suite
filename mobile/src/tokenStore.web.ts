let savedToken: string | null = null;

export async function loadSavedToken(_key: string) {
  return savedToken;
}

export async function saveToken(_key: string, value: string) {
  savedToken = value;
}

export async function clearSavedToken(_key: string) {
  savedToken = null;
}
