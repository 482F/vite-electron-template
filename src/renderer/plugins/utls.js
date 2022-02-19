const { sendIpc, listenIpc } = window.requires

export default {
  install(app) {
    app.config.globalProperties.$sendIpc = sendIpc
    app.config.globalProperties.$listenIpc = listenIpc
  },
}
