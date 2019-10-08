import utils from '@/utils/js/object';

const jsonTestcases = {
  'empty check': [{}, {}, true],
  basic: [{}, 1, false],
  'key count not same': [{ a: 1, b: 2 }, { a: 1 }, false],
  'key value type not same': [{ a: 1, b: 2 }, { a: 1, b: { c: 1 } }, false],
  'key value not same': [{ a: 1, b: 2 }, { a: 1, b: 3 }, false],
  'key not same': [{ a: 1, b: 2 }, { a: 1, c: 2 }, false],
  same: [{ a: 1, b: 2 }, { a: 1, b: 2 }, true],
  'recursive same': [{ a: 1, b: { c: 1, d: 2 } }, { a: 1, b: { c: 1, d: 2 } }, true],
  'diff in 2nd level': [{ a: 1, b: { c: 1, d: 2 } }, { a: 1, b: { c: 1, d: 3 } }, false],
  'diff in 1nd level': [{ a: 1, b: { c: 1, d: 2 } }, { a: 2, b: { c: 1, d: 2 } }, false],
  'contain null': [{ a: null }, { a: 1 }, false],
  null: [null, { a: 1 }, false],
};

describe('utils/js/object.js', () => {
  const tests = Object.keys(jsonTestcases);
  tests.forEach((testname) => {
    it(`Test jsonEqual for ${testname}`, () => {
      const testcase = jsonTestcases[testname];
      const obj1 = testcase[0];
      const obj2 = testcase[1];
      const exceptValue = testcase[2];
      const ret = utils.jsonEqual(obj1, obj2);
      expect(ret).to.equal(exceptValue);
    });
  });
});
