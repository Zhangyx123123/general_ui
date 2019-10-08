<template lang="html">
<div id="entity-relation-editor-pop" class="entity-relation-editor-pop">
  <h1>{{$t("task_engine_v3.entity-relation-editor-pop.title")}}</h1>
  <button class="btn-basic" @click="addRelatedEntity">{{$t("task_engine_v3.entity-relation-editor-pop.add_row")}}</button>
  <button class="btn-basic"@click="addEntityType">{{$t("task_engine_v3.entity-relation-editor-pop.add_column")}}</button>
  <div class="entity-relation-contaientityCollector">
    <div class="edit_column headline"></div>
    <div class="edit_column headline"
      v-for="(entityCollector, entityCollectorIndex) in relatedEntityCollectorList">
      <div v-if="entityCollectorIndex===0">{{$t("task_engine_v3.entity-relation-editor-pop.main_entity")}}</div>
      <div v-else>{{$t("task_engine_v3.entity-relation-editor-pop.related_entity")}}</div>
      <div class="delete-button clickable" @click="deleteEntityType(entityCollectorIndex)" v-if="entityCollectorIndex > 1">X</div>
    </div>
  </div>
  <div class="entity-relation-contaientityCollector">
    <div class="edit_column headline">{{$t("task_engine_v3.entity-relation-editor-pop.entity_type")}}</div>
    <div class="edit_column headline"
        v-for="(entityCollector, entityCollectorIndex) in relatedEntityCollectorList">
        <v-select
          class="select"
          :value="entityCollector"
          :options="customEntityCollectorList"
          @input="changeEntityType(entityCollectorIndex, $event)"
          label="entityName"
        >
        </v-select>
    </div>
  </div>
  <div class="entity-relation-contaientityCollector"
    v-for="(entityArray, entityArrayIndex) in relatedEntityMatrix">
    <div class="edit_column headline">{{$t("task_engine_v3.entity-relation-editor-pop.entity")}}</div>
    <div class="edit_column"
        v-for="(entity, entityIndex) in entityArray">
        <v-select
          v-if="relatedEntityCollectorList[entityIndex] !== null"
          class="select"
          :value="entity"
          :options="relatedEntityCollectorList[entityIndex].ner.entitySynonymsList"
          @input="changeEntityRelation(entityArrayIndex, entityIndex, $event)"
          label="entity"
        >
        </v-select>
    </div>
    <div class="delete-button clickable" @click="deleteRelatedEntity(entityArrayIndex)">X</div>
  </div>
</div>
</template>

<script>
export default {
  name: 'entity-relation-editor-pop',
  components: {},
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      customEntityCollectorList: [],
      defaultEntityCollector: {},
      relatedEntityCollectorList: [],
      relatedEntityMatrix: [],
    };
  },
  computed: {},
  watch: {},
  methods: {
    addRelatedEntity() {
      const tmpArray = [];
      for (let i = 0; i < this.relatedEntityCollectorList.length; i += 1) {
        tmpArray.push(this.relatedEntityCollectorList[i].ner.entitySynonymsList[0]);
      }
      this.relatedEntityMatrix.push(tmpArray);
    },
    deleteRelatedEntity(index) {
      this.relatedEntityMatrix.splice(index, 1);
      this.$forceUpdate();
    },
    addEntityType() {
      this.relatedEntityCollectorList.push(this.defaultEntityCollector);
    },
    deleteEntityType(index) {
      this.relatedEntityCollectorList.splice(index, 1);
      for (let i = 0; i < this.relatedEntityMatrix.length; i += 1) {
        this.relatedEntityMatrix[i].splice(index, 1);
      }
      this.$forceUpdate();
    },
    hasEntity(entityList, entity) {
      if (entity === undefined) { return false; }
      for (let i = 0; i < entityList.length; i += 1) {
        if (entityList[i].entity === entity.entity &&
           entityList[i].synonyms === entity.synonyms
          ) { return true; }
      }
      return false;
    },
    changeEntityType(index, entityCollector) {
      if (entityCollector === null) {
        const oldVal = this.relatedEntityCollectorList[index];
        this.relatedEntityCollectorList[index] = null;
        this.$forceUpdate();
        this.$nextTick(() => {
          this.relatedEntityCollectorList[index] = oldVal;
          this.$forceUpdate();
        });
      } else {
        this.relatedEntityCollectorList[index] = entityCollector;
        for (let i = 0; i < this.relatedEntityMatrix.length; i += 1) {
          if (!this.hasEntity(this.relatedEntityCollectorList[index].ner.entitySynonymsList,
          this.relatedEntityMatrix[i][index])) {
            this.relatedEntityMatrix[i][index] =
              this.relatedEntityCollectorList[index].ner.entitySynonymsList[0];
          }
        }
        this.$forceUpdate();
      }
    },
    changeEntityRelation(entityArrayIndex, entityIndex, entity) {
      if (entity === null) {
        const oldVal = this.relatedEntityMatrix[entityArrayIndex][entityIndex];
        this.relatedEntityMatrix[entityArrayIndex][entityIndex] = null;
        this.$forceUpdate();
        this.$nextTick(() => {
          this.relatedEntityMatrix[entityArrayIndex][entityIndex] = oldVal;
          this.$forceUpdate();
        });
      } else {
        this.relatedEntityMatrix[entityArrayIndex][entityIndex] = entity;
      }
    },
    validateDate() {
      const rtnObj = {
        relatedEntityCollectorList: this.relatedEntityCollectorList,
        relatedEntityMatrix: this.relatedEntityMatrix,
      };
      this.$emit('validateSuccess', JSON.parse(JSON.stringify(rtnObj)));
    },
  },
  beforeMount() {},
  mounted() {
    const obj = JSON.parse(JSON.stringify(this.value));
    this.customEntityCollectorList = obj.customEntityCollectorList;
    this.defaultEntityCollector = this.customEntityCollectorList[0];
    if (obj.relatedEntityCollectorList.length > 0) {
      this.relatedEntityCollectorList = obj.relatedEntityCollectorList;
    } else {
      this.relatedEntityCollectorList.push(this.defaultEntityCollector);
      this.relatedEntityCollectorList.push(this.defaultEntityCollector);
    }
    this.relatedEntityMatrix = obj.relatedEntityMatrix;
    this.$on('validate', this.validateDate);
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
.entity-relation-editor-pop{
  min-width: 800px;
  min-height: 500px;
  padding: 20px;
  @include auto-overflow();
  @include customScrollbar();
  .headline{
    background-color:antiquewhite;
  }
  .entity-relation-contaientityCollector{
    border: 1px solid #e4eaec;
    width: 100%;
    display:flex;
    flex-direction: row;
    .edit_column{
      justify-content: center;
      flex: 0 0 200px;
      display:flex;
      flex-direction: row;
    }
    .delete-button{
      text-align: right;
      width: 20px;
      display:inline-block;
    }
  }
  .clickable{
    cursor: pointer; 
  }
  .select{
    min-width: 150px;
  }
}
</style>