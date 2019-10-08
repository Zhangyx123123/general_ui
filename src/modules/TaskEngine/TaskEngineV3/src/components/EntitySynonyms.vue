<template lang="html">
<div id="entity-synonyms" class="entity-synonyms-container">
  <div class="entity_column">
    <input type="text" class="no_border full_width"
      :placeholder="$t('task_engine_v3.custom_entity_type_editor_pop.synonyms_table.entity_placeholder')"
      v-model="entitySynonyms.entity"
      @input="updateData"
    >
  </div>
  <div class="synonyms_column">
    <input type="text" class="no_border full_width"
      :placeholder="$t('task_engine_v3.custom_entity_type_editor_pop.synonyms_table.synonyms_placeholder')"
      v-model="entitySynonyms.synonyms"
      @input="updateData"
    >
  </div>
  <div class="delete-entity-synonyms-button" @click="deleteThisEntitySynonyms">X</div>
</div>
</template>

<script>
export default {
  name: 'entity-synonyms',
  components: {
  },
  props: {
    initialEntitySynonyms: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      entitySynonyms: {},
    };
  },
  computed: {},
  watch: {},
  methods: {
    updateData() {
      this.$emit('updateData', this.entitySynonyms);
    },
    deleteThisEntitySynonyms() {
      this.$emit('deleteEntitySynonymsButtonClick');
    },
  },
  beforeMount() {},
  mounted() {
    this.entitySynonyms = JSON.parse(JSON.stringify(this.initialEntitySynonyms));
  },
};
</script>
