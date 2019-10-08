import template from './dashboard.html';

export default {
  template,
  props: {
    data: {
      type: Object,
      default: {},
    },
  },
  data() {
    return { url: null };
  },
  methods: {
    createLink() {
      if (!this.url) {
        return;
      }
      this.$parent.execCommand('createLink', this.url, this.data.text);
      this.url = null;
    },
    setUpURL() {
      this.url = this.data.url || '';
    },
  },
  activated() {
    this.setUpURL();
  },
  mounted() {
    this.setUpURL();
  },
};
