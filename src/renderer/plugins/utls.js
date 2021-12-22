const ipcRenderer = window.requires.ipcRenderer

export default {
  install(app) {
    app.config.globalProperties.$sendIpc = async (
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
