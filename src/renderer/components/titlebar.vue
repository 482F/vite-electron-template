<template>
  <div class="title-bar">
    <div class="left">
      <span>{{ titleLeft }}</span>
    </div>
    <div class="right">
      <span>{{ titleRight }}</span>
      <div class="maneuver">
        <div class="button" @click="minimize">
          <v-icon>mdi-window-minimize</v-icon>
        </div>
        <div class="button" @click="close">
          <v-icon>mdi-close</v-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'titlebar',
  props: {
    titleLeft: {
      type: String,
      default: 'Left',
    },
    titleRight: {
      type: String,
      default: 'Right',
    },
  },
  methods: {
    minimize() {
      this.$sendIpc('main', 'minimize')
    },
    close() {
      window.close()
    },
  },
}
</script>

<style lang="scss" scoped>
.title-bar {
  user-select: none;
  -webkit-app-region: drag;
  height: 30px;
  background-color: lightgray;
  flex-shrink: 0;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding-left: 10px;

  .right {
    flex-shrink: 0;
  }

  .left,
  .right,
  .maneuver,
  .button {
    display: flex;
    align-items: center;
    height: 100%;
    overflow: hidden;
    min-width: 0;
  }

  .left,
  .right {
    gap: 10px;
    > * {
      min-width: 0;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .maneuver {
      flex-shrink: 0;
      .button {
        -webkit-app-region: none;
        justify-content: center;
        width: 40px;
        cursor: pointer;
        &:hover {
          background-color: #00000022;
        }
      }
    }
  }
}
</style>
