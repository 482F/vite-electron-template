<template>
  <div class="main">
    <div class="header">
      <v-icon @click="reload">mdi-reload</v-icon>
      <v-btn
        @click="showBlacklist = !showBlacklist"
        variant="outlined"
        size="small"
      >
        blacklist
      </v-btn>
    </div>
    <v-textarea
      class="textarea"
      v-model="blacklist"
      v-show="showBlacklist"
      variant="outlined"
      @change="updateBlacklist"
    />
    <process
      class="process"
      v-for="process of visibleProcesses"
      :process="process"
      :suspended="process.suspended"
      :blacklist="blacklist"
      @update:suspended="(value) => updateSuspended(process, value)"
    />
  </div>
</template>

<script>
import Process from './process.vue'

export default {
  name: 'main',
  components: {
    Process,
  },
  data: () => ({
    processes: {},
    blacklist: undefined,
    showBlacklist: false,
  }),
  async mounted() {
    this.blacklist = (await this.$sendIpc('main', 'getStore', 'blacklist'))[0]
    await this.reload()
  },
  watch: {},
  computed: {
    blacklistFuncs() {
      return this.blacklist
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [target, pattern] = (() => {
            const data = line.split(':')
            if (2 <= data.length) {
              return [data[0], data.slice(1).join(':')]
            } else {
              return [undefined, data]
            }
          })()
          const regex = new RegExp(pattern, 'i')
          const pathFunc =
            ['path', undefined].includes(target) && pattern
              ? (path) => (path ?? '').match(regex)
              : () => false
          const titleFunc =
            ['title', undefined].includes(target) && pattern
              ? (title) => (title ?? '').match(regex)
              : () => false
          return {
            path: pathFunc,
            title: titleFunc,
          }
        })
    },
    visibleProcesses() {
      return Object.values(this.processes)
        .filter((process) =>
          this.blacklistFuncs.every((func) => !func.path(process.path))
        )
        .map((process) => ({
          ...process,
          windows: process.windows.filter((window) =>
            this.blacklistFuncs.every((func) => !func.title(window.title))
          ),
        }))
        .filter((process) => process.windows.length)
    },
  },
  methods: {
    async reload() {
      this.processes = {}
      const windows = (await this.$sendIpc('main', 'getAllWindows'))[0]
      await Promise.all(
        windows.map(async (window) => {
          window.icon = (
            await this.$sendIpc('main', 'getFileIcon', window.path)
          )[0]
        })
      )
      for (const window of windows) {
        this.processes[window.pid] ??= {
          path: window.path,
          pid: window.pid,
          icon: window.icon,
          suspended: false,
          windows: [],
        }
        this.processes[window.pid].windows.push(window)
      }
    },
    async updateBlacklist(value) {
      await this.$sendIpc('main', 'setStore', 'blacklist', this.blacklist)
    },
    async updateSuspended(process, value) {
      this.processes[process.pid].suspended = value
      await this.$sendIpc(
        'main',
        'changeSuspend',
        process.pid,
        value
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.main {
  height: 100%;
  overflow-y: scroll;
  padding: 1rem;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  > .header {
    padding: 1rem 0 1rem;
    z-index: 1;
    background-color: white;
    top: 0;
    position: sticky;
    display: flex;
    gap: 8px;
    align-items: center;
  }
  > .textarea {
    flex-grow: 0;
  }
}
</style>
