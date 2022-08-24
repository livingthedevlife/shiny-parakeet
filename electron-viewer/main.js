const { app, BrowserWindow, ipcMain, nativeTheme, dialog  } = require('electron')
const 
    path = require('path'),
    fs = require('fs'),
    dir= require('node-dir')

const TESTSTATE={
    untested:1,
    manually:2,
    automated:3,
    integrated:4
}    

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
/*     frame:false, */
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.loadFile('index.html')
  win.webContents.openDevTools()

  addIpcHandles()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function addIpcHandles(){
    ipcMain.handle('dark-mode:toggle', () => {
        if (nativeTheme.shouldUseDarkColors) {
            nativeTheme.themeSource = 'light'
        } else {
            nativeTheme.themeSource = 'dark'
        }
        return nativeTheme.shouldUseDarkColors
    })

    ipcMain.handle('dark-mode:system', () => {
        nativeTheme.themeSource = 'system'
    })

    ipcMain.handle('dia:folder', () => {
        return dialog.showOpenDialog({
            title:'Select root directory',
            defaultPath:'G:/livingthedevlife/shiny-parakeet/electron-viewer/',
            properties: ['openDirectory'] 
        })
    })

    ipcMain.handle('evFile:list',(event, folderPath)=>{
        return dir.files(folderPath, {sync:true});

    })
    ipcMain.handle('evFile:parse',(event, fileList, rootFolderPath)=>{
        let itemArray=[]

        fileList.forEach((filepath)=>{
            const path = parsefilepath(rootFolderPath,filepath)
            console.log(path)
            try {
                const 
                    data = fs.readFileSync(filepath, 'utf8')

                itemArray=itemArray.concat(parseFile(data,path))

              } catch (err) {
                console.error(err);
              }
        })
        return itemArray
        
    })
    
    ipcMain.handle('evFile:convertForDiag',(event, files)=>{
        return{
            name:'Tests',
            children:[
                {
                    name:'bla',
                    state:2,
                    children:[],
                    steps:[]
                }
            ]
        }
    })

}
function parseFileObject(element){
    const root={
        name:'Tests',
        children:[]
    }

for (const [key, value] of Object.entries(element)) {

    if(key.match(/\.cy\.js$/)){
        rootparseAsTest(value)
    }else{
        parseAsFolder(value)
    }

  }
}

function parsefilepath(rootFolderPath,filepath){
    return filepath.replace(rootFolderPath,'').replace(/^\\/,'').replace('\\','/')

}
function parseFile(rawFile,path){
    const files=[{
        path:path,
        state:0,
    }]
    let definepath,testpath
    rawFile
        .match(/(?:x?define|x?it|\/\/ARRANGE|\/\/ACT|\/\/ASSERT).*/g)
        .forEach((line)=>{
            console.log(line)
            if(line.match(/x?define/)){
                definepath=path +'/'+getTitle(line)
                files.push({
                    path:definepath,
                    state:(line.match(/xdefine/))?TESTSTATE.untested:TESTSTATE.manually
                    
                })
            }else if(line.match(/x?it/)){

                testpath=definepath +'/'+getTitle(line)
                files.push({
                    path:testpath,
                    steps:[],
                    weight:1,
                    state:(line.match(/xit/))?TESTSTATE.manually:TESTSTATE.automated
                })
            }else{
                const 
                    index=(files.length-1)||0
                    parentTest =files[index]
                parentTest.steps.push(line)
            }
        })
    return files
}
function getTitle(line){
    return line.match(/\('([^']*)/g)[0].replace('(\'','')
}