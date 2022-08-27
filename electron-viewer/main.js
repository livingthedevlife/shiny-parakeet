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
        return dir.files(folderPath, {sync:true})
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
    ipcMain.handle('dia:print',()=>{
        //let pdf = document.getElementById('pdf');
        let filepath1 = path.join(__dirname, '../print1.pdf');
         
        let options = {
            marginsType: 0,
            pageSize: 'A4',
            printBackground: true,
            printSelectionOnly: false,
            landscape: false
        }
        // let win = BrowserWindow.getAllWindows()[0];
        let win = BrowserWindow.getFocusedWindow();
         
        win.webContents.printToPDF(options).then(data => {
            fs.writeFile(filepath1, data, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('PDF Generated Successfully');
                }
            });
        }).catch(error => {
            console.log(error)
        });
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
    const fileComponents=[{
        path:path,
        state:4,
    }]

    let definepath,testpath, parentComponent, lastState



    rawFile
        .match(/(?:x?define|x?it|\/\/ARRANGE|\/\/ACT|\/\/ASSERT).*/g)
        .forEach((line)=>{
            console.log(line)
            if(line.match(/x?define/)){
                lastState=(line.match(/xdefine/))?TESTSTATE.untested:TESTSTATE.manually
                definepath=path +'/'+getTitle(line)

                fileComponents.push({
                    path:definepath,
                    state:lastState
                    
                })
                fileComponents[0]=updateState(fileComponents[0],lastState);
            }else if(line.match(/x?it/)){

                lastState=(line.match(/xit/))?TESTSTATE.manually:TESTSTATE.automated
                testpath=definepath +'/'+getTitle(line)
                fileComponents.push({
                    path:testpath,
                    steps:[],
                    weight:1,
                    state:lastState
                })
                
                fileComponents[0]=updateState(fileComponents[0],lastState);
            }else{
                const 
                    index=(fileComponents.length-1)||0
                    parentTest =fileComponents[index]
                parentTest.steps.push(line)
            }
        })
    return fileComponents
}
function updateState(component,state){
    if(component.state > state){
        component.state=state
    }
    return component
}
function getTitle(line){
    return line.match(/\('([^']*)/g)[0].replace('(\'','')
}