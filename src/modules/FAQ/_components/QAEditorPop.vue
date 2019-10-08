<template>
  <div id="qa-answer-editor" :class="{'fit-parent': extData.fitParent}">
    <label v-if="remain >= 0">{{ $t('qalist.remain_content_length') }}:  {{ remain }}</label>
    <label class="error" v-else>{{ $t('qalist.word_over_limit') }}</label>
    <vue-html5-editor :content="decode(value.content)" @change="updateData" :auto-height="false"></vue-html5-editor>
  </div>
</template>

<script>
import Vue from 'vue';
import VueHtml5Editor from '@/components/Editor';

const editorOptions = {
  name: 'vue-html5-editor',
  hiddenModules: ['tabulation', 'hr', 'full-screen', 'info', 'undo'],
  image: {
    // 文件最大体积，单位字节  max file size
    // Set size to 1 MB for now, it may changed by VIP required
    sizeLimit: 1024 * 1024,
    // 上传参数,默认把图片转为base64而不上传
    // upload config,default null and convert image to base64
    upload: {
      url: '/php/api/ApiKey/vip_custom_question/vip_upload_answer_image.php',
      headers: {},
    },
    // 压缩参数,默认使用localResizeIMG进行压缩,设置为null禁止压缩
    // compression config,default resize image by localResizeIMG (https://github.com/think2011/localResizeIMG)
    // set null to disable compression
    compress: null,
    // 响应数据处理,最终返回图片链接
    // handle response data，return image url
    uploadHandler(responseText) {
      // default accept json data like  {ok:false,msg:"unexpected"} or {ok:true,data:"image url"}
      const json = JSON.parse(responseText);
      return json.path;
    },
  },
  language: 'zh-cn',
};

Vue.use(VueHtml5Editor, editorOptions);

export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
    extData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      remain: 10000,
      MAXLENG: 10000,
    };
  },
  mounted() {
    this.remain = this.MAXLENG - this.value.content.length;
  },
  methods: {
    decode(content) {
      // treat @E@ as newline symbol
      let escapedContent = '';
      const lines = content.split('@E@');
      if (lines.length > 1) {
        escapedContent = lines.join('</div><div>');
        escapedContent = escapedContent.trim();
        if (!escapedContent.startsWith('<div>')) {
          escapedContent = `<div>${escapedContent}`;
        }
        if (!escapedContent.endsWith('</div>')) {
          escapedContent = `${escapedContent}</div>`;
        }
      } else {
        escapedContent = content;
      }
      escapedContent = escapedContent.replace(/<script>/g, '<x-script>');
      escapedContent = escapedContent.replace(/<\/script>/g, '</x-script>');
      return escapedContent;
    },
    updateData(newContent) {
      this.value.newContent = newContent;
      this.remain = this.MAXLENG - newContent.length;

      if (this.remain < 0) {
        this.$emit('disableOK', {});
        return;
      }

      if (/\S/.test(newContent.replace(/&nbsp;/g, ''))) {
        this.$emit('updateData', newContent);
        this.$emit('enableOK', {});
      } else {
        this.$emit('disableOK', {});
      }
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
#qa-answer-editor {
  width: 800px;
  &.fit-parent {
    width: 100%;
  }
  /deep/ .content {
    ul {
      li::before {
        content: "\2022";
        margin-right: 5px;
        display: inline-block;
      }
    }

    ol {
      counter-reset: list-item-counter;
      li {
        counter-increment: list-item-counter;
      }
      li::before {
        content: counter(list-item-counter)".";
        margin-right: 5px;
        display: inline-block;
      }
    }
  }
}

.error {
  color: red;
}

</style>