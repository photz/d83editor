var NodeView = function(node, entryViewClickCallback) {
    if (!(node instanceof d83node)) {
	throw new TypeError('expecting a d83node');
    }

    if (typeof(entryViewClickCallback) != 'function') {
	throw new TypeError('argument entryViewClickCallback' +
			    'must be a function');
    }


    var externalUserChangePriceCallback;

    this.setUserChangePriceCallback = function(func) {
	if (typeof(func) != 'function') {
	    throw new TypeError('expecting a function');
	}

	externalUserChangePriceCallback = func;
    };



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

    var setFooter = function(newValue) {
	if (panelFooterTotal.hasChildNodes()) {
	    panelFooterTotal.removeChild(
		panelFooterTotal.firstChild);
	}

	panelFooterTotal.appendChild(
	    document.createTextNode(newValue));

    };
    
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



    // whenever the user changes the price for an entry,
    // then two things should happen:
    // * inside the NodeView we update the price
    // * and we notify the outside world
    var internalUserChangePriceCallback = function(entry) {
	setFooter(node.getNetTotal());

	if (typeof(externalUserChangePriceCallback) === 'function') {
	    externalUserChangePriceCallback(node);
	}
    };
    


    for (entry in node.entries) {
	if ('watch' == entry) continue;

	var thisEntry = node.entries[entry];

	var entryView = new EntryView(thisEntry);

	rightBox.appendChild(entryView.getElement());

	// set callbacks

	entryView.setClickCallback(entryViewClickCallback);

	entryView.setUserChangePriceCallback(
	    internalUserChangePriceCallback);

    }




    this.getElement = function() {
	return box;
    };

};
