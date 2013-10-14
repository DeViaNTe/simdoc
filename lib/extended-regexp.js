function ExtendedRegExp(parts) {
	this.opts 	= "ig";
	this.parts 	= parts;
	this.pos 		= null;
}

ExtendedRegExp.prototype.reset = function () { this.pos = null; };
ExtendedRegExp.prototype.startAt = function (i) { this.pos = i; };

ExtendedRegExp.prototype.test = function (src, _r) {
	var ok = true;
	var pos = (this.pos !== null ? this.pos : 0);
	var partmatches = [];
	var startpos = -1;
	var totallen = 0;

	this.parts.forEach( function testpart(part, i) {
		if (!ok) { return; }
		if (part.type === 'regex') {
			var reg = new RegExp(part.src.replace(/\(:<(\w+)>/g, "("), this.opts);
			/* where to start: */ reg.lastIndex = pos;
			var match = reg.exec(src);
			/* no matches */
			if (match === null) { ok = false; return; }
			/* match valid? */
			partmatches.push(match);
			if (i === 0) { ok = true; startpos = match.index; pos = match.index + match[0].length; return; }
			ok = ok && (pos === match.index);
			pos = match.index + match[0].length;
			return;
		}
		if (part.type === 'matching pair') {
			if (startpos === -1) { startpos = src.indexOf(part.open); pos = startpos; }
			/* matching pair search */
			var startedAt = pos;
			var firstLetter = src.substr(pos,part.open.length);
			/* starts with other character... bad match */
			if (firstLetter !== part.open) { ok = false; return; }
			/* find match */
			var indentation = 0;
			while (pos <= src.length) {
				if (src.substr(pos,part.open.length) === part.open) { indentation++; pos += part.open.length; continue; }
				if (src.substr(pos,part.close.length) === part.close) { indentation--; pos += part.close.length; continue; }
				if (indentation === 0) { partmatches.push(src.substr(startedAt, pos-startedAt)); return; }
				pos++;
			}
			ok = false;
			return;
		}
	}.bind(this));
	if (_r) { return { ok: ok, matches: partmatches, starts: startpos, ends: pos }; }
	return ok;
};

ExtendedRegExp.prototype.exec = function (src) {
	var objs = this.test(src, true);
	if (!(objs.ok)) { this.pos = null; return null; }
	this.pos = objs.ends;

	var returns = {};

	this.parts.forEach(function namedparts(part, index) {
		if (part.type === 'regex') {
			var names = [];
			/* collect names  */ part.src.replace(/\(:<(\w+)>/g, function (_, name) { names.push(name); return ''; });
			/* collect values */ names.forEach(function (name, ind) { returns[name] = objs.matches[index][ind+1]; });
		}
		if (part.type === 'matching pair') {
			returns[part.name] = objs.matches[index];
		}
	}.bind(this));
	
	if (objs.starts === -1) { return null; }
	returns["_index"] = objs.starts;
	returns["_length"] = objs.ends - objs.starts;

	return returns;
};



function extended_regexp(regexp) {
	var source = "";

	if (typeof regexp === "string") { source = regexp; }
	if (regexp instanceof RegExp) { source = regexp.source; }
	
	var splits = [], pairmatches;
	var pairmatcher = /\(m<(\w+?)>(.*?):(.*?)m\)/g;

	/* split source in parts */
	while ((pairmatches = pairmatcher.exec(source)) !== null) {
		splits.push({start: pairmatches.index, wid: pairmatches[0].length, name: pairmatches[1], open: pairmatches[2], close: pairmatches[3]});
	}
	
	var parts = [];
	splits.forEach(function sp(split, index) {
			var from = ( index > 0 ? splits[index-1].start+splits[index-1].wid : 0 );
			var to = ( index > 0 ? split.start - from : split.start );
			if (from !== to) { parts.push({ type: 'regex', src: source.substr(from, to) }); }
			parts.push({ type: 'matching pair', src: source.substr(split.start, split.wid), name: split.name, open: split.open, close: split.close });
	});
	if (parts.length === 0) { parts.push({ type: 'regex', src: source }); }


	return new ExtendedRegExp(parts);
};

module.exports = extended_regexp;