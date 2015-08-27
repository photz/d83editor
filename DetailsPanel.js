var DetailsPanel = function(container) {

    var detailsPanel = document.createElement('div');
    detailsPanel.classList.add('panel');
    detailsPanel.classList.add('panel-info');
    detailsPanel.style.position = 'absolute';
    detailsPanel.style.display = 'none';
    
    container.appendChild(detailsPanel);

    var detailsPanelHeading = document.createElement('div');
    detailsPanel.appendChild(detailsPanelHeading);
    detailsPanelHeading.classList.add('panel-heading');

    var detailsPanelTitle = document.createElement('h4');
    detailsPanelHeading.appendChild(detailsPanelTitle);
    detailsPanelTitle.classList.add('panel-title');

    var detailsPanelBody = document.createElement('div');
    detailsPanel.appendChild(detailsPanelBody);
    detailsPanelBody.classList.add('panel-body');

    var detailsPanelBodyPar = document.createElement('p');
    detailsPanelBody.appendChild(detailsPanelBodyPar);


    this.showPanel = function() {
	detailsPanel.style.display = 'block';
    };

    this.hidePanel = function() {
	detailsPanel.style.display = 'none';
    };

    this.setEntry = function(entry) {

	if (!(entry instanceof d83entry)) {
	    throw TypeError('the variable `entry` does not refer to a d83entry object');
	}

	// clear the current title
	if (detailsPanelTitle.hasChildNodes()) {
	    detailsPanelTitle.removeChild(
		detailsPanelTitle.firstChild);
	}
	
	// set the new title
	detailsPanelTitle.appendChild(
	    document.createTextNode(entry.getPrettyPath()));

	// clear the body
	if (detailsPanelBodyPar.hasChildNodes()) {
	    detailsPanelBodyPar.removeChild(
		detailsPanelBodyPar.firstChild);
	}

	detailsPanelBodyPar.appendChild(
	    document.createTextNode(entry.description));
	
    };

    this.alignWithRow = function(entryView) {
	
	if (!(entryView instanceof EntryView)) {
	    throw new TypeError('expecting an EntryView');
	}

	var rowRect = getOffsetRect(entryView.getElement());

	var detailsContRect = getOffsetRect(container);

	var toppx = rowRect.top - detailsContRect.top;
	
	detailsPanel.style.top = toppx.toString() + 'px';
    };

};
