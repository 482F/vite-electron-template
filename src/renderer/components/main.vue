<template>
  <div class="main">
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
  }),
  async mounted() {
    const windows = (await this.$sendIpc('main', 'getAllWindows'))[0]
    await Promise.all(
      windows.map(async (window) => {
        window.icon = await this.$sendIpc('main', 'getFileIcon', window.path)
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
  watch: {},
  methods: {
    async updateSuspended(process, value) {
      process.suspended = value
      await this.$sendIpc(
        'main',
        'changeSuspend',
        process.pid,
        process.suspended
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
