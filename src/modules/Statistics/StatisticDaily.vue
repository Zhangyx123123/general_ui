<template>
  <div class="statistic-daily">
    <keep-alive>
      <component :is="currentView" @startLoading="$startPageLoading($event)" @endLoading="$endPageLoading($event)"> </component>
    </keep-alive>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import VIEW from './_data/dailyView';
import DailyPage from './StatisticDailyPage';
import ClusterPage from './SelfLearnCluster';

export default {
  path: 'statistic-daily',
  privCode: 'statistic_daily',
  displayNameKey: 'statistic_daily',
  icon: 'white_daily',
  name: 'statistic-daily',

  computed: {
    ...mapGetters([
      'dailyCurrentView',
    ]),
    currentView() {
      const that = this;
      if (that.dailyCurrentView === VIEW.DAILY) {
        return DailyPage;
      }
      return ClusterPage;
    },
  },
  methods: {
    ...mapMutations([
      'setDailyCurrentView',
    ]),
  },
  destroyed() {
    const that = this;
    that.setDailyCurrentView(VIEW.DAILY);
  },
};
</script>

<style lang="scss" scoped>
</style>
