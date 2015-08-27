// displays a list of files
var FileList = function() {

    var that = this;

    var container = document.createElement('div');

    var userOpenFileCallback;

    this.setOpenFileCallback = function(func) {
	if (typeof(func) !== 'function') {
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
