(function (VF_FF, undefined) {
	"use strict";

	var elementHeaders, iniData, modelData, modelDataVF, networkData;

	VF_FF.ffDefaults = {

		"201":  [ "201", "-4", "100", "100", "200", "200", "5", "3",  "",   "1",                                    "10", "405",                                 "0",   "1",            "2 inch",       "Schedule 40",       "52.5", "402",                      "52.5", "52.5",                       "402",                      "33.4",                       "52.5",                       "3.9",                       "402",    "0", "1162",   "0", "0.02", "150", "1", "Clean or new", "0.05", "402",    "0", "Low", "0",                         "0", "1.15", "901", "360", "1401", "0", "1", "0", "652", "0", "551", "0", "1", "mineral wool", "25", "402", "15", "652", "2", "301", "0.8", "1.5", "901", "1", "0", "0", "1", "Verdana,9,clWindowText,[]", "", "9", "60.3", ""],
		"301":  [ "301",  "1",  "96",  "40", "128",  "72",  "", "1", "0", "405",                                     "0",   "1",                              "1162",  "15",               "652",             "water",          "0",   "1",                         "3",    "0",                      "sand",                         "1",                         "10",                         "0",                      "0.65", "0.75",  "402",   "5",   "10",  "30", "50",          "70",   "90", "100", "0.05",   "0", "1", "Verdana,9,clWindowText,[]",     "",    ""],
		"302":  [ "302", "11",  "68", "208", "100", "240",  "", "1", "0", "405",                                     "1",  "10",                               "861",  "15",               "652",             "water",          "0",   "1",                         "3",    "0",                      "sand",                         "1",                         "10",                         "0",                      "0.65", "0.75",  "402",   "5",   "10",  "30", "50",          "70",   "90", "100", "0.05",   "0", "1", "Verdana,9,clWindowText,[]",     "",    ""],
		"304":  [ "304",  "1",  "76",  "76",  "92",  "92",  "", "1", "0", "405",                                     "0",   "1",                                 "0", "652",                 "0",               "551",          "0",   "1", "Verdana,9,clWindowText,[]",     "",                          ""],
		"402":  [ "402",  "2", "328",  "76", "344",  "92",  "", "1", "0", "405",                                     "0",  "90",                                 "1",   "1",                 "0",                 "1",          "0", "652",                         "0",  "551",                         "0",                         "1",  "Verdana,9,clWindowText,[]",                          "",                          ""],
		"405":  [ "405",  "6", "244",  "76", "260",  "92",  "", "1", "0", "405",                                     "0",   "1",                                "-6",  "90",                "90", "[Explanation... ]",          "0",   "1",                         "0",  "652",                         "0",                       "551",                          "0",                         "1", "Verdana,9,clWindowText,[]",     "",     ""],
		"408":  [ "408",  "3", "188",  "76", "204",  "92",  "", "2", "0", "405",                                     "0",  "-1",                                "-4",  "90", "[Explanation... ]",                 "0",          "1",   "0",                       "652",    "0",                       "551",                         "0",                          "1", "Verdana,9,clWindowText,[]",                          "",     ""],
		"501":  [ "501", "15", "460", "208", "492", "240",  "", "1", "0", "405",                                     "0",   "0",                                "50", "861",                "30",              "1351", "8196 2x3x6", "5.5",                      "2850",    "0",                         "0",                      "0.97",                          "0",                         "1",                         "0",  "652",    "0", "551", "0", "1", "Verdana,9,clWindowText,[]", "", ""],
		"601":  [ "601",  "1",  "99",  "61", "129",  "91",  "", "1", "0", "405", "Generic Butterfly Valve - Miller Data", "100",                                 "1",   "0",                 "1",                 "0",        "652",   "0",                       "551",    "0",                         "1", "Verdana,9,clWindowText,[]",                           "",                         ""],
		"603":  [ "603",  "2", "137",  "99", "167", "129",  "", "1", "0", "405",      "Generic Ball Valve - Miller Data", "100",                                 "1",   "0",                 "1",                 "0",        "652",   "0",                       "551",    "0",                         "1", "Verdana,9,clWindowText,[]",                           "",                         ""],
		"604":  [ "604", "13", "156", "212", "180", "236",  "", "1", "0", "405",      "Generic Gate Valve - Miller Data", "100",                                 "1",   "0",                 "1",                 "0",        "652",   "0",                       "551",    "0",                         "1", "Verdana,9,clWindowText,[]",                           "",                         ""],
		"605":  [ "605",  "3",  "99", "137", "129", "167",  "", "1", "0", "405",     "Generic Globe Valve - Miller Data", "100",                                 "1",   "0",                 "1",                 "0",        "652",   "0",                       "551",    "0",                         "1", "Verdana,9,clWindowText,[]",                           "",                         ""],
		"801":  [ "801",  "6", "137", "175", "167", "205",  "", "1", "0", "405",                     "Angle Swing Check",   "0",                                 "0",   "1",                 "0",               "652",          "0", "551",                         "0",    "1", "Verdana,9,clWindowText,[]",                          "",                           ""],
		"901":  [ "901",  "1", "184", "128", "208", "152",  "", "1", "0", "405",                                     "0",   "1", "Pipe Entrance - Inward projecting",   "1",                 "0",                 "2",         "-1",   "0",                       "652",    "0",                       "551",                          "0",                         "1", "Verdana,9,clWindowText,[]",                          "",     ""],
		"1005": ["1005",  "9", "380",  "72", "404",  "96",  "", "1", "0", "405",                                     "0",   "1",                               "0.2", "401",                 "0",                 "1",          "0", "652",                         "0",  "551",                         "0",                          "1", "Verdana,9,clWindowText,[]",                          "",                          ""],
		"1006": ["1006", "10", "464",  "72", "488",  "96",  "", "1", "0", "405",                                     "0",   "1",                                 "0", "652",                 "0",               "551",          "0",   "1", "Verdana,9,clWindowText,[]",     "",                          ""],
		"1201": ["1201", "14", "316", "212", "356", "236",  "", "1", "0", "405",                                     "0",   "0",                                "20",   "1",                "20",               "402",          "4", "401",                         "0",   "25",                        "19",                        "402",                          "4",                                                    "25",  "500",  "402",   "1", "861", "1", "601", "1000", "951", "2", "1", "601", "0", "1", "0", "652", "0", "551", "0", "1", "Verdana,9,clWindowText,[]", "", ""]

	};

	VF_FF.unitLookup = {

	//Flow
		"usgpm":	859,
		"lb/h":		502,

	//Pressure
		"psi a":	1158,
		"psi g":	1208,

	//Temperature
		"C":		652,
		"F":		653,

	//Heat transfer
		"Btu/h":	552



	};



	VF_FF.processINI = function (f) {

		var fr = new FileReader();

		fr.onload = function () {

			document.getElementById("ini-file-status").innerHTML = "INI file: " + f.name;

			iniData = new SimpleIni(function () { return fr.result; }, {comments: ['; ']});

			var elemData = {};

			for (elemType in iniData.Properties) {

				var processedData = {};

				processedData.prop = iniData.Properties[elemType].split(";");
				processedData.desc = iniData.Descriptions[elemType].split(";");
				processedData.rprop = iniData.ResultProperties[elemType].split(";");
				processedData.rdesc = iniData.ResultDescriptions[elemType].split(";");

				//fix for an apparent inconsistency in output file format:
				processedData.rprop.splice(1, 0, "0");
				processedData.rdesc.splice(1, 0, "Component Number");
				//end fix

				elemData[elemType] = processedData;

			}

			elementHeaders = elemData;

			displayTable();

		};

		fr.readAsText(f);

	};

	VF_FF.processTXT = function (f) {

		var fr = new FileReader();

		fr.onload = function () {

			document.getElementById("data-file-status").innerHTML = "Data file: " + f.name;

			var raw = fr.result.split("\r\n");

			var nodes = [];
			var pipes = [];
			var notes = [];
			var rnodes = [];
			var rpipes = [];
			var rnotes = [];

			var i = 0;

			var lastElem = i + Number(raw[i]) + 1;

			i += 1;

			var sep;

			if (iniData) {
				sep = iniData.get('ImportExportSettings.FieldSeparator').trim();
			} else {
				sep = "$%$%";
			}



			for (; i < lastElem; i++) {

				nodes.push(raw[i].split(sep));

			}


			lastElem = i + Number(raw[i]) + 1;

			i += 1;

			for ( ; i < lastElem; i++) {

				pipes.push( raw[i].split(sep) )

			}


			lastElem = i + Number(raw[i]) + 1;

			i += 1;

			for ( ; i < lastElem; i++) {

				notes.push( raw[i].split(sep) )

			}


			lastElem = i + Number(raw[i]) + 1;

			i += 1;

			for ( ; i < lastElem; i++) {

				rnodes.push( raw[i].split(sep) )

			}

			lastElem = i + Number(raw[i]) + 1;

			i += 1;

			for ( ; i < lastElem; i++) {

				rpipes.push( raw[i].split(sep) )

			}


			lastElem = i + Number(raw[i]) + 1;

			i += 1;

			for ( ; i < lastElem; i++) {

				rnotes.push( raw[i].split(sep) )

			}


			modelData = {  nodes:nodes,
						pipes:pipes,
						notes:notes,
						rnodes:rnodes,
						rpipes:rpipes,
						rnotes:rnotes
		}


			displayTable();

		}

		fr.readAsText(f)

	}


	VF_FF.displayTable = function () {

		if ((modelData === undefined )|| (elementHeaders === undefined)) { return }

		var tableRep = ""

		tableRep += "<h1>Nodes</h1>"

		for (elemType in elementHeaders) {

			if (elemType.slice(0,1) == "2") { continue }

			tableRep += "<h2>" + elemType + "</h2><p>input</p><table>"

			tableRep += "<tr><td>" + elementHeaders[elemType]["prop"].join("</td><td>") + "</td></tr>";
			tableRep += "<tr><td>" + elementHeaders[elemType]["desc"].join("</td><td>") + "</td></tr>";

				for (var i=0; i < modelData.nodes.length; i++ ){

					if (modelData.nodes[i][0] == elemType ) {
						tableRep += "<tr><td>" + modelData.nodes[i].join("</td><td>") + "</td></tr>";
					}
				}

			tableRep += "</table><p>results</p><table>"

			tableRep += "<tr><td>" + elementHeaders[elemType]["rprop"].join("</td><td>") + "</td></tr>";
			tableRep += "<tr><td>" + elementHeaders[elemType]["rdesc"].join("</td><td>") + "</td></tr>";

				for (var i=0; i < modelData.rnodes.length; i++ ){
					if (modelData.rnodes[i][0] == elemType ) {
						tableRep += "<tr><td>" + modelData.rnodes[i].join("</td><td>") + "</td></tr>";
					}
				}

			tableRep += "</table>"

		}

		tableRep += "<h1>Pipes</h1>"

		for (elemType in elementHeaders) {

		if (elemType.slice(0,1) !== "2") { continue }

			tableRep += "<h2>" + elemType + "</h2><p>input</p><table>"

			tableRep += "<tr><td>" + elementHeaders[elemType]["prop"].join("</td><td>") + "</td></tr>";
			tableRep += "<tr><td>" + elementHeaders[elemType]["desc"].join("</td><td>") + "</td></tr>";

				for (var i=0; i < modelData.pipes.length; i++ ){
					if (modelData.pipes[i][0] == elemType ) {
						tableRep += "<tr><td>" + modelData.pipes[i].join("</td><td>") + "</td></tr>";
					}
				}

			tableRep += "</table><p>results</p><table>"

			tableRep += "<tr><td>" + elementHeaders[elemType]["rprop"].join("</td><td>") + "</td></tr>";
			tableRep += "<tr><td>" + elementHeaders[elemType]["rdesc"].join("</td><td>") + "</td></tr>";

				for (var i=0; i < modelData.rpipes.length; i++ ){
					if (modelData.rpipes[i][0] == elemType ) {
						tableRep += "<tr><td>" + modelData.rpipes[i].join("</td><td>") + "</td></tr>";
					}
				}

			tableRep += "</table>"

		}



		document.getElementById("data-tables").innerHTML = tableRep
	}




	VF_FF.createINI = function () {

		if (iniData === undefined) {
			// no ini data, can't create a file.
			return
		}

		iniData.save( function (dat) {

			//iniData.Flowsheet.Height = String(~~(modelDataVF.maxY*1.2))
			//iniData.Flowsheet.Width = String(~~(modelDataVF.maxX*1.2))


			var blob = new Blob([dat], {type: "text/plain;charset=utf-8"});
			saveAs(blob, "FFdata.INI");

		})


	}


	VF_FF.createTXT = function (dSource) {

		if (iniData === undefined) {
			// no ini data available for formatting, can't create TXT.
			return
		}


		if (dSource === undefined) {
			// no data was passed, cannot create file
			return
		}

		var sep = iniData.get('ImportExportSettings.FieldSeparator').trim();

		var i;

		var rawTXT = "";

		rawTXT += dSource.nodes.length + "\r\n";

		for (i = 0; i<dSource.nodes.length; i++) {

			rawTXT += dSource.nodes[i].join(sep) + '\r\n';

		}


		rawTXT += dSource.pipes.length + "\r\n";

		for (i = 0; i<dSource.pipes.length; i++) {

			rawTXT += dSource.pipes[i].join(sep) + '\r\n';

		}


		rawTXT += dSource.notes.length + "\r\n";

		for (i = 0; i<dSource.notes.length; i++) {

			rawTXT += dSource.notes[i].join(sep) + '\r\n';

		}


		rawTXT += dSource.rnodes.length + "\r\n";

		for (i = 0; i<dSource.rnodes.length; i++) {

			rawTXT += dSource.rnodes[i].join(sep) + '\r\n';

		}


		rawTXT += dSource.rpipes.length + "\r\n";

		for (i = 0; i<dSource.rpipes.length; i++) {

			rawTXT += dSource.rpipes[i].join(sep) + '\r\n';

		}


		rawTXT += dSource.rnotes.length + "\r\n";

		for (i = 0; i<dSource.rnotes.length; i++) {

			rawTXT += dSource.rnotes[i].join(sep) + '\r\n';

		}

		var blob = new Blob([rawTXT], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "FFdata.TXT");

	}

	VF_FF.setNetworkPositions = function(refNode){
		for (var i = 0; i < refNode.connections.length; i++){

			var conn = refNode.connections[i]
			var node,fwd;

			if (conn.from === refNode){
				//code if pipe is going from refNode.
				if (conn.to.position){
					conn.to.overspecified += 1;
					continue
				}
				node = conn.to
				fwd = 1;

			} else {
				//code if pipe is going to refNode.
				if (conn.from.position){
					conn.from.overspecified += 1;
					continue
				}
				node = conn.from
				fwd = -1;
			}

			if (conn.direction == "1"){
				node.position = {
					x: refNode.position.x,
					y: refNode.position.y,
					z: refNode.position.z + conn.distance*fwd,
				}
			} else if (conn.direction == "2"){
				node.position = {
					x: refNode.position.x,
					y: refNode.position.y,
					z: refNode.position.z - conn.distance*fwd,
				}
			} else if (conn.direction == "3"){
				node.position = {
					x: refNode.position.x + conn.distance*fwd,
					y: refNode.position.y,
					z: refNode.position.z,
				}
			} else if (conn.direction == "4"){
				node.position = {
					x: refNode.position.x - conn.distance*fwd,
					y: refNode.position.y,
					z: refNode.position.z,
				}
			} else if (conn.direction == "5"){
				node.position = {
					x: refNode.position.x,
					y: refNode.position.y + conn.distance*fwd,
					z: refNode.position.z,
				}
			} else if (conn.direction == "6"){
				node.position = {
					x: refNode.position.x,
					y: refNode.position.y - conn.distance*fwd,
					z: refNode.position.z,
				}
			} else {
				console.warn("unknown direction "+conn.direction)
			}

			VF_FF.setNetworkPositions(node)
		}

	}



	VF_FF.processVFxl = function(f,context) {

		var fr = new FileReader();

		fr.onload = function () {

			// object definition data
			var nodes  = [];
			var pipes  = [];
			var notes  = [];
			// results data
			var rnodes = [];
			var rpipes = [];
			var rnotes = [];

			var modelDataVF = { 
				nodes:nodes,
				pipes:pipes,
				notes:notes,
				rnodes:rnodes,
				rpipes:rpipes,
				rnotes:rnotes,
				maxX: 0,
				maxY: 0
			}

			var netNodes = {};
			var netPipes = {};

			var networkData = {	nodes:netNodes,
								pipes:netPipes
			}

			var workbook = XLSX.read(fr.result, {type: 'binary'});

			var nodeRaw = XLSX.utils.sheet_to_csv(workbook.Sheets["UnitClean"]).split("\n")
			var PIPEaw = XLSX.utils.sheet_to_csv(workbook.Sheets["PipingClean"]).split("\n")

			// Nodes

			for (var i=1; i < nodeRaw.length; i++){

				if (nodeRaw[i].length <= 1) { break }

				var vfElem = nodeRaw[i].split(",")
				var elemType = vfElem[4];

				if (fromVF[elemType] ==  undefined){

					console.warn(elemType + "is not a recognized code.")

					continue

				}

				if ( Number(vfElem[8]) > modelDataVF.maxX)  {

					modelDataVF.maxX = Number(vfElem[8]);

				}

				if ( Number(vfElem[9]) > modelDataVF.maxY)  {

					modelDataVF.maxX = Number(vfElem[9]);

				}

				var ffElem = VF_FF.fromVF[vfElem[4]](vfElem);

				modelDataVF.nodes.push(ffElem)
				networkData.nodes[vfElem[0]] = {

					id:        vfElem[0],
					name:      vfElem[1],  			// Unique Name
					nodeType:  elemType,
					elevation: Number(vfElem[5])*0.3048,  	// Elevation in m (vf is in feet)
					flowsheet: {
						x:        Number(vfElem[6]),  	// VF layout X
						y:        Number(vfElem[7]),  	// VF layout Y
					},
					connections: [],
					timesSpecified: 0


				}





			}

			// Pipes

			for (var i=1; i < PIPEaw.length; i++){

				if (!PIPEaw[i]) { continue }

				var vfElem = PIPEaw[i].split(",")

				var ffElem = VF_FF.fromVF["201"](vfElem)

				modelDataVF.pipes.push(ffElem)

				networkData.pipes[vfElem[0]] = {

					id:			vfElem[0],
					name:		vfElem[1],    // Unique Name
					from:	networkData.nodes[vfElem[3]],    // Node 1
					to:		networkData.nodes[vfElem[2]],    // Node 2
					distance:	Number(vfElem[4])*0.3048,    // Length in m
					dNom:		vfElem[5],    // Nom. Dia
					schedule:	vfElem[6],    // Schedule
					direction: 	vfElem[8]

				}

				networkData.nodes[vfElem[2]].connections.push(networkData.pipes[vfElem[0]])
				networkData.nodes[vfElem[3]].connections.push(networkData.pipes[vfElem[0]])

			}



			//calculate absolute node positions

			for (nodeID in networkData.nodes){
				var node = networkData.nodes[nodeID]
				if (node.position){
					continue
				}

				console.log(node.id+" was not attached to the existing network. Assuming coordinates.")

				node.position = {
					x: 0,
					y: 0,
					z: node.elevation
				}

				VF_FF.setNetworkPositions(node)

			}
			
			//add nodes to the model

			for (var nodeID in networkData.nodes){
				
				var newNodeData = networkData.nodes[nodeID]
				
				var newNodePosition = new THREE.Vector3(newNodeData.position.x,
														newNodeData.position.y,
														newNodeData.position.z)
				
				var newNode = new PIPE.Node(newNodePosition,undefined,newNodeData.name,newNodeData.nodeType);
				
				context.model.nodes[newNode.uuid] = newNode;
				
				networkData.nodes[nodeID].threeElem = newNode
	
				visibleNodes.add(newNode.makeMesh());
				
			}
			
			//add pipes to the model

			for (var pipeID in networkData.pipes){
				
				var newPipeData = networkData.pipes[pipeID]
				
				var newPipe = new PIPE.Segment(newPipeData.from.threeElem,newPipeData.to.threeElem,undefined,undefined,newPipeData.name);
				
				context.model.pipes[newPipe.uuid] = newPipe;
				
				networkData.pipes[pipeID].threeElem = newPipe
	
				visiblePipes.add(newPipe.makeMesh());
				
			}

		}

		fr.readAsArrayBuffer(f);


	}



	VF_FF.fromVF = {

		"201": function (vfElem) {
			//pipe: Steel


			var newElem = ffDefaults["201"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[8] = vfElem[1];    // Unique Name
			newElem[6] = vfElem[2];    // Node 1
			newElem[7] = vfElem[3];    // Node 2
			newElem[10] = vfElem[4];    // Length
			newElem[14] = vfElem[5];    // Nom. Dia
			newElem[15] = vfElem[6];    // Schedule
			newElem[66] = vfElem[7];    // Nom. Size ID

			return newElem

		},

		"301": function (vfElem) {
			//Boundary: Known pressure

			var newElem = ffDefaults["301"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2
			newElem[11] = vfElem[13];    // Known Pressure
			newElem[12] = unitLookup[vfElem[14]];    // Pressure Unit
			newElem[13] = vfElem[15];    // Temperature
			newElem[14] = unitLookup[vfElem[16]];    // Temperature Unit

			return newElem

		},

		"302": function (vfElem) {
			//Boundary: Known flow

			var newElem = ffDefaults["302"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2
			newElem[11] = vfElem[11];    // Known Flow
			newElem[12] = unitLookup[vfElem[12]];    // Flow Unit
			newElem[10] = (vfElem[3] == "Outlet") ? "1" : "-1"   //flow direction, "1" indicates outwards flow
			newElem[13] = vfElem[15] || newElem[13];    // Temperature
			newElem[14] = unitLookup[vfElem[16]] || newElem[14];    // Temperature Unit

			return newElem

		},

		"304": function (vfElem) {
			//Boundary: Open pipe

			var newElem = ffDefaults["304"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2

			return newElem

		},

		"402": function (vfElem) {
			//Junction: Elbow

			var newElem = ffDefaults["402"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2

			return newElem

		},

		"405": function (vfElem) {
			//Junction: Tee

			var newElem = ffDefaults["405"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2
			newElem[12] = vfElem[10];  // Branch Pipe

			return newElem

		},

		"408": function (vfElem) {
			//Junction: Cross

			var newElem = ffDefaults["408"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2

			return newElem

		},

		"501": function (vfElem) {
			//Pump: Centrifugal

			var newElem = ffDefaults["501"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2

			return newElem

		},

		"601": function (vfElem) {
			//Valve: Butterfly

			var newElem = ffDefaults["601"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2

			return newElem

		},

		"603": function (vfElem) {
			//Valve: Ball

			var newElem = ffDefaults["603"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2

			return newElem

		},

		"604": function (vfElem) {
			//Valve: Gate

			var newElem = ffDefaults["604"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2

			return newElem

		},

		"605": function (vfElem) {
			//Valve: Globe

			var newElem = ffDefaults["605"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2

			return newElem

		},

		"801": function (vfElem) {
			//Valve: Gate

			var newElem = ffDefaults["801"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2

			return newElem

		},

		"901": function (vfElem) {
			//GeneralResistances: K

			var newElem = ffDefaults["901"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2
			newElem[11] = vfElem[17];    // K Value
			newElem[19] = vfElem[18];    // Heat Duty
			newElem[20] = unitLookup[vfElem[19]];    // Heat Units

			return newElem

		},

		"1005": function (vfElem) {
			//Size Change: Reducer

			var newElem = ffDefaults["1005"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2

			return newElem

		},

		"1006": function (vfElem) {
			//Size Change: Abrupt

			var newElem = ffDefaults["1006"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2

			return newElem

		},

	// "1201": function (vfElem) {
			//Heat Exchanger

			// var newElem = ffDefaults["1201"].slice()

			// newElem[1] = vfElem[0];    // Component Number
			// newElem[6] = vfElem[1];    // Unique Name
			// newElem[8] = vfElem[5];    // Elevation
			// newElem[2] = vfElem[6];    // X1
			// newElem[3] = vfElem[7];    // Y1
			// newElem[4] = vfElem[8];    // X2
			// newElem[5] = vfElem[9];    // Y2

			// return newElem

		// },

		"1201": function (vfElem) {
			//Heat Exchanger imported as General K resistance

			var newElem = ffDefaults["901"].slice()

			newElem[1] = vfElem[0];    // Component Number
			newElem[6] = vfElem[1];    // Unique Name
			newElem[8] = vfElem[5];    // Elevation
			newElem[2] = vfElem[6];    // X1
			newElem[3] = vfElem[7];    // Y1
			newElem[4] = vfElem[8];    // X2
			newElem[5] = vfElem[9];    // Y2
			newElem[11] = vfElem[17];    // K Value
			newElem[19] = vfElem[18];    // Heat Duty
			newElem[20] = unitLookup[vfElem[19]];    // Heat Units

			return newElem

		},

	}
	
	
// Process files
	
	console.log(window.PIPE)
	
	if (window.PIPE !== undefined){
		
		var loadVFxl = {}
		
		loadVFxl.test = /\.xls[xm]$/i
		
		loadVFxl.func = processVFxl
		
		PIPE.fileLoaders.push(loadVFxl)
	}
	
	
	
	

}(window.VF_FF = window.VF_FF || {}));