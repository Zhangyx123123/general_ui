import utils from '@/utils/js/validate';

const passwordTestcases = [
  ['abc', false],
  ['csbot@1', false],
  ['Csbot@1', true],
];
const emailTestcases = [
  ['abc@123.com', true],
  ['abcde', false],
  ['a.b.c@hotmail.com', true],
];
const usernameTestcases = [
  ['abcde', true],
  ['aaa!123', false],
];
const phoneTestcases = [
  ['0222221111', true],
  ['02-22221111', true],
  ['0922-222222', true],
  ['0922-222-222', true],
  ['0922222222', true],

  ['24478957', true],
  ['13256713088', true],

  ['', false],
  ['abc', false],
  ['0', false],
];
const labelTestcases = [
  ['標籤', true],
  ['abc', true],
  ['A 0 B', true],

  ['A 0-B', false],
  ['A/B', false],
  ['，', false],
];

const testConfig = [
  ['isValidPassword', passwordTestcases, utils.isValidPassword],
  ['isValidEmail', emailTestcases, utils.isValidEmail],
  ['isValidUserName', usernameTestcases, utils.isValidUserName],
  ['isValidPhone', phoneTestcases, utils.isValidPhone],
  ['isValidLabel', labelTestcases, utils.isValidLabel],
];

describe('utils/js/validate.js', () => {
  testConfig.forEach((config) => {
    const [name, testcases, func] = config;
    testcases.forEach((testcase) => {
      const [val, excepted] = testcase;

      it(`Test ${name} for ${val}`, () => {
        const ret = func(val);
        expect(ret).to.equal(excepted);
      });
    });
  });
});
