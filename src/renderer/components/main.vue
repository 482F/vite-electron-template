<template>
  <v-container class="main">
    <v-row class="text-center">
      <v-col cols="12">
        <v-btn @click="openSubWindow">サブウィンドウを開く</v-btn>
        <v-btn @click="sendToSubWindow">サブウィンドウへメッセージを送る</v-btn>
        <v-text-field v-model="text" />
      </v-col>
      <v-col cols="12">
        <v-img :src="logo" class="my-3" contain height="200" />
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          <div>Welcome to the Vuetify 3 Alpha</div>
        </h1>

        <small>Vite Preview</small>

        <p class="subheading font-weight-regular">
          For help and collaboration with other Vuetify developers,
          <br />please join our online
          <a href="https://community.vuetifyjs.com" target="_blank"
            >Discord Community</a
          >
        </p>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-5">What's next?</h2>

        <v-row justify="center">
          <a
            v-for="(next, i) in whatsNext"
            :key="i"
            :href="next.href"
            class="subheading mx-3"
            target="_blank"
          >
            {{ next.text }}
          </a>
        </v-row>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-5">Important Links</h2>

        <v-row justify="center">
          <a
            v-for="(link, i) in importantLinks"
            :key="i"
            :href="link.href"
            class="subheading mx-3"
            target="_blank"
          >
            {{ link.text }}
          </a>
        </v-row>
      </v-col>

      <v-col class="mb-5" cols="12">
        <h2 class="headline font-weight-bold mb-5">Ecosystem</h2>

        <v-row justify="center">
          <a
            v-for="(eco, i) in ecosystem"
            :key="i"
            :href="eco.href"
            class="subheading mx-3"
            target="_blank"
          >
            {{ eco.text }}
          </a>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import logo from '../assets/logo.svg'

export default {
  name: 'main',
  data: () => ({
    text: '',
    ecosystem: [
      {
        text: 'vuetify-loader',
        href: 'https://github.com/vuetifyjs/vuetify-loader',
      },
      {
        text: 'github',
        href: 'https://github.com/vuetifyjs/vuetify',
      },
      {
        text: 'awesome-vuetify',
        href: 'https://github.com/vuetifyjs/awesome-vuetify',
      },
    ],
    importantLinks: [
      {
        text: 'Chat',
        href: 'https://community.vuetifyjs.com',
      },
      {
        text: 'Made with Vuetify',
        href: 'https://madewithvuejs.com/vuetify',
      },
      {
        text: 'Twitter',
        href: 'https://twitter.com/vuetifyjs',
      },
      {
        text: 'Articles',
        href: 'https://medium.com/vuetify',
      },
    ],
    logo,
    whatsNext: [
      {
        text: 'Explore components',
        href: 'https://vuetifyjs.com',
      },
      {
        text: 'Roadmap',
        href: 'https://vuetifyjs.com/introduction/roadmap/',
      },
      {
        text: 'Frequently Asked Questions',
        href: 'https://vuetifyjs.com/getting-started/frequently-asked-questions',
      },
    ],
  }),
  async mounted() {
    this.text = (await this.$sendIpc('main', 'getStore', 'text'))[0]
  },
  watch: {
    async text(newText) {
      await this.$sendIpc('main', 'setStore', {
        text: this.text,
      })
    },
  },
  methods: {
    async openSubWindow() {
      const options = {
        width: 300,
        height: 300,
        minWidth: 300,
        minHeight: 300,
        transparent: true,
        frame: false,
        toolbar: false,
        hasShadow: false,
      }
      const menuItems = [
        {
          label: 'devtool',
          submenu: [
            {
              role: 'toggleDevTools',
            },
          ],
        },
      ]

      await this.$sendIpc('main', 'createWindow', options, menuItems, 'Sub')
    },
    async sendToSubWindow() {
      await this.$sendIpc('sub', 'test', new Date().getTime())
    },
  },
}
</script>

<style lang="scss" scoped>
.main {
  background-color: #ffffffcc;
}
</style>
