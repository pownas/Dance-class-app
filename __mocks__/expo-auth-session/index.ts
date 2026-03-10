export const makeRedirectUri = jest.fn((_options?: object): string => {
  return 'dance-class-app://auth/callback';
});

export const openAuthSessionAsync = jest.fn(
  async (_url: string, _redirectUrl?: string): Promise<{ type: string; url?: string }> => {
    return { type: 'dismiss' };
  },
);
