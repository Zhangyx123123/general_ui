import RangeHandler from './range/handler';
import template from './editor.html';
/**
 * Created by peak on 2017/2/9.
 */
export default {
  template,
  props: {
    content: {
      type: String,
      required: true,
      default: '',
    },
    height: {
      type: Number,
      default: 300,
      validator(val) {
        return val >= 100;
      },
    },
    zIndex: {
      type: Number,
      default: 1000,
    },
    autoHeight: {
      type: Boolean,
      default: true,
    },
    showModuleName: {},
  },
  data() {
    return {
      // defaultShowModuleName:false
      // locale: {},
      // modules:{},
      fullScreen: false,
      dashboard: null,
      dashboardData: {},
      pasting: false,
    };
  },
  watch: {
    content(val) {
      const content = this.$refs.content.innerHTML;
      if (val !== content) {
        this.$refs.content.innerHTML = val;
      }
      this.$emit('update:content', val);
    },
    fullScreen(val) {
      const component = this;
      if (val) {
        component.parentEl = component.$el.parentNode;
        component.nextEl = component.$el.nextSibling;
        document.body.appendChild(component.$el);
        return;
      }
      if (component.nextEl) {
        component.parentEl.insertBefore(component.$el, component.nextEl);
        return;
      }
      component.parentEl.appendChild(component.$el);
    },
  },
  computed: {
    contentStyle() {
      const style = {};
      if (this.fullScreen) {
        style.height = `${window.innerHeight - this.$refs.toolbar.clientHeight - 1}px`;
        return style;
      }
      if (!this.autoHeight) {
        style.height = `${this.height}px`;
        return style;
      }
      style['min-height'] = `${this.height}px`;
      return style;
    },
  },
  methods: {
    showSelection(e) {
      if (!e.target || !e.target.tagName || e.target.tagName.toLowerCase() !== 'input') {
        this.restoreSelection();
      }
    },
    toggleFullScreen() {
      this.fullScreen = !this.fullScreen;
    },
    enableFullScreen() {
      this.fullScreen = true;
    },
    exitFullScreen() {
      this.fullScreen = false;
    },
    focus() {
      this.$refs.content.focus();
    },
    toggleDashboard(dashboard) {
      this.dashboard = this.dashboard === dashboard ? null : dashboard;
    },
    clearFormat(e) {
      if (this.pasting) {
        return;
      }
      this.pasting = true;
      let pastedText = '';
      if (window.clipboardData && window.clipboardData.getData) { // IE
        if (window.clipboardData.clearData) {
          window.clipboardData.clearData(['Image']);
        }
        pastedText = window.clipboardData.getData('Text');
      } else if (e.clipboardData && e.clipboardData.getData) {
        pastedText = e.clipboardData.getData('text/plain');
      }

      if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, pastedText);
      } else {
        // This is used in IE, pasting is used for prevent infinite loop
        // of paste event in IE.
        document.execCommand('paste', false, pastedText);
      }
      e.preventDefault();
      e.stopPropagation();
      this.$emit('change', this.$refs.content.innerHTML);
      this.pasting = false;
    },
    execCommand(command, arg, arg2) {
      this.restoreSelection();
      if (this.range) {
        // customize createLink for set custom text
        if (command === 'createLink') {
          this.range.deleteContents();
          const linkNode = document.createElement('a');
          linkNode.appendChild(document.createTextNode(arg2));
          linkNode.href = arg;
          linkNode.target = '_blank';
          this.range.insertNode(linkNode);
        } else {
          new RangeHandler(this.range).execCommand(command, arg);
        }
      }
      this.toggleDashboard();
      const selection = window.getSelection ? window.getSelection() : document.getSelection();
      selection.removeAllRanges();
      this.$emit('change', this.$refs.content.innerHTML);
    },
    clearTag() {
      const checkContainer = this.range.commonAncestorContainer;
      const removeDOM = [];
      if (checkContainer && checkContainer.children) {
        for (let i = 0; i < checkContainer.children.length; i += 1) {
          if (checkContainer.children[i].innerText === '') {
            removeDOM.push(checkContainer.children[i]);
          }
        }
        removeDOM.forEach((dom) => {
          if (dom.tagName.toLowerCase() === 'a') {
            if (dom.remove) {
              dom.remove();
            } else if (dom.removeNode) {
              // IE
              dom.removeNode();
            }
          }
        });
      }
    },
    getCurrentRange() {
      return this.range;
    },
    saveCurrentRange() {
      const selection = window.getSelection ? window.getSelection() : document.getSelection();
      if (!selection.rangeCount) {
        return;
      }
      const content = this.$refs.content;
      for (let i = 0; i < selection.rangeCount; i += 1) {
        const range = selection.getRangeAt(0);
        let start = range.startContainer;
        let end = range.endContainer;
        // for IE11 : node.contains(textNode) always return false
        start = start.nodeType === Node.TEXT_NODE ? start.parentNode : start;
        end = end.nodeType === Node.TEXT_NODE ? end.parentNode : end;
        if (content.contains(start) && content.contains(end)) {
          this.range = range;
          break;
        }
      }
    },
    restoreSelection() {
      const selection = window.getSelection ? window.getSelection() : document.getSelection();
      selection.removeAllRanges();
      if (this.range) {
        selection.addRange(this.range);
      } else {
        const content = this.$refs.content;
        const div = document.createElement('div');
        const range = document.createRange();
        content.appendChild(div);
        range.setStart(div, 0);
        range.setEnd(div, 0);
        selection.addRange(range);
        this.range = range;
      }
    },
    correctLinkRange() {
      const newRange = document.createRange();

      // range will include partial selected hyperlink
      if (this.range.startContainer === this.range.endContainer && this.range.startContainer.parentNode.tagName.toLowerCase() === 'a') {
        newRange.setStart(this.range.startContainer, 0);
        newRange.setEnd(this.range.endContainer, this.range.endContainer.length);
      } else {
        if (this.range.startContainer.parentNode.tagName.toLowerCase() === 'a') {
          newRange.setStart(this.range.startContainer, 0);
        } else {
          newRange.setStart(this.range.startContainer, this.range.startOffset);
        }
        if (this.range.endContainer.parentNode.tagName.toLowerCase() === 'a') {
          newRange.setEnd(this.range.endContainer, this.range.endContainer.length);
        } else {
          newRange.setEnd(this.range.endContainer, this.range.endOffset);
        }
      }
      let startRootDiv = newRange.startContainer;
      let endRootDiv = newRange.endContainer;
      while (startRootDiv.nodeType !== 1 || (startRootDiv.tagName && startRootDiv.tagName.toLowerCase() !== 'div')) {
        startRootDiv = startRootDiv.parentNode;
      }
      while (endRootDiv.nodeType !== 1 || (endRootDiv.tagName && endRootDiv.tagName.toLowerCase() !== 'div')) {
        endRootDiv = endRootDiv.parentNode;
      }

      if (startRootDiv !== endRootDiv) {
        if (startRootDiv.className === 'content') {
          // the start is first line of content
          newRange.setEnd(startRootDiv, 1);
        } else {
          // start not at first line
          newRange.setEnd(startRootDiv, startRootDiv.childNodes.length);
        }
      }

      this.range = newRange;
    },
    activeModule(module) {
      if (typeof module.handler === 'function') {
        module.handler(this);
        return;
      }
      if (module.hasDashboard) {
        this.toggleDashboard(`dashboard-${module.name}`);

        this.dashboardData = {};

        if (module.name === 'link') {
          this.correctLinkRange();
          const url = this.findInRange(this.range.startContainer, this.range.endContainer, 'url');
          const text = this.range.toString();
          this.dashboardData = {
            url,
            text,
          };
        }

        if (module.name === 'font') {
          const fontSize = this.findInRange(this.range.startContainer, this.range.endContainer, 'font-size');
          // const fontSize = parseInt(parent.style.fontSize.replace(/px/g, ''), 10);
          if (fontSize) {
            this.dashboardData = {
              fontSize,
            };
          }
        }
      }
    },
    getNodeHref(node) {
      if (node.tagName && node.tagName.toLowerCase() === 'a') {
        return node.getAttribute('href');
      }
      return '';
    },
    getNodeFontSize(node) {
      if (node.style && node.style.fontSize) {
        return node.style.fontSize.replace(/px/g, '');
      }
      return undefined;
    },
    findInRange(start, end, type) {
      let getter = this.getNodeHref;
      if (type === 'font-size') {
        getter = this.getNodeFontSize;
      }
      let checkContainer = start;
      let ret = '';
      let forceBreak = false;

      if (start === end) {
        // if select in one component, the value should be inherited from parent
        while (checkContainer.parentNode) {
          checkContainer = checkContainer.parentNode;
          ret = getter.call(this, checkContainer);
          if (ret) {
            break;
          } else if (checkContainer.parentNode === this.$refs.content) {
            // if parent is editor, search to end, this is an unexpected condition.
            forceBreak = true;
            break;
          }
          // continue to go next parent
        }
      } else {
        while (!forceBreak) {
          ret = getter.call(this, checkContainer);
          // if get url from current node, exit
          if (ret) {
            break;
          } else if (checkContainer === end) {
          // search to the end, exit
            break;
          } else if (checkContainer.childNodes && checkContainer.childNodes.length > 0) {
          // if has childNode, go in it
            checkContainer = checkContainer.childNodes[0];
          } else if (checkContainer.nextSibling) {
          // if no childNode but has sibling, go sibling
            checkContainer = checkContainer.nextSibling;
          } else {
          // no childNode and no sibling, go parent
            while (checkContainer.parentNode) {
              checkContainer = checkContainer.parentNode;
              ret = getter.call(this, checkContainer);
              if (ret) {
                break;
              } else if (checkContainer.parentNode === this.$refs.content) {
                // if parent is editor, search to end, this is an unexpected condition.
                forceBreak = true;
                break;
              } else if (checkContainer.nextSibling) {
                // if go parent, and parent has sibling, go to sibling
                checkContainer = checkContainer.nextSibling;
                break;
              }
              // if node has no sibling, continue to go next parent
            }
          }
        }
      }

      return ret;
    },
  },
  created() {
    this.modules.forEach((module) => {
      if (typeof module.init === 'function') {
        module.init(this);
      }
    });
  },
  mounted() {
    const content = this.$refs.content;
    content.innerHTML = this.content;
    content.addEventListener('mouseup', this.saveCurrentRange, false);
    content.addEventListener('keyup', () => {
      this.$emit('change', content.innerHTML);
      this.saveCurrentRange();
    }, false);
    content.addEventListener('mouseout', (e) => {
      if (e.target === content) {
        this.saveCurrentRange();
      }
    }, false);
    this.touchHandler = (e) => {
      if (content.contains(e.target)) {
        this.saveCurrentRange();
      }
    };

    window.addEventListener('touchend', this.touchHandler, false);
  },
  updated() {
    // update dashboard style
    if (this.$refs.dashboard) {
      this.$refs.dashboard.style.maxHeight = `${this.$refs.content.clientHeight}px`;
    }
  },
  beforeDestroy() {
    window.removeEventListener('touchend', this.touchHandler);
    this.modules.forEach((module) => {
      if (typeof module.destroyed === 'function') {
        module.destroyed(this);
      }
    });
  },
};
