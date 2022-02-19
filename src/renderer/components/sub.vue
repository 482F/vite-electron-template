<template>
  <div>received: {{ received }}</div>
</template>

<script>
export default {
  name: 'sub',
  data() {
    return { received: null }
  },
  mounted() {
    this.$listenIpc('sub', 'test', (time) => {
      this.received = time
    })
  },
}
</script>
