<template>
  <div class="rich-text">
    <script :id="richTextId" name="content" type="text/plain">
            {{ richTextContent }}
        </script>
  </div>

</template>

<script>
  import { mapGetters } from 'vuex';
  import VueUEditor from 'vue-ueditor';
  import '../../../../static/ueditor/ueditor.config';
  import '../../../../static/ueditor/ueditor.all';
  import '../../../../static/ueditor/lang/zh-cn/zh-cn';
  import '../../../../static/ueditor/ueditor.parse.min';


  export default {
    props: {
      value: {
        default: '',
      },

      richTextId: {

      },
    },

    name: 'RichTextField',
    components: {
      VueUEditor,
    },

    computed: {

      ...mapGetters([
        'robotID',
        'userID',
      ]),
    },

    data() {
      return {
        editor: null,
        currentEditor: '',
        richTextContent: '',
        instance: '',
        editorConfig: {
          toolbars: [
            ['source',
              '|', 'bold',
              'italic', 'underline', '|', 'fontsize', 'forecolor', 'backcolor', 'insertorderedlist',
              'insertunorderedlist', '|', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify',
              '|', 'simpleupload', 'link', 'unlink', '|', 'undo', 'redo'],
          ],
          initialFrameHeight: 60,
          imageActionName: 'uploadimage',
          imageMaxSize: 20 * 1024 * 1024,
          imageAllowFiles: ['.png', '.jpg', '.jpeg', '.gif'],
          imageCompressEnable: true,
          imageCompressBorder: 900,
          zIndex: 3000,
        },
      };
    },

    watch: {
      richTextContent(val) {
        this.$emit('input', val);
      },
    },

    methods: {
      initEditor() {
        this.instance = window.UE.getEditor(this.richTextId, this.editorConfig);
        this.instance.ready(() => {
          this.instance.execCommand('serverparam', () => {
            const param = {
              appid: this.robotID,
              userid: this.userID,
            };
            return param;
          });
          this.instance.setContent(this.value);
          this.instance.addListener('contentChange', () => {
            console.log(this.instance.getContent());
            this.richTextContent = this.instance.getContent();
          });
        });
      },

      editorReady(editorInstance) {
        editorInstance.setContent(this.value);
        editorInstance.execCommand('serverparam', () => {
          const param = {
            appid: this.robotID,
            userid: this.userID,
          };
          return param;
        });
        editorInstance.addListener('contentChange', () => {
          console.log(editorInstance.getContent());
          this.richTextContent = editorInstance.getContent();
        });
        this.currentEditor = editorInstance;
      },
    },
    mounted() {
      this.initEditor();
      this.richTextContent = this.value;
    },

    beforeDestroy() {
      console.log(this.instance.getContent());
      this.richTextContent = this.instance.getContent();
    },

  };
</script>



<style scoped>

  .rich-text {
    /*flex: 0 0 100%;*/
    width: 98%;
    /*padding: 3px 8px;*/
  }


  .edui-default .edui-editor-iframeholder /deep/ {
    width: 98%;
    /*height: 200px;*/
  }

</style>
