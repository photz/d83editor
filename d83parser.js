var Unit = {
    M: {
	toString: function() {
	    return 'm';
	}
    },
    M2: {
	toString: function() {
	    return 'm^2';
	}
    },
    M3: {
	toString: function() {
	    return 'm^3';
	}
    },
    KG: {
	toString: function() {
	    return 'kg';
	}
    },
    T: {
	toString: function() {
	    return 't';
	}
    },
    L: {
	toString: function() {
	    return 'l';
	}
    }
};

var Quantity = function(pre, post, unit) {
    var that = this;

    this.pre = pre;
    this.post = post;
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

    this.summary = '';
    this.description = '';

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
    

    this.issuingCompany = '';

    this.entries = [];

    this.currency = '';

    this.dir = {
	watch: undefined
    };

    var isDa90 = function(text) {
	return text.substring(0, 2) == '00'
	    || text.substring(0, 2) == 'T0';
    };

    if (!isDa90(text)) {
	throw new Error('The input string violates the DA 90 format.');
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

	var lvl1 = parseInt(line.substring(0, 2));
	var lvl2 = parseInt(line.substring(2, 4));
	var lvl3 = parseInt(line.substring(4, 8));

	var pre = parseInt(line.substring(21, 29));
	var post = parseInt(line.substring(29, 32));
	var unit = line.substring(32, 40).trimRight();

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


    var units = {
	'M': 0,
	'M2': 0,
	'M3': 0,
	'KG': 0,
	'PSCH': 0,
	'ST': 0,
	'T': 0,
	'H': 0,
	'L': 0,
	'D': 0,
	'WO': 0
    };


    
    var getNextLine = function() {

	var next = text.indexOf("\n");

	var line = text.substring(0, next).trim();
	
	text = text.substring(next + 1, text.length - next);



	return line;
    };
    

    
    var parseLine = function(line) {
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


	while (true) {
	    var line;

	    line = getNextLine();

	    if (line == '') {
		break;
	    }

	    parseLine(line);
	};
    };

    
};

