var Unit = {
    METER: 1,
    SQUAREMETER: 2,
    CUBICMETER: 3,
    KILOGRAMM: 4,
    TON: 5,
    LITER: 6
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
    
    this.lvl1 = lvl1;

    this.summary = summary;


    this.toString = function() {
	return that.summary;
    };
};

var d83node = function(lvl1, lvl2) {
    var that = this;

    this.lvl1 = lvl1;
    this.lvl2 = lvl2;

    this.summary = null;


    this.toString = function() {
	return that.summary;
    };
};

var d83entry = function(lvl1, lvl2, lvl3) {
    var that = this;

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
    
    this.issuingCompany = '';

    this.entries = [];

    this.currency = '';

    var commitEntry = function(line) {
	if (currentEntry == null) {
	    //console.log('trying to commit an entry, but there is no current entry');

	    // throw {
	    // 	name: 'NoEntryToCommit'
	    // }
	}
	else {
	    that.entries.push(currentEntry);

	    //console.log('committing entry: ' + currentEntry);


	    currentEntry = null;
	}
    };

    
    var parseIssuingCompany = function(line) {
	that.issuingCompany = line;

    };

    var parseCurrency = function(line) {
	that.currency = line;
    };

    var parseNodeHeader = function(line) {
	// if (currentEntry != null) {
	//     console.log('found a node header, but a current entry exists');
	//     throw {
	// 	name: 'UnexpectedHeader',
	// 	message: 'a header for a node has been found even though there is a current entry/node'
	//     }
	// }

	if (currentEntry != null) {
	    commitEntry();
	}

	var lvl1 = parseInt(line.substring(0, 2));
	var lvl2 = parseInt(line.substring(2, 4));
	
	if (lvl2 == NaN) {
	    // lvl 1 node
	    
	    currentEntry = new d83toplevelnode(lvl1);
	}
	else {
	    // lvl 2 node

	    currentEntry = new d83node(lvl1, lvl2);
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
	    // unknown/illicit unit

	    //console.log('no such unit: ' + unit);
	    // throw {
	    // 	name: 'NoSuchUnit'
	}
	
	

	currentEntry = new d83entry(lvl1, lvl2, lvl3);

	currentEntry.quantity = new Quantity(pre, post, unit);

	//console.log(currentEntry);
    };

    var parseNodeSummary = function(line) {
	if (currentEntry == null) {

	}

	currentEntry.nodeSummary += line.trim() + ' '
    };

    var parseSummary = function(line) {
	if (currentEntry == null) {
	    //console.log('found a summary, but no current entry exists');

	    // throw {
	    // 	name: 'NoCurrentEntry'
	    // }
	}
	else {
	    currentEntry.summary += line.trim() + ' ';
	}
    };

    var parseDescription = function(line) {
	//console.log('found desc: ' + line);

	if (currentEntry == null) {
	    //console.log('found a description, but no current entry exists');
	}
	else {
	    currentEntry.description += line.trim() + ' '


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

	//console.log('indexof: ' + next);

	var line = text.substring(0, next).trim();
	
	text = text.substring(next + 1, text.length - next);



	return line;
    };
    

    
    var parseLine = function(line) {
	var lineType = parseInt(line.substring(0, 2));

	var lineNumberLen = 6;

	var content = line.substring(2, line.length - lineNumberLen - 2);



	if (!(lineType in lineParsers)) {
	    //console.log('no parser for line type ' + lineType);

	}
	else {
	    lineParsers[lineType](content);
	}
	
    };

    this.parse = function() {


	while (true) {
	    var line;

	    line = getNextLine();

	    //console.log('line: ' + line);

	    if (line == '') {
		break;
	    }

	    parseLine(line);
	};
    };






};

