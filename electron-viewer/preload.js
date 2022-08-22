const { contextBridge, ipcRenderer,dialog } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
  })

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system')
})


contextBridge.exposeInMainWorld('dia', {
    folder: () =>ipcRenderer.invoke('dia:folder')
  })

contextBridge.exposeInMainWorld('evFile',{
    list:(path)=>ipcRenderer.invoke('evFile:list',path),
    parseFilesFromList:(fileList,rootFolderPath)=>ipcRenderer.invoke('evFile:parse',fileList,rootFolderPath)
})