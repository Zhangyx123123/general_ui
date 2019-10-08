<template>
  <transition-group tag="div" name="fade" class="notifications">
    <div v-for="(notification, idx) in notifications" class="notification" :key="getUniqueKey(notification)" :class="notification.type">
      <icon v-if="notification.type === 'success'" icon-type="info_success" :size=20></icon>
      <icon v-else-if="notification.type === 'fail'" icon-type="info_error" :size=20></icon>
      <icon v-else-if="notification.type === 'warning'" icon-type="info_warning" :size=20></icon>
      <icon v-else-if="notification.type === 'info'" icon-type="info_hover" :size=20></icon>
      <label>{{ notification.msg }}</label>
      <div class="close-icons" @click="closeNotification(idx)">
        <icon iconType="info_close" :size=16></icon>
      </div>
    </div>
  </transition-group>
</template>

<script>
import Icon from '../basic/Icon';

export default {
  name: 'notification',
  components: {
    icon: Icon,
  },
  data() {
    return {
      msg: '',
      notifications: [],
      defaultDelay: 5000,
      notificationTypes: ['success', 'fail', 'warning', 'info'],
      defaultType: 'success',
    };
  },
  methods: {
    receiveNotification(option) {
      const that = this;
      that.showNotification(option);
      setTimeout(() => {
        that.notifications.shift();
      }, option.delay || that.defaultDelay);
    },
    showNotification(option) {
      this.notifications.push({
        msg: option.text,
        type: this.getType(option),
        id: (new Date()).getTime(),
      });
    },
    closeNotification(idx) {
      this.notifications.splice(idx, 1);
    },
    getType(option) {
      if (this.notificationTypes.indexOf(option.type) !== -1) {
        return option.type;
      }
      return this.defaultType;
    },
    getUniqueKey(notification) {
      return `${notification.id}-${notification.msg}`;
    },
  },
  mounted() {
    this.$root.$on('notification', this.receiveNotification);
  },
};

</script>

<style lang="scss" scoped>
@import "styles/variable";

$animate-time: 1.5s;
$animate-delay: 0.5s;

.notifications {
  position: fixed;
  z-index: 101; // larger than pop window
  right: calc(50% - #{$notification-width} / 2);
  top: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.notification {
  @include font-14px();
  height: $notification-height;
  padding: 10px;
  margin-top: 5px;
  color: $color-font-active;
  background: $color-white;
  opacity: 1;
  border-radius: $notification-border-radius;
  box-shadow: $notification-box-shadow;
  width: $notification-width;
  overflow: hidden;

  display: flex;
  align-items: center;
  label {
    flex: 1;
    margin-left: 8px;
  }

  .close-icons {
    &:hover {
      cursor: pointer;
    }
    display: flex;
    align-items: center;
  }

  &.fade-enter-active {
    transition: opacity 0.25s;
  }
  &.fade-leave-active {
    transition:
      opacity $animate-time cubic-bezier(0, 1, 0, 1) $animate-delay,
      // height $animate-time cubic-bezier(0.8, 0.2, 0.8, 0.2) $animate-delay,
      // padding $animate-time cubic-bezier(0, 1, 0, 1) $animate-delay,
      // margin-top $animate-time linear $animate-delay;
  }
  &.fade-leave {
    opacity: 1
  }
  &.fade-enteer-to {
    opacity: 1
  }
  &.fade-enter {
    opacity: 0;
  }
  &.fade-leave-to {
    opacity: 0;
    // padding: 0 10px;
    // margin-top: 0;
  }
}
</style>
