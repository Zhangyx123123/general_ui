function checkExistedFunction(ret, name) {
  if (Object.hasOwnProperty.call(ret, name)) {
    console.warn(`Function: ${name} existed`);
  }
}

const MyPlugin = {
  install(Vue) {
    Vue.mixin({
      created() {
        const that = this;
        const functions = this.$options.api;
        if (functions !== undefined) {
          const ret = {};
          if (Array.isArray(functions)) {
            functions.forEach((mod) => {
              Object.getOwnPropertyNames(mod).forEach((key) => {
                checkExistedFunction(ret, key);
                if (typeof mod[key] === 'function') {
                  ret[key] = mod[key].bind(that);
                }
              });
            });
            this.$api = ret;
          } else {
            Object.getOwnPropertyNames(functions).forEach((key) => {
              checkExistedFunction(ret, key);
              if (typeof functions[key] === 'function') {
                ret[key] = functions[key].bind(that);
              }
            });
          }
          this.$api = ret;
        }
      },
    });
  },
};

export default MyPlugin;
