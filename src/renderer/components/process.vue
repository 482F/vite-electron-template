<template>
  <div class="process">
    <v-icon
      @click="$emit('update:suspended', !suspended)"
      class="pause"
      color="#555"
    >
      {{ suspended ? 'mdi-play' : 'mdi-pause' }}
    </v-icon>
    <div class="icon">
      <img :src="process.icon" />
      <v-tooltip activator="parent" location="bottom">
        <div>{{ process.path }}</div>
      </v-tooltip>
    </div>
    <div class="exe">
      {{ exeName }}
    </div>
    <div class="windows">
      <span class="title">{{ process.windows[0].title }}</span>
      <span class="menu" v-if="2 <= process.windows.length">
        <v-icon> mdi-menu-down </v-icon>
        <v-tooltip activator="parent" location="bottom">
          <div v-for="window of process.windows.slice(1)">
            {{ window.title }}
          </div>
        </v-tooltip>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'process',
  props: {
    process: {
      type: Object,
      required: true,
    },
    suspended: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    exeName() {
      return this.process.path?.match(/[^\\\/]+$/)?.[0]
    },
  },
}
</script>

<style lang="scss" scoped>
.process {
  display: flex;
  gap: 8px;
  --height: 24px;
  height: var(--height);
  width: 100%;
  align-items: center;
  > .icon {
    overflow: hidden;
    height: var(--height);
    width: var(--height);
  }
  > .icon > img {
    height: var(--height);
    width: var(--height);
  }
  > .exe {
    width: 30%;
  }
  > .windows {
    width: 70%;
    overflow: hidden;
    display: flex;
    gap: 4px;
    > .title {
      flex-grow: 0;
      overflow-x: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    > .menu {
      flex-shrink: 0;
    }
  }

  > * {
    &:not(.windows) {
      flex-shrink: 0;
    }
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
