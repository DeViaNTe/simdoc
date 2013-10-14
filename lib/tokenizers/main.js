var util = require('util');
var eregxp = require('./../extended-regexp.js');
var glob = require('glob');

/* base token */
function Token(name, match, children, constructor) {
  this.name  = name;
  this.match = match;
  this.children = children;
  this.cons  = constructor;
}

/* base tokenizer */
function Tokenizer(src) {
  this.source = src;
  this.tokens = {};
  this.tokens.DOCBLOCK = eregxp("(m<docblock>/**:*/m)");
}


/* find next token */
Tokenizer.prototype.nextToken = function nt(debug) {
  var tokens    = Object.keys(this.tokens);
  var bestmatch = { "0": null, _index: this.source.length };
  var besttoken = null;
  var children  = [];

  tokens.forEach(function (name) {
    var token = this.tokens[name];
    token.reset();
    if ((match = token.exec(this.source)) !== null) {
      if (match._index < bestmatch._index) { bestmatch = match; besttoken = name; }
    }
  }.bind(this));

  /* no more tokens */
  if (besttoken === null) { return null; }

  /* has children */
  if (bestmatch.hasOwnProperty("children")) {
  	var x = new this.constructor(bestmatch.children);
  	children = x.getTokens();
  }

  /* return token */
  return new Token(besttoken, bestmatch, children, this.constructor);
};

/* get hierarchy of tokens */
Tokenizer.prototype.getTokens = function gt() {
  var t = null;
  var toks = [];
  while ((t = this.nextToken()) !== null) {
    if (t.name === "DOCBLOCK") { toks.push(this.parseDocblock(t)); }
    else { toks.push(t); }
    this.source = this.source.substr(t.match._index + t.match._length);
  }
  return toks;
};

/* parse doc block */
Tokenizer.prototype.parseDocblock = function(tok) {
	var src = tok.match.docblock;
	var cleansrc = [];
	var metadata = {};
	var shortdesc = null;
	var description = [];
	
	/* clean comments */
	src.split("\n").forEach(function (l,i) {
    cleansrc[i] = l.replace(/^.*\/\*\*/g,"").replace(/^\s*\**/ig,"").replace(/^\s*\/*/ig,"").replace(/\*\/\s*$/ig,"").trim();
  });
	
	/* extract metadata */
	cleansrc.forEach(function emeta(line) {
		var match;
		if ((match = line.match(/^@(\S+)(?:\s+(.*))?$/i)) !== null) {
			var name = match[1];
			var data = match[2];
			var mdat = metadata[name] || [];
			mdat.push( data || true );
			metadata[name] = mdat;
		} else {
			if (!shortdesc && line !== "") { shortdesc = line; }
			else { description.push(line); }
		}
	});
	return {
		name: "DOCBLOCK",
		short_description: shortdesc,
		description: description.join("\n"),
		data: metadata
	};
};

/* exports */
module.exports = {};
module.exports['php'] = require('./langs/phptokenizer.js')(Tokenizer, eregxp);