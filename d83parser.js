function d83FormatViolationError(message) {
    this.message = message;
 
   // Use V8's native method if available, otherwise fallback
    if ("captureStackTrace" in Error)
        Error.captureStackTrace(this, d83FormatViolationError);
    else
        this.stack = (new Error()).stack;
}

d83FormatViolationError.prototype = Object.create(Error.prototype);
d83FormatViolationError.prototype.name = "d83FormatViolationError";
d83FormatViolationError.prototype.constructor = d83FormatViolationError;

var Unit = {
    M: function() {
	
    },

    M2: function() {

	
    },

    M3: function() {
	

    },

    KG: function() {
	
    },

    T: function() {
	
    },

    L: function() {
	
    },
    
};

// TODO rename to d83quantity?
var Quantity = function(pre, post, unit) {
    var that = this;

    this.pre = parseInt(pre);
    this.post = parseInt(post);
    this.unit = unit;

    

    this.toString = function() {
	return that.pre + ' ' + that.unit;
    };
};

var d83toplevelnode = function(lvl1) {
    var that = this;
    
    if (isNaN(lvl1)) {
	throw new TypeError('the lvl1 of a top-level node may not be NaN');
    }


    this.lvl1 = lvl1;

    this.nodeSummary = '';

    this.summary = '';

    this.nodes = {
	watch: undefined
    };

    this.getPrettyPath = function() {
	return that.lvl1.toString();
    };

    // FIXME maybe it'll be necessary to cache the results
    // and recaculate whenever they change
    this.getNetTotal = function() {
	var sum = 0;

	for (node in that.nodes) {

	    if ('watch' == node) continue;
	    
	    sum += that.nodes[node].getNetTotal();

	}

	return sum;
    };

    this.toString = function() {
	return that.summary;
    };
};

var d83node = function(lvl1, lvl2) {
    var that = this;

    if (isNaN(lvl1)) {
	throw new TypeError('the lvl1 of a node may not be NaN');
    }

    if (isNaN(lvl2)) {
	throw new TypeError('the lvl2 of a node may not be NaN');
    }


    this.lvl1 = lvl1;
    this.lvl2 = lvl2;

    this.nodeSummary = '';
    this.summary = '';

    this.getPrettyPath = function() {
	return that.lvl1 + '.' + that.lvl2;
    };

    this.getNetTotal = function() {
	var sum = 0;

	for (entry in that.entries) {
	    if ('watch' == entry) continue;

	    sum += that.entries[entry].getNetTotal();
	}

	return sum;
    };

    this.entries = {
	watch: undefined
    };

    this.toString = function() {
	return that.lvl1.toString() + '/' + that.lvl2.toString() + ' ' + that.summary;
    };
};

var d83entry = function(lvl1, lvl2, lvl3) {
    var that = this;

    if (isNaN(lvl1)) {
	throw new TypeError('the lvl1 of an entry may not be NaN');
    }

    if (isNaN(lvl2)) {
	throw new TypeError('the lvl2 of an entry may not be NaN');
    }

    if (isNaN(lvl3)) {
	throw new TypeError('the lvl3 of an entry may not be NaN');
    }

    this.lvl1 = lvl1;
    this.lvl2 = lvl2;
    this.lvl3 = lvl3;

    this.quantity = null;

    // in euro cents (?) depending on the currency
    // specified in the header of the d83 file
    //this.price = 0;

    this.summary = '';
    this.description = '';

    this.netPricePerUnit = 0;

    this.getNetTotal = function() {
	return that.quantity.pre * that.netPricePerUnit;
    };

    this.getPrettyPath = function() {
	return [lvl1, lvl2, lvl3].join('.');
    };

    this.toString = function() {
	return that.summary;
    };

};

var d83parser = function(inputtext) {
    var that = this;

    if (typeof(inputtext) != 'string') {
	throw new TypeError('d83parser expects a string');
    }

    var text = inputtext.trim();

    var currency = '';

    var currentEntry = null;
    var currentNode = null;
    var currentTopLevelNode = null;
    
    var units = {
	'M': 0,
	'M2': 1,
	'M3': 2,
	'KG': 3,
	'PSCH': 4,
	'ST': 5,
	'T': 6,
	'H': 7,
	'L': 8,
	'D': 9,
	'WO': 10
    };


    this.issuingCompany = '';

    this.entries = [];

    this.currency = '';

    this.dir = {
	watch: undefined
    };

    // index into the string that contains the d83 file
    var currentIndex = 0;

    var isDa90 = function(text) {
	return text.substring(0, 2) == '00'
	    || text.substring(0, 2) == 'T0';
    };

    if (!isDa90(text)) {
	throw new d83FormatViolationError('non-conformant header');
    }

    var commitCurrentNode = function() {
	if (currentNode == null) {
	    throw new Error();
	}

	if (currentTopLevelNode == null) {
	    throw new Error('while trying to commit node ' +
			    currentNode + ', currentTopLevelNode ' +
			    'was null');
	}

	currentTopLevelNode.nodes[currentNode.lvl2] = currentNode;
	currentNode = null;
    };

    var commitTopLevelNode = function() {
	if (currentTopLevelNode == null) {
	    throw new Error('trying to commit a top-level node, ' +
			    'but currentTopLevelNode is null');
	}

	if (currentNode != null) {
	    throw new Error();
	}

	if (currentEntry != null) {
	    throw new Error();
	}

	if (currentTopLevelNode.lvl1 in that.dir) {
	    throw new Error();
	}

	that.dir[currentTopLevelNode.lvl1] = currentTopLevelNode;
	currentTopLevelNode = null;
    };

    var commitEntry = function(line) {
	if (currentEntry == null) {
	    throw new Error('trying to commit an entry, ' +
			    'but currentEntry is null');
	}

	if (!(currentEntry instanceof d83entry)) {
	    throw new Error('trying to commit the current entry, ' +
			    'but it is not a d83entry');
	}

	if (currentNode == null) {
	    throw new Error('trying to commit an entry, but ' +
			    'currentNode is null');
	}

	if (currentEntry.lvl3 in currentNode) {
	    throw new Error('trying to commit an entry, but ' +
			    'currentNode already has an entry with the same position');
	}

	currentNode.entries[currentEntry.lvl3] = currentEntry;
	currentEntry = null;
    };

    
    var parseIssuingCompany = function(line) {
	that.issuingCompany = line;
    };

    var parseCurrency = function(line) {
	that.currency = line;
    };

    
    
    var parseNodeHeader = function(line) {
	if (currentEntry != null) {
	    commitEntry();
	}

	var lvl1 = parseInt(line.substring(0, 2));
	var lvl2 = parseInt(line.substring(2, 4));
	
	if (isNaN(lvl2)) {
	    // lvl 1 node
	    
	    if (currentNode != null) {
		commitCurrentNode();
	    }

	    if (currentTopLevelNode != null) {
		commitTopLevelNode();
	    }

	    currentTopLevelNode = new d83toplevelnode(lvl1);
	}
	else {// lvl2 != Nan
	    // lvl 2 node

	    if (currentNode != null) {
		commitCurrentNode();
	    }


	    currentNode = new d83node(lvl1, lvl2);
	}
    };

    
    var parseEntryHeader = function(line) {
	if (currentEntry != null) {
	    commitEntry();
	}

	var lvl1begin = 0,
	    lvl1len = 2;

	var lvl2begin = 2,
	    lvl2len = 2;

	var lvl3begin = 4,
	    lvl3len = 4;

	//
	// extract the position triple
	//
	var lvl1 = parseInt(line.substring(lvl1begin,
					   lvl1begin + lvl1len));

	var lvl2 = parseInt(line.substring(lvl2begin,
					   lvl2begin + lvl2len));

	var lvl3 = parseInt(line.substring(lvl3begin,
					   lvl3begin + lvl3len));

	//
	// extract the quantity and unit
	// 
	var unitSpecBegin = 32;
	var unitSpecMaxLen = 4;

	var pre = parseInt(line.substring(21, 29));
	var post = parseInt(line.substring(29, 32));
	var unit = line.substring(unitSpecBegin,
				  unitSpecBegin + unitSpecMaxLen).trimRight();

	if (!(unit in units)) {
	    // TODO unknown/illicit unit
	}

	currentEntry = new d83entry(lvl1, lvl2, lvl3);

	currentEntry.quantity = new Quantity(pre, post, unit);

    };

    var parseNodeSummary = function(line) {

	if (currentNode != null) {
	    currentNode.nodeSummary += line.trim() + ' ';
	}
	else if (currentTopLevelNode != null) {
	    currentTopLevelNode.nodeSummary += line.trim() + ' ';
	}
	else {
	    throw new Error('found a node summary, but there are no ' +
			    'current nodes or entries');
	}
    };

    var parseSummary = function(line) {

	if (currentEntry != null) {
	    currentEntry.summary += line.trim() + ' ';
	}
	else if (currentNode != null) {
	    currentNode.summary += line.trim() + ' ';
	}
	else if (currentTopLevelNode != null) {
	    currentTopLevelNode.summary += line.trim() + ' ';
	}
	else {
	    throw new Error('found a node summary, but there are no ' +
			    'current nodes or entries');
	}
    };

    var parseDescription = function(line) {
	if (currentEntry != null) {
	    currentEntry.description += line.trim() + ' ';
	}
	else if (currentNode != null) {
	    currentNode.description += line.trim() + ' ';
	}
	else if (currentTopLevelNode != null) {
	    currentTopLevelNode.description += line.trim() + ' ';
	}
	else {
	    throw new Error('found a node summary, but there are no ' +
			    'current nodes or entries');
	}
    };


    var lineParsers = {
	3: parseIssuingCompany,
	8: parseCurrency,
	11: parseNodeHeader,
	12: parseNodeSummary,
	21: parseEntryHeader,
	25: parseSummary,
	26: parseDescription,
	27: commitEntry
    };




    
    var eof = function() {
	return text.length <= currentIndex;
    }

    var getNextLine = function() {
	var nextLinefeed = text.indexOf("\n", currentIndex + 1);

	if (nextLinefeed == -1) {
	    return null;
	}

	var line = text.substring(currentIndex, nextLinefeed).trim();

	currentIndex = nextLinefeed;

	return line;
    };

    
    var parseLine = function(line) {
	// FIXME in some cases the initial two chars are not numeric
	// e.g. "T0"
	var lineType = parseInt(line.substring(0, 2));

	var lineNumberLen = 6;

	var content = line.substring(2, line.length - lineNumberLen - 2);

	if (!(lineType in lineParsers)) {
	    // no parser for this line
	}
	else {
	    lineParsers[lineType](content);
	}
	
    };

    this.parse = function() {

	while (!eof()) {

	    var line = getNextLine();

	    if (null == line) break;
	    
	    parseLine(line);
	};

	if (currentEntry != null) commitEntry();
	if (currentNode != null) commitCurrentNode();
	if (currentTopLevelNode != null) commitTopLevelNode();
    };

    
};

