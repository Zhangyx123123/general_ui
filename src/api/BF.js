function focusRobot(userID, robotID) {
  return this.$reqGet(`/robot/stare/${robotID}?appid=${robotID}&user_id=${userID}`);
}

export default {
  focusRobot,
};
