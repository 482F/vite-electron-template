<template>
  <v-app>
    <v-main>
      <div class="main">
        <titlebar />
        <div class="content">
          <component :is="components[name]"/>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import Titlebar from './components/titlebar.vue'
import Main from './components/main.vue'
import Sub from './components/sub.vue'
const components = {
  Main,
  Sub,
}

export default {
  name: 'App',

  components: {
    Titlebar,
  },

  data: () => ({
    //
  }),
  computed: {
    components() {
      return components
    },
    name() {
      return location.href.match(/(?<=#).+?$/)[0]
    }
  },
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
