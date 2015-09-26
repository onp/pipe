window.onload = function () {

var container = d3.select("#network")

var width = container.style("width").slice(0,-2),
    height = container.style("height").slice(0,-2),
    fill = d3.scale.category20();

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;
	
// zoom event vars
var zoom = d3.behavior.zoom()


// init svg
var outer = d3.select("#network")
  .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .attr("pointer-events", "all");

var inner = outer
  .append('svg:g')
    .call(zoom.on("zoom", rescale))
    .on("dblclick.zoom", null)

var vis = inner
  .append('svg:g')
    .on("mousemove", mousemove)
    .on("mousedown", mousedown)
    .on("mouseup", mouseup);

vis.append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'white');

// init force layout
var force = d3.layout.force()
    .size([width, height])
    .nodes([{}]) // initialize with a single node
    .linkDistance(50)
    .charge(-200)
    .on("tick", tick);


// line displayed when dragging new nodes
var drag_line = vis.append("line")
    .attr("class", "drag_line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", 0);

// get layout properties
var nodes = force.nodes(),
    links = force.links(),
    node = vis.selectAll(".node"),
    link = vis.selectAll(".link");

// add keyboard callback
d3.select(window)
    .on("keydown", keydown);

redraw();

// focus on svg
// vis.node().focus();

function mousedown() {
  if (!mousedown_node && !mousedown_link) {
    // allow panning if nothing is selected
    inner.call(zoom.on("zoom", rescale));
    return;
  }
}

function mousemove() {
  if (!mousedown_node) return;

  // update drag line
  drag_line
      .attr("x1", mousedown_node.x)
      .attr("y1", mousedown_node.y)
      .attr("x2", d3.mouse(this)[0])
      .attr("y2", d3.mouse(this)[1]);

}

function mouseup() {
  if (mousedown_node) {
    // hide drag line
    drag_line
      .attr("class", "drag_line_hidden")

    if (!mouseup_node) {
      // add node
      var point = d3.mouse(this),
        node = {x: point[0], y: point[1]},
        n = nodes.push(node);

      // select new node
      selected_node = node;
      selected_link = null;
      
      // add link to mousedown node
      links.push({source: mousedown_node, target: node});
    }

    redraw();
  }
  // clear mouse event vars
  resetMouseVars();
}

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

// rescale g
function rescale() {
	
  trans=d3.event.translate;
  scale=d3.event.scale;

  vis.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}

// redraw force layout
function redraw() {

  link = link.data(links);

  link.enter().insert("line", ".node")
      .attr("class", "link")
      .on("mousedown", 
        function(d) { 
          mousedown_link = d; 
          if (mousedown_link == selected_link) selected_link = null;
          else selected_link = mousedown_link; 
          selected_node = null; 
          redraw(); 
        })

  link.exit().remove();

  link
    .classed("link_selected", function(d) { return d === selected_link; });

  node = node.data(nodes);

  node.enter().insert("circle")
      .attr("class", "node")
      .attr("r", 5)
      .on("mousedown", 
        function(d) { 
          // disable zoom
		  inner.on(".zoom",null)

          mousedown_node = d;
          if (mousedown_node == selected_node) selected_node = null;
          else selected_node = mousedown_node; 
          selected_link = null; 

          // reposition drag line
          drag_line
              .attr("class", "link")
              .attr("x1", mousedown_node.x)
              .attr("y1", mousedown_node.y)
              .attr("x2", mousedown_node.x)
              .attr("y2", mousedown_node.y);

          redraw(); 
        })
      .on("mousedrag",
        function(d) {
          // redraw();
        })
      .on("mouseup", 
        function(d) { 
          if (mousedown_node) {
            mouseup_node = d; 
            if (mouseup_node == mousedown_node) { resetMouseVars(); return; }

            // add link
            var link = {source: mousedown_node, target: mouseup_node};
            links.push(link);

            // select new link
            selected_link = link;
            selected_node = null;

            // enable zoom
            inner.call(zoom.on("zoom", rescale));
            redraw();
          } 
        })
    .transition()
      .duration(750)
      .ease("elastic")
      .attr("r", 6.5);

  node.exit().transition()
      .attr("r", 0)
    .remove();

  node
    .classed("node_selected", function(d) { return d === selected_node; });

  

  if (d3.event) {
    // prevent browser's default behavior
    d3.event.preventDefault();
  }

  force.start();

}

function spliceLinksForNode(node) {
  toSplice = links.filter(
    function(l) { 
      return (l.source === node) || (l.target === node); });
  toSplice.map(
    function(l) {
      links.splice(links.indexOf(l), 1); });
}

function keydown() {
  if (!selected_node && !selected_link) return;
  switch (d3.event.keyCode) {
    case 8: // backspace
    case 46: { // delete
      if (selected_node) {
        nodes.splice(nodes.indexOf(selected_node), 1);
        spliceLinksForNode(selected_node);
      }
      else if (selected_link) {
        links.splice(links.indexOf(selected_link), 1);
      }
      selected_link = null;
      selected_node = null;
      redraw();
      break;
    }
  }
}


document.getElementById("file-box").addEventListener("click",
    function (e) { e.stopPropagation(); },
    false);

document.getElementById("save-file").addEventListener("click",
    function (e) {
        e.stopPropagation();
        pipeModel.saveToFile();
    },
    false);

document.getElementById("load-file").addEventListener("change",
    function (e) {
        e.stopPropagation();
        var file = this.files[0];
        PIPE.loadFromFile(file,pipeModel);
    },
    false);
    
    
    
    
    
    
	var loadPipe = {}
	
	loadPipe.test = /\.pipe$/i
	
	loadPipe.func = function (file,model) {

		var reader = new FileReader();

		reader.onload = function () {

			model.loadJSON(reader.result);
            
            for(newNode in model.nodes){
                if (model.nodes.hasOwnProperty(newNode)){
                    model.nodes[newNode].x = 0;
                    model.nodes[newNode].y = 0;
                    nodes.push(model.nodes[newNode]);
                    
                    
                }
                
            }
            
            for(newLink in model.pipes){
                if (model.pipes.hasOwnProperty(newLink)){
                    model.pipes[newLink].source = model.pipes[newLink].node1;
                    model.pipes[newLink].target = model.pipes[newLink].node2;
                    links.push(model.pipes[newLink]);
                }
            }
            
            redraw()


		};

		reader.readAsText(file);

	}
	
	PIPE.fileLoaders = [
		loadPipe
	];
	
	PIPE.loadFromFile = function (file,model){
		
		var i;
        
        model.clear()
		
		for (i=0; i<PIPE.fileLoaders.length; i++){
			var ld = PIPE.fileLoaders[i];
			if (ld.test.exec(file.name)){
				ld.func(file,model);
				return
			}
		}
		console.error("file type not recognized.")

	}
    
var pipeModel = new PIPE.Model();
document.pipeModel = pipeModel;






}