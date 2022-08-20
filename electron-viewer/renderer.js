
document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
    const isDarkMode = await window.darkMode.toggle()
    document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
  })
  
  document.getElementById('reset-to-system').addEventListener('click', async () => {
    await window.darkMode.system()
    document.getElementById('theme-source').innerHTML = 'System'
  })

  
  document.getElementById('select-root-folder').addEventListener('click', async () => {
    const folder= await window.dia.folder()
    document.getElementById('root-folder-name').innerHTML = folder.filePaths[0];
  })