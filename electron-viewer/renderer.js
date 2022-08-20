const 
    btnListFiles = document.getElementById('list-files-btn'),
    preListFiles = document.getElementById('list-files'),
    rootFolderPath = document.getElementById('root-folder-name')


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
    rootFolderPath.innerHTML = folder.filePaths[0];
  })

btnListFiles.addEventListener('click', async () => {
    const fileList= await window.evFile.list(rootFolderPath.innerHTML)
    preListFiles.innerHTML=fileList
  })
