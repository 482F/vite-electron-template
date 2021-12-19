const ipcRenderer = window.requires.ipcRenderer

export default {
  install(app) {
    app.config.globalProperties.$ipcSend = async (listenerName, eventName, ...args) =>
      await ipcRenderer.invoke(`${listenerName}-${eventName}`, args)
  },
}
