import RobotProfile from './RobotProfileV3';
import FunctionSetting from './FunctionSetting';
import ChatSkill from './RobotWords';
import Command from './RobotCommand';
import IntegrationInfo from './IntegrationInfo';
import RobotConfig from './RobotConfig';

export default {
  displayNameKey: 'robot_setting',
  icon: 'menu_robot',
  pages: {
    RobotProfile,
    ChatSkill,
    FunctionSetting,
    Command,
    IntegrationInfo,
    RobotConfig,
  },
};
