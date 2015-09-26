var loadPipe = {}

loadPipe.test = /\.pipe$/i

loadPipe.func = function (file,ctx) {

    var reader = new FileReader();

    reader.onload = function () {

        ctx.model.loadJSON(reader.result);
        ctx.rebuildFromModel();
        ctx.centerView();

    };

    reader.readAsText(file);

}

PIPE.fileLoaders = [
    loadPipe
];

PIPE.loadFromFile = function (file,context){
    
    var i;
    
    context.clearAll();
    
    for (i=0; i<PIPE.fileLoaders.length; i++){
        var ld = PIPE.fileLoaders[i];
        if (ld.test.exec(file.name)){
            ld.func(file,context);
            return
        }
    }
    console.error("file type not recognized.")

}

