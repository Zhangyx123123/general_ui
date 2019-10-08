const displayNameMinlength = 2;
const displayNameMaxlength = 50;
const phoneMaxlength = 20;

function isValidPassword(input) {
  const validRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9~@!#$%^&*()[\]{}:;"',./?<>+\-=|_ ]{6,16}$/g;
  return validRegex.test(input);
}

function isValidEmail(input) {
  const validRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/g;
  return validRegex.test(input);
}

function isValidUserName(input) {
  const validRegex = /^[\w\d@._-]{4,64}$/g;
  return validRegex.test(input);
}

function isValidPhone(input) {
  const validRegex = /^(?!-)[0-9-]+[0-9]+$/g;
  return validRegex.test(input);
}

function isValidDisplayName(input) {
  return input.length >= displayNameMinlength && input.length <= displayNameMaxlength;
}

function isValidLabel(input) {
  if (input.trim().length === 0) return false;
  const validRegex = /^[A-Za-z0-9\u4E00-\u9FA5 ]{1,10}$/g;
  return validRegex.test(input);
}

export default {
  isValidPassword,
  isValidEmail,
  isValidUserName,
  isValidPhone,
  isValidDisplayName,
  isValidLabel,
  displayNameMaxlength,
  phoneMaxlength,
};
