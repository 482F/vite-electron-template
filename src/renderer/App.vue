<template>
  <v-app>
    <v-main>
      <div class="main">
        <titlebar />
        <div class="content">
          <HelloWorld />
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import Titlebar from './components/titlebar.vue'

export default {
  name: 'App',

  components: {
    HelloWorld,
    Titlebar,
  },

  data: () => ({
    //
  }),
}
</script>

<style lang="scss">
html {
  overflow: hidden !important;
  .main {
    height: 100vh;
    width: 100vw;
    font-family: Cica;
    display: flex;
    flex-direction: column;
    .content {
      flex-grow: 1;
      overflow: auto;
      &::-webkit-scrollbar-track {
        background-color: #eee;
      }
      &::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 30px;
      }
    }
  }
}
</style>
