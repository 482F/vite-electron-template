const ipcRenderer = window.requires.ipcRenderer

export default {
  install(app) {
    app.config.globalProperties.$ipcInvoke = async (eventName, args) =>
      await ipcRenderer.invoke(eventName, args)
  },
}
