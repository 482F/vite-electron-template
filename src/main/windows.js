import winctl from 'winctl'

const windows = {}
windows.allWindows = () => {
  const wins = []
  winctl.EnumerateWindows((win) => wins.push(win))
  console.log(wins[0], wins[0].__proto__)
  const result = wins
    .filter((win) => win.isVisible() && !win.getParent() && win.getTitle())
    .map((win) => ({
      title: win.getTitle(),
      pid: win.getPid(),
      className: win.getClassName(),
    }))
  // console.log({ result })
  return result
}

export default windows
