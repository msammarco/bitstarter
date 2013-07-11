#!/usr/bin/env node

/*
Automatically grade files for the presence of specified
HTML tags/attributes. Uses commander.js and cheerio. Teaches
command line application development and basic DOM parsing
*/

var fs = require('fs');
var restler = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var $;

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(infile.indexOf('http') === -1 && !fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // exit for node
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile, checkFn) {
    if(htmlfile.indexOf('http') !== -1) {
	restler.get(htmlfile).on('complete', function(data) {

	    //console.log(data);
	    $ = cheerio.load(data);
	    return checkFn();
	});
    } else {
	$ = cheerio.load(fs.readFileSync(htmlfile));
	return checkFn();
    }
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    cheerioHtmlFile(htmlfile, checkFn = function(){
	var checks = loadChecks(checksfile).sort();
	var out = {};
	console.log('lets do checks');
	for(var ii in checks) {
	    var present = $(checks[ii]).length > 0;
	    out[checks[ii]] = present;
	}
	out2console(out);
    }
   );
};

var out2console = function(out) {
    outJSON = JSON.stringify(out, null, 4);
    console.log(outJSON);
};

var clone = function(fn) {
    // workaround for commander.js issue.
    return fn.bind({});
};

if (require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.parse(process.argv);
    checkHtmlFile(program.file, program.checks);
    //var outJson = JSON.stringify(checkJson, null, 4);
    //console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
