export default {
  methods: {
    $startPageLoading(msg) {
      this.$emit('startLoading', msg);
    },
    $endPageLoading() {
      this.$emit('endLoading');
    },
  },
};
