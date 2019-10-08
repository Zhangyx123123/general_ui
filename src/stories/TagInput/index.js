import { text, boolean, object } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import TagInput from '../../components/basic/TagInput';

export default [
  {
    name: 'TagInput',
    func: () => {
      const allowTagErrorTooltip = boolean('allowTagErrorTooltip', false);
      const allowTypeahead = boolean('allowTypeahead', true);
      const readonly = boolean('readonly', false);

      const width = text('width', '400px');

      const tags = ['nice', 'to', 'meet', 'you'];
      const tagslist = ['nice', 'to', 'meet', 'you', 'i', 'can', 'show', 'incredible', 'things'];
      const origTags = object('origTags(已選擇的tag)', tags);
      const tagsList = object('tagsList(可供選擇的tag)', tagslist);

      const template = `
      <div class="div-block">
        <div class="headline">Tag Input</div>
        <div>
          <tag-input
            :allowTagErrorTooltip="allowTagErrorTooltip"
            :origTags="origTags"
            :tagsList="tagsList"
            :readonly="readonly"
            :width="width"
            @selectedTagsChanged="onSelectedTagsChanged"
            @addNewTag="onAddNewTag"
            :allowTypeahead="allowTypeahead"
          ></tag-input>
        </div>
      </div>`;

      return {
        components: {
          TagInput,
        },
        data() {
          return {
            width,
            origTags,
            tagsList,
            readonly,
            allowTagErrorTooltip,
            allowTypeahead,
          };
        },
        methods: {
          onSelectedTagsChanged(selectedTags) {
            action('selected tags changed')(selectedTags);
          },
          onAddNewTag(newTag) {
            action('add new tag')(newTag);
          },
        },
        template,
      };
    },
  },
];
