import { hashPassword, verifyPassword } from './password.util';

describe('password util', () => {
  it('hashes and verifies a valid password', async () => {
    const hashed = await hashPassword('secret123');

    expect(hashed).toContain(':');
    await expect(verifyPassword('secret123', hashed)).resolves.toBe(true);
    await expect(verifyPassword('wrong-pass', hashed)).resolves.toBe(false);
  });

  it('returns false for malformed hash payload', async () => {
    await expect(verifyPassword('secret123', 'broken-hash')).resolves.toBe(
      false,
    );
  });
});
