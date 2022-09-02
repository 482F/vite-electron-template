<template>
  <v-app>
    <v-main>
      <div class="electron-main">
        <titlebar title-left="pssuspender" title-right="" />
        <div class="electron-content">
          <component :is="components[name]" />
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
  data: () => ({}),
  computed: {
    components() {
      return components
    },
    name() {
      return location.href.match(/(?<=#).+?$/)[0]
    },
  },
}
</script>

<style lang="scss">
html {
  font-family: Cica !important;
  overflow: hidden !important;
  > body {
    background-color: #ffffff00;
    .v-application {
      background-color: #ffffff00;
      .v-main {
        display: flex;
        justify-content: center;
        align-items: center;
        .electron-main {
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          .electron-content {
            border-style: none solid solid;
            border-color: lightgray;
            border-width: 1px;
            flex-grow: 1;
            overflow: auto;
          }
          * {
            &::-webkit-scrollbar-track {
              background-color: #eee !important;
            }
            &::-webkit-scrollbar {
              width: 10px !important;
              height: 10px !important;
            }
            &::-webkit-scrollbar-thumb {
              background-color: #ccc;
              border-radius: 30px;
            }
          }
        }
      }
    }
  }
}
</style>
