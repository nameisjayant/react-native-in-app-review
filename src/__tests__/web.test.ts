// Jest resolves './InAppReview' to the .native file, so load the web fallback by its full name.
const { isAvailable, openStoreListing, requestReview } =
  jest.requireActual<typeof import('../InAppReview')>('../InAppReview.ts');

describe('web fallback', () => {
  it('reports the prompt as unavailable', async () => {
    await expect(isAvailable()).resolves.toBe(false);
  });

  it('rejects review requests as unsupported', async () => {
    await expect(requestReview()).rejects.toMatchObject({
      code: 'UNSUPPORTED',
    });
    await expect(openStoreListing()).rejects.toMatchObject({
      code: 'UNSUPPORTED',
    });
  });
});
