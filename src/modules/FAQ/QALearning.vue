<template>
  <div id="learning-page" class="page">
    <div id="current-path">
      <div @click="setState(STATE.COLLECTIONS)"
        v-bind:class="{ 'clickable-text': (learningState !== STATE.COLLECTIONS), 'focus': (learningState === STATE.COLLECTIONS) }"
        class="clickable">
        {{ $t('learning.week_collections') }}
      </div> 
      <div @click="setState(STATE.CLUSTERS)"
           v-if="learningState == STATE.CLUSTERS || learningState == STATE.FEEDBACK"> 
        /
        <span class="clickable"
          v-bind:class="{ 'clickable-text': (learningState !== STATE.CLUSTERS), 'focus': (learningState === STATE.CLUSTERS) }">
          {{ $t('learning.record_clusters') }} </span>
      </div>
      <div @click="setState(STATE.FEEDBACK)" 
           v-if="learningState == STATE.FEEDBACK">
        / <span class="clickable" v-bind:class="{'focus': (learningState === STATE.FEEDBACK) }">{{ $t('learning.feedback_wording') }}</span>
      </div>  
    </div>
    <div id="header">
      <div class="title-container">
        <div class="header-title">
          <template v-if="learningState === STATE.COLLECTIONS">
            <div> {{ $t('learning.week_collections') }} </div>
            <div class="tooltip-container hover">
              <div class="info-material-icons black"></div>
              <div class="tooltip rightside  text-left-align" style="width: 700px;"> {{ $t('learning.collection.title_info') }} </div>
            </div>
          </template>
          <template v-else-if="learningState === STATE.CLUSTERS">
          {{ $t('learning.clusters') }}
          <div class="tooltip-container hover">
              <div class="info-material-icons black"></div>
            <div class="tooltip rightside  text-left-align" style="width: 360px;"> {{ $t('learning.cluster.clusters_tooltip') }} </div>
          </div>
          </template>
          <template v-else-if="learningState == STATE.FEEDBACK">
          {{ learningCollectionName }} | {{ clusterIndex }}
          </template>
        </div>
        <!-- <div class="header-switch-type">
          <span 
            class="clickable"
            v-bind:class="{'clickable-text': (learningType !== TYPE.UNMATCHED), 'focus': (learningType === TYPE.UNMATCHED)}"
            @click="setType(TYPE.UNMATCHED)">
            {{ $t('learning.unmatched') }}
          </span> 
          &nbsp;|&nbsp;
          <span 
            class="clickable"
            v-bind:class="{'clickable-text': (learningType !== TYPE.UNRESOLVED), 'focus': (learningType === TYPE.UNRESOLVED)}"
            @click="setType(TYPE.UNRESOLVED)">
            {{ $t('learning.unresolved') }}
          </span>
        </div> -->
        <!-- <div class="header-detail" v-if="learningState !== STATE.COLLECTIONS">
          <template v-if="learningState == STATE.CLUSTERS">
            {{ learningCollectionName }} | {{ collectionCount }}
          </template>
          <template v-if="learningState == STATE.FEEDBACK"> 
            {{ $t('learning.label') }}： {{ label }}
          </template>
        </div> -->
      </div>
    </div>
    <div class="learning-content">
      <LearningCollections v-if="learningState === STATE.COLLECTIONS"></LearningCollections>
      <LearningClusters v-if="learningState === STATE.CLUSTERS"></LearningClusters>
      <LearningFeedback v-if="learningState === STATE.FEEDBACK"></LearningFeedback>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import LearningCollections from './_components/learning/LearningCollections';
import LearningClusters from './_components/learning/LearningClusters';
import LearningFeedback from './_components/learning/LearningFeedback';
import LearningState from './_data/learningState';
import LearningType from './_data/learningType';

export default {
  path: 'qa-learning',
  privCode: 'qa_learning',
  displayNameKey: 'qa_learning',
  name: 'qa-learning',
  components: {
    LearningCollections,
    LearningClusters,
    LearningFeedback,
  },
  data() {
    return {
      STATE: LearningState,
      TYPE: LearningType,
    };
  },
  computed: {
    ...mapGetters([
      'learningState',
      'learningType',
      'learningCollectionName',
      'learningSelectedCollection',
      'learningSelectedCluster',
    ]),
    collectionCount() {
      const selectedCollection = this.learningSelectedCollection;
      const totalClusterCount = selectedCollection.clusters.length.toString();
      const totalRecordCount = selectedCollection.totalRecords.toString();
      return this.$t('learning.collection_count_info', {
        collection_cnt: totalClusterCount,
        record_cnt: totalRecordCount,
      });
    },
    clusterIndex() {
      const selectedCluster = this.learningSelectedCluster;
      if (selectedCluster.id >= 0) {
        let index = selectedCluster.id;
        index = (index + 1).toString();
        return this.$t('learning.cluster_index', {
          cluster_index: index,
        });
      }
      return '';
    },
    label() {
      const selectedCluster = this.learningSelectedCluster;
      return selectedCluster.label.join();
    },
  },
  methods: {
    ...mapMutations([
      'setLearningState',
      'setSelectedType',
      'resetLearning',
    ]),
    setState(newState) {
      this.setLearningState(newState);
    },
    setType(newType) {
      this.setSelectedType(newType);
      this.setState(this.STATE.COLLECTIONS);
    },
  },
  beforeDestroy() {
    this.resetLearning();
  },
};
</script>

<style lang="scss">
@import 'styles/variable.scss';
$row-height: 40px;
$header-color: $table-header-background;
$darker-base: #999999;
$main-color: black;
$light-main: lighten($main-color, 15%);
$base-color: #F2F2F2;

$button-primary: $button-blue-bg;
$button-color: white;

#learning-page {
  $fill-parent: 100%;
  $current-path-height: 20px;
  $header-title-min-height: 40px;
  $border-color: #cccccc;
  $disabled-color: #dcdcdc;

  $table-header-height: 40px;
  $table-row-height: 40px;
  $table-paginator-height: 50px;

  .info-material-icons {
    &.black {
      background: url("../../assets/icons/ic_info_outline_black_24px.svg") no-repeat center center;
    }
    &.white {
      background: url("../../assets/icons/ic_info_outline_white_24px.svg") no-repeat center center;
    }
    background-size: 20px 20px;
    width: 20px;
    height: 20px;
    margin-left: 5px;
    cursor: default;
    user-select: none;
  }

  @mixin verticalCenterAlign() {
      display: flex;
      align-items: center;
      padding: 10px;
  }

  @mixin buttonBase() {
    width: 45%;
    height: 30px;
    @include verticalCenterAlign();
    justify-content: center;
    cursor: pointer;
  }

  @mixin tableRow($table-row-height, $hover) {
    display: flex;
    line-height: $table-row-height;
    & > div {
      padding: 0 10px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    @if $hover == "hover" {
      &:hover {
        background: $base-color;
      }
    }
  }
  @mixin makeColWidth($col, $val) {
    .#{$col} {
      flex: $val $val #{$val}px;
    }
  }

  @mixin tableRowBase($table-row-height, $border-color, $cols) {
    flex: 0 0 $table-row-height;
    cursor: pointer;
    border-bottom: 1px solid $border-color;

    @each $col in $cols {
      @include makeColWidth(nth($col, 1), nth($col, 2));
    }
  }

  @mixin table($cols...) {
    display: flex;
    flex-direction: column;
    #table-header {
      flex: 0 0 $table-header-height;
      display: flex;
      background: $header-color;
      border: 1px solid $border-color;
      @include tableRow($table-header-height,"no-hover");
      @each $col in $cols {
        @include makeColWidth(nth($col, 1), nth($col, 2));
      }

      .with-tooltip {
        display:flex; 
        overflow: visible;
      }
    }

    #table-body {
      flex: 1 1 500px;
      border: 1px solid $border-color;
      border-top: 0px;
      background: white;
      overflow: auto;

      display: flex;
      flex-direction: column;
      .table-row {
        @include tableRowBase($table-row-height, $border-color, $cols);
        @include tableRow($table-row-height, "hover");
      }

      .table-no-hover-row {
        @include tableRowBase($table-row-height, $border-color, $cols);
        @include tableRow($table-row-height, "no-hover");
      }
    }

    #table-paging {
      flex: 0 0 $table-paginator-height;
      line-height: $table-paginator-height;
      box-sizing: border-box;
      padding-top: 10px;
    }
  }

  display: flex;
  flex-direction: column;
  #current-path {
    flex: 0 0 $current-path-height;
    line-height: $current-path-height;

    font-size: 16px;
    display:flex;
  }

  #header {
    flex: 0 0 auto;
    padding: 10px 20px;
    padding-bottom: 0px;

    .title-container {
      background-color: white;
      display: flex;
      flex-wrap: wrap;

      .header-title {
        flex: 1;
        height: $header-title-min-height;
        padding: 10px;
        display: flex;
        align-items: center;
        background-color: white;
      }
      .header-switch-type {
        flex: 1;
        padding: 10px;
        display: flex;
        justify-content: flex-end;
      }

      .header-detail {
        flex: 1;
        flex-basis: 100%;
        padding: 10px;
        padding-top: 0px;
        font-size: 0.8em;
        color: gray;
      }
    }
  }

  .info-icon {
    margin-left: 0.5em;
  }

  .clickable {
    cursor: pointer;
    &.clickable-text {
      text-decoration: underline;
      color: black;
    }

    &.focus {
      color:blue;
    }
  }

  .learning-content {
    flex: 1 1 auto;
    padding: 20px;
    padding-top: 10px;
    padding-bottom: 0px;

    display: flex;
    & > div {
      flex: 1 1 auto;
    }
    #learning-collections {
      @include table("timeline" 6, "records" 3, "operation" 1);
    }

    #learing-clusters {
      @include table("cluster" 2, "records" 2, "label" 5, "status" 1);
    }

    #learing-feedback {
      width: 100%;
      $bottom-height: 50px;
      display: flex;
      justify-content: space-between;

      .vertical-align {
        @include verticalCenterAlign();
      }

      .display-container {
        width: 49%;
        height: $fill-parent;
        @include table("content" 1);

        .resolve-container {
          width: $fill-parent;
          height: $fill-parent;
          display: flex;
          border: 1px solid $border-color;
          background: white;

          @include verticalCenterAlign();
          justify-content: center;
          flex-direction: column;

          #resolve-reminder {
            padding: 10px;
            width: 400px;
          }

          #resolve-button {
            width: 150px;
            height: 50px;
            cursor: pointer;

            @include verticalCenterAlign();
            justify-content: center;
          }

          .resolve-button-enabled {
            background: $button-primary;
            color:white;
          }

          .resolve-button-disabled {
            background-color: $disabled-color;
            color: black;
          }
        }

        .display-area {
          position: relative;
          height: calc(100% - #{$bottom-height});

          .cover {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0px;
            top: 0px;

            background: rgba(0, 0, 0, 0.7);
            @include verticalCenterAlign();
            justify-content: center;

            .wording {
              color: white;
            }
          }

          .display-row {
            display: flex;
            cursor: default;

            .learning-feedback {
              overflow: hidden;
              text-overflow: ellipsis;
            }

            label {
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          .disable-row {
            background-color: $disabled-color;
          }

          input {
            height: 90%;
            cursor: pointer;
          }

          #searchx {
            border: solid 1px white;
            color: white;
            margin-left: 5px;
            padding: 2px;
            cursor: pointer;
            font-size: 14px;
          }
        }

        .bottom {
          @include verticalCenterAlign();
          justify-content: space-around;
          height: $bottom-height;

          .button-confirm {
            @include buttonBase();
            background: $button-primary;
            color:white;

            &.button-confirm-disabled {
              background: $disabled-color;
              color: black;
              cursor: not-allowed;
            }
          }

          .button-cancel {
            @include buttonBase();
            background: $button-color;
            border: solid 1px gray;
          }
        }
      }
    }
  }

  .tooltip-container {
    position: relative;
    &.hover:hover {
      .tooltip {
        visibility: visible;
      }
    }

    .tooltip {
      z-index: 1;
      $tool-tip-color: #d7dde4;
      visibility: hidden;
      padding: 5px;
      line-height: 1em;
      background-color: $tool-tip-color; // #d7dde4;
      color: #000;
      text-align: center;
      border-radius: 5px;
      padding: 5px;
      position: absolute;
      min-width: 50px;
      bottom: calc(100% + 10px);
      box-shadow: 1px 1px 5px black;
    
      &.visible {
        visibility: visible;
      }
      &.nowrap {
        white-space: nowrap;
      }
      &.left {
        left: 0;
      }
      &.right {
        right: 0;
      }

      &.text-left-align {
        text-align: left;
      }
    
      &.rightside {
        top: calc(50% - 0.5em - 5px);
        bottom: auto;
        left: calc(100% + 10px);
      }
      &.downside {
        top: calc(100% + 5px);
        bottom: auto;
      }
    
      &.downside::after {
        top: auto;
        bottom: 100%;
        border-color: transparent transparent $tool-tip-color transparent;
      }
      &.rightside::after {
        top: calc(50% - 5px);
        bottom: auto;
        left: -5px;
        border-color: transparent $tool-tip-color transparent transparent;
      }
    
    
      &.tri-right::after {
        left: 75%;
      }
      &.tri-left::after {
        left: 25%;
      }
      &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: $tool-tip-color transparent transparent transparent;
    
      }
    }
  }
}
</style>
