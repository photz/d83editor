var NodeView = function(node, entryViewClickCallback) {
    if (!(node instanceof d83node)) {
	throw new TypeError('expecting a d83node');
    }

    if (typeof(entryViewClickCallback) !== 'function') {
	throw new TypeError('argument entryViewClickCallback' +
			    'must be a function');
    }


    var externalUserChangePriceCallback = null;

    var isLoaded = false;

    var box = null;    

    var panelBody = null;


    var loadEntries = function() {
	
	for (entry in node.entries) {
	    if ('watch' === entry) continue;

	    var thisEntry = node.entries[entry];

	    var entryView = new EntryView(thisEntry);

	    panelBody.appendChild(entryView.getElement());

	    // set callbacks

	    entryView.setClickCallback(entryViewClickCallback);

	    entryView.setUserChangePriceCallback(
		internalUserChangePriceCallback);

	}

    };



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
    

    
    (function() {
	
	box = document.createElement('div');
	box.classList.add('panel');
	box.classList.add('panel-default');
	
	var panelHeading = document.createElement('div');
	panelHeading.classList.add('panel-heading');
	panelHeading.style.cursor = 'pointer';
	box.appendChild(panelHeading);

	var panelTitle = document.createElement('h4');
	panelTitle.classList.add('panel-title');
	panelTitle.appendChild(
	    document.createTextNode([node.getPrettyPath(),
				     node.nodeSummary].join(' ')));
	panelHeading.appendChild(panelTitle);

	panelBody = document.createElement('div');
	panelBody.classList.add('panel-body');
	panelBody.classList.add('list-group');
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

	var setFooter = function(newValue) {
	    if (panelFooterTotal.hasChildNodes()) {
		panelFooterTotal.removeChild(
		    panelFooterTotal.firstChild);
	    }

	    panelFooterTotal.appendChild(
		document.createTextNode(newValue));

	};
	
	// make collapsible
	panelHeading.addEventListener('click', function(evt) {
	    if (panelBody.style.display === 'none') {
		if (!isLoaded) {
		    isLoaded = true;

		    loadEntries();
		}

		panelBody.style.display = 'block';
		panelFooter.style.display = 'block';
	    }
	    else {
		panelBody.style.display = 'none';
		panelFooter.style.display = 'none';
	    }
	});

    })();


    
    this.setUserChangePriceCallback = function(func) {
	if (typeof(func) !== 'function') {
	    throw new TypeError('expecting a function');
	}

	externalUserChangePriceCallback = func;
    };





    this.getElement = function() {
	return box;
    };

};
