

const 
    btnListFiles = document.getElementById('list-files-btn'),
    btnShowFiles = document.getElementById('show-files-btn'),
    preListFiles = document.getElementById('list-files'),
    rootFolderPath = document.getElementById('root-folder-name'),
    chart=document.getElementById('chart')

let globalfileList=[]

/* 
    document.getElementById('chart')
    .append(Icicle({name:'test',children:[{name:'a',size:12},{name:'c',size:6},{name:'b',size:3}]}, {

  value: d => d.size, // size of each node (file); null for internal nodes (folders)
  label: d => d.name, // display name for each cell
  title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}\n${n.value.toLocaleString("en")}` // hover text
    })) */

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
        fileList= await window.evFile.list(rootFolderPath.innerHTML)
        
       let files= await window.evFile.parseFilesFromList(fileList,rootFolderPath.innerHTML)
       globalfileList=files

    preListFiles.innerHTML=JSON.stringify(files)
  })
 btnShowFiles.addEventListener('click', async ()=>{
  const 
    hierarchy=d3.stratify().path(d => d.path)(globalfileList),
    diagram=Icicle(
      hierarchy, 
      {

        color: null,
        fill:d=>{return colorState(d)},
        label: d => d.id,
        title: (d, n) => `${n.ancestors().reverse().map(d => d.id).join(".")}\n${n.value.toLocaleString("en")}` // hover text
      }
    )
    
    console.log('hierarchy',hierarchy)
    chart.append(diagram)
 })
function getNodeState(d){
  let state=0
  if(d.data && d.data.data && d.data.data.state){
    state= d.data.data.state
  }
  return state
}

 function colorState(d){
  let state = getNodeState(d)

  console.log('state',state)
  switch(state){
    case 1:
      return 'red'
    case 2:
      return 'orange'
    case 3:
      return 'yellow'
    case 4:
      return 'green'
    default:
      return '#BBD'
  }
 }
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/icicle
function Icicle(data, { // data is either tabular (array of objects) or hierarchy (nested objects)
    path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
    id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
    parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
    children, // if hierarchical data, given a d in data, returns its children
    format = ",", // format specifier string or function for values
    value, // given a node d, returns a quantitative value (for area encoding; null for count)
    sort = (a, b) => d3.descending(a.value, b.value), // how to sort nodes prior to layout
    label, // given a node d, returns the name to display on the rectangle
    title, // given a node d, returns its hover text
    link, // given a node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links (if any)
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    margin = 0, // shorthand for margins
    marginTop = margin, // top margin, in pixels
    marginRight = margin, // right margin, in pixels
    marginBottom = margin, // bottom margin, in pixels
    marginLeft = margin, // left margin, in pixels
    padding = 1, // cell padding, in pixels
    round = false, // whether to round to exact pixels
    color = d3.interpolateRainbow, // color scheme, if any
    fill = "#ccc", // fill for node rects (if no color encoding)
    fillOpacity = 0.6, // fill opacity for node rects
  } = {}) {
  
    // If id and parentId options are specified, or the path option, use d3.stratify
    // to convert tabular data to a hierarchy; otherwise we assume that the data is
    // specified as an object {children} with nested objects (a.k.a. the “flare.json”
    // format), and use d3.hierarchy.
    const root = path != null ? d3.stratify().path(path)(data)
        : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
        : d3.hierarchy(data, children);
  
    // Compute the values of internal nodes by aggregating from the leaves.
    value == null ? root.count() : root.sum(d => Math.max(0, value(d)));
  
    // Compute formats.
    if (typeof format !== "function") format = d3.format(format);
  
    // Sort the leaves (typically by descending value for a pleasing layout).
    if (sort != null) root.sort(sort);
  
    // Compute the partition layout. Note that x and y are swapped!
    d3.partition()
        .size([height - marginTop - marginBottom, width - marginLeft - marginRight])
        .padding(padding)
        .round(round)
      (root);
  
    // Construct a color scale.
    if (color != null) {
      color = d3.scaleSequential([0, root.children.length - 1], color).unknown(fill);
      root.children.forEach((child, i) => child.index = i);
    }
    

    const svg = d3.create("svg")
        .attr("viewBox", [-marginLeft, -marginTop, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);
  
    const cell = svg
      .selectAll("a")
      .data(root.descendants())
      .join("a")
        .attr("xlink:href", link == null ? null : d => link(d.data, d))
        .attr("target", link == null ? null : linkTarget)
        .attr("transform", d => `translate(${d.y0},${d.x0})`);
  
    cell.append("rect")
        .attr("width", d => d.y1 - d.y0)
        .attr("height", d => d.x1 - d.x0)
        .attr("fill", color ? d => color(d.ancestors().reverse()[1]?.index) : fill)
        .attr("fill-opacity", fillOpacity);
  
    const text = cell.filter(d => d.x1 - d.x0 > 10).append("text")
        .attr("x", 4)
        .attr("y", d => Math.min(9, (d.x1 - d.x0) / 2))
        .attr("dy", "0.32em");
  
    if (label != null) text.append("tspan")
        .text(d => label(d.data, d));
  
    text.append("tspan")
        .attr("fill-opacity", 0.7)
        .attr("dx", label == null ? null : 3)
        .text(d => format(d.value));
  
    if (title != null) cell.append("title")
        .text(d => title(d.data, d));
  
    return svg.node();
  }