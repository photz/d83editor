
var EntryView = function(entry) {
    var that = this;

    if (!(entry instanceof d83entry)) {
	throw new TypeError('expecting a d83entry');
    }
    
    var box = null;

    var externalUserChangePriceCallback = null;

    
    (function() {

	//
	// setup for the containing div element
	//

	box = document.createElement('div');
	box.classList.add('row');
	box.classList.add('list-group-item');
	box.style.cursor = 'pointer';

	//
	// setup for the position/path column
	//

	var posField = document.createElement('div');
	posField.classList.add('col-md-1');
	box.appendChild(posField);

	//
	// create a label for this entry's path/position
	//
	var label = document.createElement('span');
	label.classList.add('label');
	label.classList.add('label-default');
	label.appendChild(document.createTextNode(entry.getPrettyPath()));
	posField.appendChild(label);

	//
	// setup for the summary column
	//
	var summaryField = document.createElement('div');
	box.appendChild(summaryField);
	summaryField.classList.add('col-md-6');
	summaryField.innerHTML = entry.summary;

	
	//
	// column for the quantity
	//
	var quantityField = document.createElement('div');
	quantityField.classList.add('col-md-2');
	quantityField.innerHTML = entry.quantity;
	box.appendChild(quantityField);

	//
	// column for the price
	//
	var priceField = document.createElement('div');
	priceField.classList.add('col-md-2');
	priceField.classList.add('form-group');
	box.appendChild(priceField);
	
	var priceInput = document.createElement('input');
	priceInput.classList.add('form-control');
	priceField.appendChild(priceInput);

	//
	// column for the total price
	//
	var totalPriceField = document.createElement('div');
	totalPriceField.classList.add('col-md-1');
	box.appendChild(totalPriceField);

	//
	// callback to update the total price
	//
	priceInput.addEventListener('change', function(evt) {

	    var priceRegex = /^\d+(,(\d\d))?$/;

	    var matches = priceRegex.exec(priceInput.value);

	    if (matches === null) {

		priceField.classList.add('has-error');
	    }
	    else {

		var centsPerEuro = 100;


		var priceCents = parseInt(matches[0]) * centsPerEuro;

		if (matches[2] !== undefined) {
		    priceCents += parseInt(matches[2]);
		}


		// clear the contents of the node
		if (totalPriceField.hasChildNodes()) {
		    totalPriceField.removeChild(
			totalPriceField.firstChild);
		}

		// in case the field had an error previously
		// reset it
		priceField.classList.remove('has-error');


		entry.netPricePerUnit = priceCents;

		var prettyTotal = (entry.getNetTotal() / 100).toFixed(2);

		totalPriceField.appendChild(
		    document.createTextNode(prettyTotal));

		// notify the outside world that a price has been changed
		externalUserChangePriceCallback();
	    }
	});

    })();


    this.getElement = function() {
	return box;
    };

    this.setClickCallback = function(func) {
	if (typeof(func) !== 'function') {
	    throw new TypeError('expecting a function as a callback');
	}

	box.onclick = function(evt) {
	    func(that);
	};
    };

    this.getEntry = function() {
	return entry;
    };

    this.setUserChangePriceCallback = function(func) {
	if (typeof(func) !== 'function') {
	    throw new TypeError('expecting a function');
	}

	externalUserChangePriceCallback = func;
    };
    

    this.setActive = function() {
	box.classList.add('active');
    };

    this.setInactive = function() {
	box.classList.remove('active');
    };

};
