var TopLevelNodeView = function(topLevelNode, entryViewClickCallback) {

    var that = this;

    if (!(topLevelNode instanceof d83toplevelnode)) {
	throw new TypeError('expecting a d83toplevelnode as ' +
			    'the first argument');
    }

    if (typeof(entryViewClickCallback) !== 'function') {
	throw new TypeError('entryViewClickCallback must be a function');
    }

    var box = null;
    var panelFooter = null;
    var panelFooterTotal = null;
    var panelBody = null;
    var isLoaded = false;


    var loadNodes = function() {
	for (node in topLevelNode.nodes) {

	    if ('watch' === node) continue;

	    var nodeView = new NodeView(topLevelNode.nodes[node],
					entryViewClickCallback);

	    nodeView.setUserChangePriceCallback(
		internalUserChangePriceCallback);
	    

	    panelBody.appendChild(nodeView.getElement());
	}
    };
    
    (function() {

	//
	// setup for the container
	//

	box = document.createElement('div');
	box.classList.add('panel');
	box.classList.add('panel-primary');


    
	var topLevelNodeHeader = document.createElement('div');
	topLevelNodeHeader.classList.add('panel-heading');
	topLevelNodeHeader.innerHTML = '<h3 class="panel-title">' +
	    topLevelNode.getPrettyPath() + ' ' +
	    topLevelNode.nodeSummary + '</h3>';
	topLevelNodeHeader.style.cursor = 'pointer';
	box.appendChild(topLevelNodeHeader);
	

	panelBody = document.createElement('div');
	panelBody.classList.add('panel-body');
	panelBody.classList.add('panel-group');
	panelBody.style.display = 'none';
	box.appendChild(panelBody);


	//
	// panel footer
	//
	panelFooter = document.createElement('div');
	panelFooter.classList.add('panel-footer');
	box.appendChild(panelFooter);
	panelFooter.style.display = 'none';

	panelFooterTotal = document.createElement('div');
	panelFooterTotal.classList.add('col-md-offset-11');
	panelFooter.appendChild(panelFooterTotal);


	panelFooterTotal.appendChild(
	    document.createTextNode(topLevelNode.getNetTotal()));

	//
	// make collapsible
	//
	topLevelNodeHeader.addEventListener('click', function(evt) {
	    if (panelBody.style.display === 'none') {

		if (!isLoaded) {

		    isLoaded = true;

		    loadNodes();
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

    this.getElement = function() {
	return box;
    };

    var setFooter = function(newValue) {
	if (panelFooterTotal.hasChildNodes()) {
	    panelFooterTotal.removeChild(
		panelFooterTotal.firstChild);
	}



	panelFooterTotal.appendChild(
	    document.createTextNode(newValue));

    };


    var internalUserChangePriceCallback = function(node) {
	var centsPerEuro = 100;

	var prettyTotal = (topLevelNode.getNetTotal() / centsPerEuro).toFixed(2);

	setFooter(prettyTotal);

    };

};
