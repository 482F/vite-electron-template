<template>
  <div class="main">
    <div class="header">
      <v-icon @click="reload">mdi-reload</v-icon>
    </div>
    <process
      class="process"
      v-for="process of processes"
      :process="process"
      :suspended="process.suspended"
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
  margin: 1rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
  > table {
    width: 100%;
    table-layout: fixed;
  }
}
</style>
