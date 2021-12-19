const ipcRenderer = window.requires.ipcRenderer

export default {
  install(app) {
    app.config.globalProperties.$ipcSend = async (
      listenerName,
      eventName,
      ...args
    ) => {
      return JSON.parse(
        await ipcRenderer.invoke(
          `${listenerName}-${eventName}`,
          JSON.stringify(args)
        )
      )
    }
  },
}
