
<template>
  <div id="wordbank-page">
    
    <category-card id="card-category" class="card h-fill"></category-card>
    <wordbank-list-card id="card-content" class="card h-fill"></wordbank-list-card>
    
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import CategoryCard from './_components/CategoryCardWordbank';
import WordbankListCard from './_components/WordbankListCard';
import api from './_api/wordbank';

export default {
  path: 'wordbank-list',
  privCode: 'wordbank',
  displayNameKey: 'wordbank_list',
  icon: 'white_folder',
  api,
  components: {
    CategoryCard,
    WordbankListCard,
  },
  data() {
    return {
    };
  },
  computed: {
    ...mapGetters([
      'wordbank',
      'currentCategory',
      'isEditMode',
    ]),
  },
  methods: {
    ...mapMutations([
      'setWordbank',
      'setCurrentCategory',
      'toggleEditMode',
    ]),
    loadWordbanks() {
      const that = this;
      that.$startPageLoading();
      that.$api.getWordbanks()
        .then((data) => {
          that.setWordbank(data);
          that.setCurrentCategory(data.children[0]);
          data.children[0].isActive = true;
        })
        .catch((err) => {
          console.log(err);
          that.$notifyFail(that.$t('wordbank.error.load_wordbanks_fail'));
        })
        .finally(() => {
          that.$emit('endLoading');
        });
    },
  },
  mounted() {
    const that = this;
    that.loadWordbanks();
  },
  beforeDestroy() {
    if (this.isEditMode) {
      this.toggleEditMode();
    }
  },
};
</script>
<style lang="scss" scoped>
@import 'styles/variable';
#wordbank-page {
  display: flex;
  #card-category {
    flex: 0 0 200px;
  }
  #card-content {
    flex: 1 0 0;
    margin-left: 20px;
  }
}
</style>
