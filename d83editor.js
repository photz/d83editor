
// displays a list of files
var FileList = function() {

    var that = this;

    var container = document.createElement('div');

    var userOpenFileCallback;

    this.setOpenFileCallback = function(func) {
	if (typeof(func) != 'function') {
	    throw new TypeError('the callback needs to be a function');
	}

	userOpenFileCallback = func;
    };

    this.update = function(files) {
	container.innerHTML = '';

	var list = document.createElement('ul');
	container.appendChild(list);


	for (var i = 0, file; i < files.length; i++) {
	    
	    var file = files[i];

	    var listEl = document.createElement('li');
	    listEl.innerHTML = escape(file.name);
	    list.appendChild(listEl);

	    listEl.addEventListener('click', function() {
		userOpenFileCallback(file);
	    });
	}
    };

    this.getElement = function() {
	return container;
    };
    
};




var d83editor = function() {

    var that = this;

    
    //
    // style
    //

    entryBg = '#fff';
    nodeBg = 'rgb(209, 231, 81)';
    topLevelNodeBg = '#fff';

    //
    // private attributes
    //

    

    var container = document.getElementById('d83editor');

    var parser = true;

    var files;

    //
    // private methods
    //

    var loadFileCallback = function(reader, file) {
	var text = Cp437Helper().convertToUTF8(reader.result);

	parser = new d83parser(text);

	parser.parse();

	that.redraw();
    };


    var openFileCallback = function(file) {

	var reader = new FileReader();

	reader.onload = function() {
	    loadFileCallback(reader, file)
	};

	reader.readAsArrayBuffer(file);
	

    };

    var fileList = new FileList();
    fileList.setOpenFileCallback(openFileCallback);



    var UploadForm = function(callback) {
	var formGroup = document.createElement('div');
	formGroup.classList.add('form-group');

	var label = document.createElement('label');
	label.classList.add('label-control');
	label.innerHTML = 'Upload a d83 file';
	formGroup.appendChild(label);

	var fileInput = document.createElement('input');
	fileInput.multiple = true;
	fileInput.type = 'file';
	formGroup.appendChild(fileInput);

	// setup for the callback
	fileInput.addEventListener('change', callback, false);

	return formGroup;
    };

    var handleFileSelect = function(evt) {
	files = evt.target.files;
	fileList.update(files);
    };


    
    var setupView = function() {
	container.innerHTML = '';
	container.classList.add('container');
	container.classList.add('row');

	var top = document.createElement('div');
	top.classList.add('row');
	container.appendChild(top);

	top.appendChild(new UploadForm(handleFileSelect));
	top.appendChild(fileList.getElement());

	var bottom = document.createElement('div');
	bottom.classList.add('row');
	container.appendChild(bottom);
	

	list = document.createElement('div');
	list.classList.add('col-md-8');
	bottom.appendChild(list);

	details = document.createElement('div');
	details.classList.add('col-md-4');
	details.classList.add('well');
	bottom.appendChild(details);
    };

    setupView();

    
    var Row = function(entry) {
	var row = document.createElement('div');
	row.classList.add('row');
	row.style['background-color'] = entryBg;

	row.onclick = function(event) {

	    // var bodyRect = document.body.getBoundingClientRect(),
	    // 	elemRect = element.getBoundingClientRect(),
	    // 	offset   = elemRect.top - bodyRect.top;

	    // alert('Element is ' + offset + ' vertical pixels from <body>');

	    var rowRect = row.getBoundingClientRect(),
		containerRect = container.getBoundingClientRect();


	    details.innerHTML = entry.description;

	    details.style['margin-top'] = rowRect.top;

	};

	var posField = document.createElement('div');
	posField.classList.add('col-md-1');
	row.appendChild(posField);
	posField.innerHTML = entry.lvl3;

	var summaryField = document.createElement('div');
	row.appendChild(summaryField);
	summaryField.classList.add('col-md-4');
	summaryField.innerHTML = entry.summary;

	if (entry instanceof d83entry) {
	    var quantityField = document.createElement('div');
	    quantityField.classList.add('col-md-2');
	    quantityField.innerHTML = entry.quantity;
	    row.appendChild(quantityField);

	    var priceField = document.createElement('div');
	    priceField.classList.add('col-md-2');
	    row.appendChild(priceField);
	    
	    var priceInput = document.createElement('input');
	    priceInput.classList.add('form-control');
	    priceField.appendChild(priceInput);
	    
	}

	return row;
    };

    var drawEntry = function(entry) {
	return new Row(entry);
    };

    var drawNode = function(node) {
	var box = document.createElement('div');
	box.classList.add('row');
	box.style['background-color'] = nodeBg;
	
	var leftBox = document.createElement('div');
	leftBox.innerHTML = node.lvl2;
	leftBox.classList.add('col-md-1');
	box.appendChild(leftBox);

	var rightBox = document.createElement('div');
	rightBox.classList.add('col-md-11');
	box.appendChild(rightBox);
	
	var nodeHeader = document.createElement('div');
	nodeHeader.innerHTML =
	    '<h4>' + node.nodeSummary + '</h4>';
	rightBox.appendChild(nodeHeader);


	for (entry in node.entries) {
	    if ('watch' == entry) continue;

	    rightBox.appendChild(drawEntry(node.entries[entry]));
	}

	return box;
    };

    var drawTopLevelNode = function(topLevelNode) {
	var box = document.createElement('div');
	box.classList.add('row');
	box.style['background-color'] = topLevelNodeBg;
	
	var leftBox = document.createElement('div');
	leftBox.innerHTML = topLevelNode.lvl1;
	leftBox.classList.add('col-md-1');
	box.appendChild(leftBox);

	var rightBox = document.createElement('div');
	rightBox.classList.add('col-md-11');
	box.appendChild(rightBox);

	var topLevelNodeHeader = document.createElement('div');
	topLevelNodeHeader.innerHTML =
	    '<h3>' + topLevelNode.nodeSummary + '</h3>';
	rightBox.appendChild(topLevelNodeHeader);


	for (node in topLevelNode.nodes) {

	    if ('watch' == node) continue;

	    rightBox.appendChild(drawNode(topLevelNode.nodes[node]));
	}

	return box;
    };

    var drawDir = function(dir) {
	var box = document.createElement('div');

	for (topLevelNode in dir) {
	    if ('watch' == topLevelNode) continue;

	    box.appendChild(drawTopLevelNode(dir[topLevelNode]));
	}

	return box;
    };

    this.redraw = function() {

	list.innerHTML = '';

	list.appendChild(drawDir(parser.dir));
    };

};
