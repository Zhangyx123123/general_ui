// import axios from 'axios';

function getPrivileges() {
  return new Promise((resolve) => {
    const privileges = {
      module1: {
        name: 'MODULE1',
        actions: ['view', 'edit', 'write'],
      },
      module2: {
        name: 'MODULE2',
        actions: ['view', 'edit'],
      },
    };
    setTimeout(() => {
      resolve(privileges);
    }, 0);
  });
}
export default {
  getPrivileges,
};
