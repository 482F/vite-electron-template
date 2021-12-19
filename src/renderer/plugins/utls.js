const ipcRenderer = window.requires.ipcRenderer

export default {
  install(app) {
    const sendIpc = async (listenerName, eventName, ...args) => {
      console.log(args, JSON.stringify(args))
      return JSON.parse(
        await ipcRenderer.invoke(
          `${listenerName}-${eventName}`,
          JSON.stringify(args)
        ) ?? null
      )
    }
    app.config.globalProperties.$sendIpc = sendIpc

    app.config.globalProperties.$listenIpc = async (
      listenerName,
      eventName,
      handler
    ) => {
      ipcRenderer.on(`${listenerName}-${eventName}`, console.log)
      console.log(listenerName, eventName)
      await sendIpc('main', 'listen', listenerName, eventName)
    }
  },
}
