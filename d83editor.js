


function getOffsetRect(elem) {
    // (1)
    var box = elem.getBoundingClientRect()
    var body = document.body
    var docElem = document.documentElement
    // (2)
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
    // (3)

    var clientTop = docElem.clientTop || body.clientTop || 0
    var clientLeft = docElem.clientLeft || body.clientLeft || 0
    // (4)
    var top  = box.top +  scrollTop - clientTop

    var left = box.left + scrollLeft - clientLeft
    return { top: Math.round(top), left: Math.round(left) }
};


var NodeView = function() {

};

var TopLevelNodeView = function() {

};

var DirView = function() {

};


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
    // private attributes
    //

    var container = document.getElementById('d83editor');

    var files = [];

    var currentFile = null;

    var activeEntry = null;

    var detailsPanel = null;

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
	    if (e instanceof d83FormatViolationError) {
		alert('The file you uploaded does not seem to be a valid DA 90 file.');
	    }
	    else {
		alert('An error occurred: ' + e);
		throw e;
	    }
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

	// we want to be able to align the details panel
	// vertically with the active row
	detailsContainer.style.position = 'relative';

	detailsPanel = new DetailsPanel(detailsContainer);

    };

    setupView();

    
    var drawEntry = function(entry) {
	return new Row(entry);
    };

    var entryViewClickCallback = function(entryView) {
	if (!(entryView instanceof EntryView)) {
	    throw new TypeError('expecting an EntryView');
	}

	if (activeEntry != null) {
	    activeEntry.setInactive();
	}

	activeEntry = entryView;

	activeEntry.setActive();

	detailsPanel.setEntry(activeEntry.getEntry());

	detailsPanel.alignWithRow(activeEntry);

	detailsPanel.showPanel();
    };

    var userChangePriceCallback = function(entry) {
	console.log('user changed entry `' + entry.summary + '`');
    };
    
    var drawNode = function(node) {
	var box = document.createElement('div');
	box.classList.add('panel');
	box.classList.add('panel-default');
	
	var nodeHeader = document.createElement('div');
	nodeHeader.classList.add('panel-heading');
	nodeHeader.innerHTML = '<h4 class="panel-title">' +
	    node.getPrettyPath() + ' ' + node.nodeSummary + '</h4>';
	nodeHeader.style.cursor = 'pointer';
	box.appendChild(nodeHeader);

	var rightBox = document.createElement('div');
	rightBox.classList.add('panel-body');
	rightBox.classList.add('list-group');
	rightBox.style.display = 'none';
	box.appendChild(rightBox);

	//
	// panel footer
	//
	var panelFooter = document.createElement('div');
	panelFooter.classList.add('panel-footer');
	box.appendChild(panelFooter);
	panelFooter.style.display = 'none';

	var panelFooterTotal = document.createElement('div');
	panelFooterTotal.classList.add('col-md-offset-11');
	panelFooter.appendChild(panelFooterTotal);


	panelFooterTotal.appendChild(
	    document.createTextNode(node.getNetTotal()));
	
	// make collapsible
	nodeHeader.addEventListener('click', function(evt) {
	    if (rightBox.style.display == 'none') {
		rightBox.style.display = 'block';
		panelFooter.style.display = 'block';
	    }
	    else {
		rightBox.style.display = 'none';
		panelFooter.style.display = 'none';
	    }
	});

	for (entry in node.entries) {
	    if ('watch' == entry) continue;

	    var thisEntry = node.entries[entry];

	    var entryView = new EntryView(thisEntry);

	    rightBox.appendChild(entryView.getElement());

	    // set callbacks

	    entryView.setClickCallback(entryViewClickCallback);

	    entryView.setUserChangePriceCallback(userChangePriceCallback);

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
	    topLevelNode.getPrettyPath() + ' ' +
	    topLevelNode.nodeSummary + '</h3>';
	topLevelNodeHeader.style.cursor = 'pointer';
	box.appendChild(topLevelNodeHeader);
	

	var panelBody = document.createElement('div');
	panelBody.classList.add('panel-body');
	panelBody.classList.add('panel-group');
	panelBody.style.display = 'none';
	box.appendChild(panelBody);


	//
	// panel footer
	//
	var panelFooter = document.createElement('div');
	panelFooter.classList.add('panel-footer');
	box.appendChild(panelFooter);
	panelFooter.style.display = 'none';

	var panelFooterTotal = document.createElement('div');
	panelFooterTotal.classList.add('col-md-offset-11');
	panelFooter.appendChild(panelFooterTotal);


	panelFooterTotal.appendChild(
	    document.createTextNode(topLevelNode.getNetTotal()));

	box.updateNetTotal = function() {
	    
	};

	//
	// make collapsible
	//
	topLevelNodeHeader.addEventListener('click', function(evt) {
	    if (panelBody.style.display == 'none') {
		panelBody.style.display = 'block';
		panelFooter.style.display = 'block';
	    }
	    else {
		panelBody.style.display = 'none';
		panelFooter.style.display = 'none';
	    }
	});

	for (node in topLevelNode.nodes) {

	    if ('watch' == node) continue;

	    panelBody.appendChild(drawNode(topLevelNode.nodes[node]));
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
