const mockSecureStore: Record<string, string> = {};

export const setItemAsync = jest.fn(async (key: string, value: string) => {
  mockSecureStore[key] = value;
});

export const getItemAsync = jest.fn(async (key: string) => {
  return mockSecureStore[key] ?? null;
});

export const deleteItemAsync = jest.fn(async (key: string) => {
  delete mockSecureStore[key];
});

export const _reset = () => {
  Object.keys(mockSecureStore).forEach(k => delete mockSecureStore[k]);
  (setItemAsync as jest.Mock).mockClear();
  (getItemAsync as jest.Mock).mockClear();
  (deleteItemAsync as jest.Mock).mockClear();
};
