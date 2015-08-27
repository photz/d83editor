
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
	row.onclick = function(evt) {
	    func(that);
	};
    };


    var posField = document.createElement('div');
    posField.classList.add('col-md-1');
    row.appendChild(posField);
    //posField.appendChild(document.createTextNode(
    //entry.getPrettyPath()));

    posField.innerHTML = '<span class="label label-default">' + entry.getPrettyPath() + '</span>';

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
    row.appendChild(priceField);
    
    var priceInput = document.createElement('input');
    priceInput.classList.add('form-control');
    priceField.appendChild(priceInput);

    this.setUserChangePriceCallback = function(func) {
	priceInput.onchange = function(evt) {
	    func(entry);
	};
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
	    totalPriceField.innerHTML = '<p>?</p>';
	}
	else {
	    var pricePerUnit = parseFloat(priceInput.value);
	    
	    totalPriceField.innerHTML =
		'<p>' + priceInput.value + '</p>';
	}
    });

    this.setActive = function() {
	row.classList.add('active');
    };

    this.setInactive = function() {
	row.classList.remove('active');
    };

};
