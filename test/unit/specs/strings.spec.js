import utils from '@/utils/js/strings';

describe('utils/js/strings.js', () => {
  it('test for padding', () => {
    const testcases = [
      [0, 2, undefined, '00'],
      [0, 2, 'c', 'c0'],
      [100, 2, 'a', '100'],
      [0, 2, 'cba', 'c0'],
    ];

    testcases.forEach((testcase) => {
      const number = testcase[0];
      const width = testcase[1];
      const char = testcase[2];
      const exceptValue = testcase[3];
      let ret;
      if (char) {
        ret = utils.padding(number, width, char);
      } else {
        ret = utils.padding(number, width);
      }
      expect(ret).to.equal(exceptValue);
    });
  });

  it('test for isValidString', () => {
    const testcases = [
      ['abc', true],
      [' ', false],
      ['   ', false],
      [undefined, false],
      [0, false],
    ];

    testcases.forEach((testcase) => {
      const str = testcase[0];
      const exceptValue = testcase[1];
      expect(utils.isValidString(str)).to.equal(exceptValue);
    });
  });
});
