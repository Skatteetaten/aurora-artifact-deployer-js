import { getLastUpdatedTime } from './date';

describe('Date', (): void => {
  it('should add zero to the every date sections', (): void => {
    const date = new Date('August 26, 2019 20:08:00');
    const time = getLastUpdatedTime(date);
    expect(time).toBe('20190826200800');
  });
});
