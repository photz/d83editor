var TopLevelNodeView = function(topLevelNode, entryViewClickCallback) {

    var that = this;

    if (!(topLevelNode instanceof d83toplevelnode)) {
	throw new TypeError('expecting a d83toplevelnode as ' +
			    'the first argument');
    }

    if (typeof(entryViewClickCallback) != 'function') {
	throw new TypeError('entryViewClickCallback must be a function');
    }

    var box = document.createElement('div');
    box.classList.add('panel');
    box.classList.add('panel-primary');

    this.getElement = function() {
	return box;
    };
    
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

    var setFooter = function(newValue) {
	if (panelFooterTotal.hasChildNodes()) {
	    panelFooterTotal.removeChild(
		panelFooterTotal.firstChild);
	}

	panelFooterTotal.appendChild(
	    document.createTextNode(newValue));

    };


    var internalUserChangePriceCallback = function(node) {
	setFooter(topLevelNode.getNetTotal());
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

	var nodeView = new NodeView(topLevelNode.nodes[node],
				    entryViewClickCallback);

	nodeView.setUserChangePriceCallback(
	    internalUserChangePriceCallback);
	

	panelBody.appendChild(nodeView.getElement());
    }

    

};
