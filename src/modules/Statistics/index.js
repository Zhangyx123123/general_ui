import DailyLog from './StatisticDaily';
import Analysis from './StatisticAnalysisNew';
import Session from './StatisticSession';
import StatisticHealthCheck from './StatisticHealthCheck';

export default {
  displayNameKey: 'statistics',
  icon: 'menu_statistics',
  pages: {
    Analysis,
    DailyLog,
    Session,
    StatisticHealthCheck,
  },
};
