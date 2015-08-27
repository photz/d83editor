
var EntryView = function(entry) {
    var that = this;

    var row = document.createElement('div');
    row.classList.add('row');
    row.classList.add('list-group-item');
    row.style.cursor = 'pointer';

    this.getElement = function() {
	return row;
    };

    this.setClickCallback = function(func) {
	if (typeof(func) != 'function') {
	    throw new TypeError('expecting a function as a callback');
	}

	row.onclick = function(evt) {
	    func(that);
	};
    };


    var posField = document.createElement('div');
    posField.classList.add('col-md-1');
    row.appendChild(posField);

    // create a label for this entry's path/position
    var label = document.createElement('span');
    label.classList.add('label');
    label.classList.add('label-default');
    label.appendChild(document.createTextNode(entry.getPrettyPath()));
    posField.appendChild(label);

    var summaryField = document.createElement('div');
    row.appendChild(summaryField);
    summaryField.classList.add('col-md-6');
    summaryField.innerHTML = entry.summary;

    this.getEntry = function() {
	return entry;
    };
    
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
    priceField.classList.add('form-group');
    row.appendChild(priceField);
    
    var priceInput = document.createElement('input');
    priceInput.classList.add('form-control');
    priceField.appendChild(priceInput);

    var externalUserChangePriceCallback;

    this.setUserChangePriceCallback = function(func) {
	if (typeof(func) != 'function') {
	    throw new TypeError('expecting a function');
	}

	externalUserChangePriceCallback = func;
    };
    
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
	    priceField.classList.add('has-error');
	}
	else {
	    entry.netPricePerUnit = parseFloat(priceInput.value);
	    priceField.classList.remove('has-error');
	    
	    totalPriceField.innerHTML =
		'<p>' + entry.getNetTotal() + '</p>';

	    externalUserChangePriceCallback();
	}
    });

    this.setActive = function() {
	row.classList.add('active');
    };

    this.setInactive = function() {
	row.classList.remove('active');
    };

};
