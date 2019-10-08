<template lang="html">
<div id="custom-entity-type-editor-pop" class="custom-entity-type-editor-pop">
  <h1 class="header-title">{{$t("task_engine_v3.custom_entity_type_editor_pop.title")}}</h1>
  <div class="row">
    <div class="title_column">{{$t("task_engine_v3.custom_entity_type_editor_pop.entity_type")}}</div>
    <div class="input_column"><input type="text" v-model="entityObj.entityType"></div>
  </div>
  <div class="row">
    <div class="title_column">{{$t("task_engine_v3.custom_entity_type_editor_pop.entity_type_description")}}</div>
    <div class="input_column"><input type="text" v-model="entityObj.entityTypeDescription"></div>
  </div>
  <div class="row">
    <div class="title_column">{{$t("task_engine_v3.custom_entity_type_editor_pop.entity_category")}}</div>
    <div class="input_column">
      <v-select
        class="entity_category_select"
        v-model="entityObj.entityCategory"
        :options="nerCategoryList"
      >
      </v-select>
    </div>
  </div>
  <div class="entity-synonyms-container">
    <div class="entity_column">{{$t("task_engine_v3.custom_entity_type_editor_pop.synonyms_table.entity")}}</div>
    <div class="synonyms_column">{{$t("task_engine_v3.custom_entity_type_editor_pop.synonyms_table.synonyms")}}</div>
  </div>
  <div v-for="(entitySynonyms, index) in entityObj.entitySynonymsList" :key="entitySynonyms.entity">
    <entity-synonyms
      :initialEntitySynonyms="entitySynonyms"
      @deleteEntitySynonymsButtonClick="deleteEntitySynonyms(index)"
      @updateData="updateData(index, $event)"
    ></entity-synonyms>
  </div>
  <button class="btn-basic"
    @click="addNewEntitySynonyms"
  >{{$t("task_engine_v3.custom_entity_type_editor_pop.add_row")}}</button>
  <button class="btn-basic">{{$t("task_engine_v3.custom_entity_type_editor_pop.upload_entity_table")}}</button>
</div>
</template>

<script>
import EntitySynonyms from './EntitySynonyms';

export default {
  name: 'custom-entity-type-editor-pop',
  components: {
    'entity-synonyms': EntitySynonyms,
  },
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      entityObj: {},
      nerCategoryList: [],
    };
  },
  computed: {},
  watch: {},
  methods: {
    updateData(index, newEntitySynonyms) {
      this.entityObj.entitySynonymsList[index] = JSON.parse(JSON.stringify(newEntitySynonyms));
    },
    addNewEntitySynonyms() {
      this.entityObj.entitySynonymsList.push({
        entity: null,
        synonyms: null,
      });
    },
    deleteEntitySynonyms(index) {
      this.entityObj.entitySynonymsList.splice(index, 1);
    },
    validateDate() {
      this.$emit('validateSuccess', JSON.parse(JSON.stringify(this.entityObj)));
    },
  },
  beforeMount() {},
  mounted() {
    const obj = JSON.parse(JSON.stringify(this.value));
    this.entityObj = obj.customEntity;
    this.nerCategoryList = obj.nerCategoryList;
    this.$on('validate', this.validateDate);
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
.custom-entity-type-editor-pop{
  min-width: 800px;
  min-height: 500px;
  padding: 20px;
  .header-title{
    min-width: 300px;
  }
  .row{
    display:flex;
    flex-direction: row;
    .title_column{
      flex:1 1 auto;
      display:flex;
      flex-direction: row;
      min-width: 140px;
    }
    .input_column{
      flex:4 4 auto;
      display:flex;
      flex-direction: row;
      .entity_category_select{
        min-width: 150px;
      }
    }
  }
  .entity-synonyms-container{
    border: 1px solid #e4eaec;
    width: 100%;
    display:flex;
    flex-direction: row;
    .entity_column{
      flex:1;
      display:flex;
      flex-direction: row;
    }
    .synonyms_column{
      flex:4;
      display:flex;
      flex-direction: row;
    }
    .edit_column{
      justify-content: center;
      flex:5;
      display:flex;
      flex-direction: row;
    }
    .delete-entity-synonyms-button{
      flex:0.2;
    }
  }
  
  .full_width{
    width:100%;
  }
  .no_border{
    border:none;
  }
}
</style>