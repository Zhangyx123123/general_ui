import template from './dashboard.html';
import Command from '../../range/command';
/**
 * Created by peak on 2017/2/10.
 */
export default {
  template,
  props: {
    data: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      nameList: [
        'Microsoft YaHei',
        'Helvetica Neue',
        'Helvetica',
        'Arial',
        'sans-serif',
        'Verdana',
        'Georgia',
        'Times New Roman',
        'Trebuchet MS',
        'Microsoft JhengHei',
        'Courier New',
        'Impact',
        'Comic Sans MS',
        'Consolas',
      ],
      lineHeightList: [
        '1.0', '1.2', '1.5', '1.8', '2.0', '2.5', '3.0',
      ],
      fontSizeList: [
        '6', '8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72',
      ],
      setSize: 10.5,
      showTextSizeList: false,
      defaultSize: 10.5,
    };
  },
  methods: {
    setFontName(name) {
      this.$parent.execCommand('fontName', name);
    },
    setFontSize(size) {
      this.$parent.execCommand('fontSize', `${size}px`);
      this.setSize = this.defaultSize;
    },
    setHeading(heading) {
      this.$parent.execCommand('formatBlock', `h${heading}`);
    },
    setLineHeight(lh) {
      this.$parent.execCommand(Command.LINE_HEIGHT, lh);
    },
    checkSizeValue() {
      // Change all not integer to x.5
      const intPart = parseInt(this.setSize, 10);
      if (this.setSize > intPart) {
        this.setSize = intPart + 0.5;
      }
      if (this.setSize > 409) {
        this.setSize = 409;
      }
      if (this.setSize < 1) {
        this.setSize = 1;
      }
    },
    toggleShowList() {
      this.showTextSizeList = !this.showTextSizeList;
    },
    clickOutside(e) {
      if (!e.target.className || e.target.className !== 'size-select-button') {
        this.showTextSizeList = false;
      }
    },
    selectSize(size) {
      this.setSize = size;
      this.showTextSizeList = false;
    },
    setUpSize() {
      this.setSize = this.data.fontSize || this.defaultSize;
    },
  },
  created() {
    const config = this.$options.module.config;
    // font name
    if (!config) {
      return;
    }
    if (Array.isArray(config.fontNames)) {
      this.nameList = config.fontNames;
    }
  },
  activated() {
    this.setUpSize();
  },
  mounted() {
    this.setUpSize();
  },
};
