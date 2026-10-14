const InAppReview = {
  isAvailable: jest.fn(() => Promise.resolve(true)),
  requestReview: jest.fn(() => Promise.resolve()),
  openStoreListing: jest.fn((_appId: string | null) => Promise.resolve()),
};

export default InAppReview;
