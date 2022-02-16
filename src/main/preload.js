const { contextBridge, ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  //
  // ここに、レンダラープロセスに渡したい機能を記載していく
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const sendIpc = async (listenerName, eventName, ...args) => {
  return JSON.parse(
    (await ipcRenderer.invoke(
      'sendIpc',
      JSON.stringify([`${listenerName}-${eventName}`, args])
    )) ?? null
  )
}
const listenIpc = async (listenerName, eventName, handler) => {
  ipcRenderer.on(`${listenerName}-${eventName}`, (_, args) =>
    handler(...JSON.parse(args))
  )
  await sendIpc('main', 'listen', listenerName, eventName)
}

contextBridge.exposeInMainWorld('requires', {
  listenIpc,
  sendIpc,
})
