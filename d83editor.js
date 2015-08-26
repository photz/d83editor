
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

	var box = document.createElement('div');
	box.classList.add('panel');
	box.classList.add('panel-primary');
	container.appendChild(box);

	var panelHeading = document.createElement('div');
	panelHeading.classList.add('panel-heading');
	panelHeading.innerHTML = '<h4 class="panel-title">Files</h4>';
	box.appendChild(panelHeading);

	var list = document.createElement('div');
	list.classList.add('list-group');
	box.appendChild(list);


	for (var i = 0, file; i < files.length; i++) {
	    
	    var file = files[i];

	    var listEl = document.createElement('div');
	    listEl.classList.add('list-group-item');
	    listEl.innerHTML = escape(file.name);
	    listEl.style.cursor = 'pointer';
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

    var files = [];

    var currentFile = null;

    var activeEntry = null;

    //
    // private methods
    //

    var loadFileCallback = function(reader, file) {

	currentFile = file;

	file.text = Cp437Helper().convertToUTF8(reader.result);

	try {
	    file.d83parser = new d83parser(file.text);

	    
	    file.d83parser.parse();

	    files.push(file);

	    that.redraw(file.d83parser);
	}
	catch (e) {
	    alert('The file you uploaded does not seem to be a valid DA 90 file.');
	}
    };


    var openFileCallback = function(file) {

	if (files.indexOf(file) == -1) {
	    // it's a new file
	    
	    var reader = new FileReader();

	    reader.onload = function() {
		loadFileCallback(reader, file)
	    };

	    reader.readAsArrayBuffer(file);

	}
	else {
	    // we've seen this file before

	    currentFile = file;
	    
	    if (!('parser' in file)) {
		throw new Error('a file failed to have the parser property');
	    }
	    
	    that.redraw(file.parser);
	}
    };

    var fileList = new FileList();
    fileList.setOpenFileCallback(openFileCallback);



    var UploadForm = function(callback) {
	var panel = document.createElement('div');
	panel.classList.add('panel');
	panel.classList.add('panel-primary');

	//
	// panel heading
	//

	var panelHeading = document.createElement('div');
	panelHeading.classList.add('panel-heading');
	panelHeading.innerHTML = '<h4 class="panel-title">Upload a d83 file</h4>';
	panel.appendChild(panelHeading);


	//
	// panel body
	// 

	var panelBody = document.createElement('div');
	panelBody.classList.add('panel-body');
	panel.appendChild(panelBody);
	
	
	var formGroup = document.createElement('div');
	formGroup.classList.add('form-group');
	panelBody.appendChild(formGroup);

	var label = document.createElement('label');
	label.classList.add('label-control');
	label.innerHTML = 'Upload a d83 file';
	formGroup.appendChild(label);

	var fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.multiple = true;
	formGroup.appendChild(fileInput);

	// setup for the callback
	fileInput.addEventListener('change', callback, false);

	return panel;
    };

    var handleFileSelect = function(evt) {
	//files = evt.target.files;
	fileList.update(evt.target.files);
    };
    
    var setupView = function() {
	container.innerHTML = '';
	container.classList.add('container');
	container.classList.add('row');

	//
	// top
	// 

	var top = document.createElement('div');
	top.classList.add('row');
	container.appendChild(top);


	var uploadFormBox = document.createElement('div');
	uploadFormBox.classList.add('col-md-3');
	uploadFormBox.appendChild(new UploadForm(handleFileSelect));
	top.appendChild(uploadFormBox);


	var fileListBox = document.createElement('div');
	fileListBox.classList.add('col-md-3');
	fileListBox.appendChild(fileList.getElement());
	top.appendChild(fileListBox);


	//
	// bottom
	//

	var bottom = document.createElement('div');
	bottom.classList.add('row');
	container.appendChild(bottom);
	

	list = document.createElement('div');
	list.classList.add('col-md-8');
	bottom.appendChild(list);

	//
	// setup for the box that displays additional
	// information relevant to the selected entry
	//
	var detailsContainer = document.createElement('div');
	detailsContainer.classList.add('col-md-4');
	bottom.appendChild(detailsContainer);

	details = document.createElement('div');
	details.classList.add('well');
	detailsContainer.appendChild(details);
    };

    setupView();

    
    var Row = function(entry) {
	var row = document.createElement('div');
	row.classList.add('row');
	row.classList.add('list-group-item');
	row.style.cursor = 'pointer';

	row.onclick = function(event) {

	    if (activeEntry != null) {
		activeEntry.setInactive();
	    }

	    row.setActive();

	    activeEntry = row;

	    var rowRect = row.getBoundingClientRect(),
		containerRect = container.getBoundingClientRect();

	    details.innerHTML = '<p>' + entry.description + '</p>';

	};

	var posField = document.createElement('div');
	posField.classList.add('col-md-1');
	row.appendChild(posField);
	posField.innerHTML = entry.lvl3;

	var summaryField = document.createElement('div');
	row.appendChild(summaryField);
	summaryField.classList.add('col-md-6');
	summaryField.innerHTML = entry.summary;

	//
	// column for the quantity
	//
	var quantityField = document.createElement('div');
	quantityField.classList.add('col-md-2');
	quantityField.innerHTML = entry.quantity;
	row.appendChild(quantityField);

	//
	// column for the price
	//
	var priceField = document.createElement('div');
	priceField.classList.add('col-md-2');
	row.appendChild(priceField);
	
	var priceInput = document.createElement('input');
	priceInput.classList.add('form-control');
	priceField.appendChild(priceInput);
	
	//
	// column for the total price
	//
	var totalPriceField = document.createElement('div');
	totalPriceField.classList.add('col-md-1');
	row.appendChild(totalPriceField);

	//
	// callback to update the total price
	//
	priceInput.addEventListener('change', function(evt) {
	    if (isNaN(priceInput.value)) {
		totalPriceField.innerHTML = '<p>?</p>';
	    }
	    else {
		totalPriceField.innerHTML =
		    '<p>' + priceInput.value + '</p>';
	    }
	});

	row.setActive = function() {
	    row.classList.add('active');
	};

	row.setInactive = function() {
	    row.classList.remove('active');
	};

	return row;
    };

    var drawEntry = function(entry) {
	return new Row(entry);
    };

    var drawNode = function(node) {
	var box = document.createElement('div');
	box.classList.add('panel');
	box.classList.add('panel-default');
	
	var nodeHeader = document.createElement('div');
	nodeHeader.classList.add('panel-heading');
	nodeHeader.innerHTML = '<h4 class="panel-title">' +
	    node.nodeSummary + '</h4>';
	nodeHeader.style.cursor = 'pointer';
	box.appendChild(nodeHeader);

	var rightBox = document.createElement('div');
	rightBox.classList.add('panel-body');
	rightBox.classList.add('list-group');
	rightBox.style.display = 'none';
	box.appendChild(rightBox);

	// make collapsible
	nodeHeader.addEventListener('click', function(evt) {
	    if (rightBox.style.display == 'none') {
		rightBox.style.display = 'block';
	    }
	    else {
		rightBox.style.display = 'none';
	    }
	});

	for (entry in node.entries) {
	    if ('watch' == entry) continue;

	    rightBox.appendChild(drawEntry(node.entries[entry]));
	}

	return box;
    };

    var drawTopLevelNode = function(topLevelNode) {
	var box = document.createElement('div');
	box.classList.add('panel');
	box.classList.add('panel-primary');
	
	var topLevelNodeHeader = document.createElement('div');
	topLevelNodeHeader.classList.add('panel-heading');
	topLevelNodeHeader.innerHTML = '<h3 class="panel-title">' +
	    topLevelNode.nodeSummary + '</h3>';
	topLevelNodeHeader.style.cursor = 'pointer';
	box.appendChild(topLevelNodeHeader);
	

	var rightBox = document.createElement('div');
	rightBox.classList.add('panel-body');
	rightBox.classList.add('panel-group');
	rightBox.style.display = 'none';
	box.appendChild(rightBox);

	// make collapsible
	topLevelNodeHeader.addEventListener('click', function(evt) {
	    if (rightBox.style.display == 'none') {
		rightBox.style.display = 'block';
	    }
	    else {
		rightBox.style.display = 'none';
	    }
	});

	for (node in topLevelNode.nodes) {

	    if ('watch' == node) continue;

	    rightBox.appendChild(drawNode(topLevelNode.nodes[node]));
	}

	return box;
    };

    var drawDir = function(dir) {
	var box = document.createElement('div');
	box.classList.add('panel-group');

	for (topLevelNode in dir) {
	    if ('watch' == topLevelNode) continue;

	    box.appendChild(drawTopLevelNode(dir[topLevelNode]));
	}

	return box;
    };

    this.redraw = function(parser) {

	if (!(parser instanceof d83parser)) {
	    throw new TypeError('d83editor.redraw() expects a d83parser');
	}

	list.innerHTML = '';

	list.appendChild(drawDir(parser.dir));
    };

};
