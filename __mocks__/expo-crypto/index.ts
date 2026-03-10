export enum CryptoDigestAlgorithm {
  SHA256 = 'SHA-256',
}

export enum CryptoEncoding {
  BASE64 = 'base64',
}

export const getRandomBytesAsync = jest.fn(async (byteCount: number): Promise<Uint8Array> => {
  const buf = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) buf[i] = Math.floor(Math.random() * 256);
  return buf;
});

export const digestStringAsync = jest.fn(
  async (
    _algorithm: CryptoDigestAlgorithm,
    data: string,
    _options?: { encoding: CryptoEncoding },
  ): Promise<string> => {
    // Return a deterministic but simple base64-like string for testing
    return Buffer.from(data).toString('base64');
  },
);
