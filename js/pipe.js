function getCursorPosition(e) {
    var x;
    var y;
    if (e.pageX != undefined && e.pageY != undefined) {
        x = e.pageX;
        y = e.pageY;
    } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return [x,y]
}

var pipe_main = function(){

var canvas = document.getElementById('sketch')

var sc = canvas.getContext("2d")     //sketch context

var nodes = []
var lines = []

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
        canvas.width = window.innerWidth-5;
        canvas.height = window.innerHeight-5;
        
        redraw()
}

function traceCircle (xy,r){
    sc.beginPath();
    sc.arc(xy[0],xy[1],r,0,Math.PI*2);
    sc.closePath();
    sc.stroke();
}

function traceLine (coords){
    sc.beginPath();
    sc.moveTo(coords[0],coords[1])
    sc.lineTo(coords[2],coords[3])
    sc.stroke();
}

function redraw () {
    sc.clearRect(0,0,window.innerWidth-5,window.innerHeight-5)
    sc.strokeStyle = "#000";
    for (var i = 0; i < lines.length; i++){
        traceLine(lines[i]);
    }
    
    for (var i = 0; i < nodes.length; i++){
        traceCircle(nodes[i],5);
    }
    sc.fillstyle = "#f00"
    sc.fill()
    sc.fillstyle = "#fff"
}

function dot2(v1,v2){
    return v1[0]*v2[0]+v1[1]*v2[1]
}

var node = {}

node.newNode = function(e){
    canvas.removeEventListener("click",node.newNode,false)

    var newNode = getCursorPosition(e)
    newNode[0] -= canvas.offsetLeft;
    newNode[1] -= canvas.offsetTop;

    node.coords= newNode
    
    nodes.push(newNode)
    node.startSegment()
    document.addEventListener("keydown",node.endLine,false)
    redraw()
}

node.onclick = function(){
    node.endSegment()
    node.coords = node.lineData.slice(2);
    node.startSegment()
}

node.startSegment = function(){
    node.lineData = [node.coords[0],node.coords[1],node.coords[0],node.coords[1]];
    lines.push(node.lineData)
    
    canvas.addEventListener("mousemove",node.moveSegement,false)
    canvas.addEventListener("click",node.onclick,false)
}

node.endSegment = function(){
    nodes.push(node.lineData.slice(2))
    canvas.removeEventListener("mousemove",node.moveSegement,false)
    canvas.removeEventListener("click",node.onclick,false)
    redraw()
}

node.endLine = function(e){
    console.log(e)
    if (e.keyCode == 27){
        node.endSegment()
        document.removeEventListener("keydown",node.endLine,false)
        canvas.addEventListener("click",node.newNode,false)
    }
}

node.moveSegement= function(e){
    var newNode = getCursorPosition(e)
    newNode[0] -= canvas.offsetLeft;
    newNode[1] -= canvas.offsetTop;
    var dx = newNode[0] - node.lineData[0];
    var dy = newNode[1] - node.lineData[1];
    if (dy/dx > 1.732){
        node.lineData[2] = node.lineData[0]
        node.lineData[3] = newNode[1]
    } else if (dy/dx > 0){
        var scale = dot2([dx,dy],[1,0.5774])/dot2([1,0.5774],[1,0.5774])
        node.lineData[2] = node.lineData[0]+scale
        node.lineData[3] = node.lineData[1]+scale*0.5774
    }else if (dy/dx > -1.732){
        var scale = dot2([dx,dy],[1,-0.5774])/dot2([1,-0.5774],[1,-0.5774])
        node.lineData[2] = node.lineData[0]+scale
        node.lineData[3] = node.lineData[1]-scale*0.5774
    }else{
        node.lineData[2] = node.lineData[0]
        node.lineData[3] = newNode[1]
    }
    redraw();
}

canvas.addEventListener("click",node.newNode,false)

resizeCanvas()


}


window.onload = pipe_main