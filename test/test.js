#!/usr/bin/env node
var assert = require('assert');
var path 	 = require('path');
var fs 		 = require('fs');
var lib 	 = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');
var simdoc = require(lib + '/main.js');


/** test extended regexp */
var re = simdoc.eregxp(/function\s+(:<name>[a-z]+)\s*(m<arguments>(:)m)\s*(m<body>{:}m)/, "ig");
assert.ok(re.constructor.name === "ExtendedRegExp", "returned object is an instance of ExtendedRegExp");

var source = [
  "/**",
  " * Comment ",
  " */",
	"function foo(bar, baz) {",
	" while (true) {",
	"  noop();",
	"  break;",
	" }",
	"}"
].join("\n");



assert.ok(re.test(source) === true, "re.test() matches extended pattern");

var expected_match = {
	"_index": 20,
	"_length": source.length - 20,
	"name": "foo",
	"arguments": "(bar, baz)",
	"body": ["{",
	" while (true) {",
	"  noop();",
	"  break;",
	" }",
	"}"].join("\n")
};
var matched = re.exec(source);
assert.deepEqual(expected_match, matched);

/* regex like chaining */
var re2 = simdoc.eregxp(/function\s+(:<name>[a-z]+)\s*(m<arguments>(:)m)\s*(m<body>{:}m)/);
var source2 = source+source;
var matched2 = null;
var cnt = 0;
while ((matched2 = re2.exec(source2)) !== null) { assert.deepEqual(expected_match, matched); cnt++; }
assert.equal(2,cnt);

/* multiple char opening or closing "bracket" */
var re3 = simdoc.eregxp("(m<name>/**:*/m)");
var matched3 = re3.exec(" "+source);
assert.deepEqual({ name: "/**\n * Comment \n */", "_index":1,"_length":19 }, matched3);

console.log(" * eregexp ok");

/* test simdoc */





console.log(" * all ok");