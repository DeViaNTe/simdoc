/* html formatter */
function formatHtml(input) {
	var markdown = require( "markdown" ).markdown;
	var tokens;
	var output = "";
	var doc = null;
	var istatic = function(x) { if (x) { return "static"; } };

	var templates = {
		'CLASS_DEF': [
			'<div class="row">',
			'  <div class="panel panel-default">',
			'    <div class="panel-heading"><span class="label label-primary pull-right">CLASS</span> {self.classname}</div>',
			'    <div class="panel-body">',
			'      <div>{doc.short_description}</div>',
			'      <div>{doc.description|markdown.toHTML}</div>',
			'      <h4> Constants: <small>{token.children|name:CONST_VAR|length}</small></h4>',
			'      <div class="list-group" style="padding-left: 25px;">{token.children|name:CONST_VAR&DOCBLOCK|formatHtml}</div>',
			'      <h4> Properties: <small>{token.children|name:PROPERTY|length}</small></h4>',
			'      <div class="list-group" style="padding-left: 25px;">{token.children|name:PROPERTY&DOCBLOCK|formatHtml}</div>',
			'      <h4> Methods: <small>{token.children|name:FUNCT_DEF|length}</small></h4>',
			'      <div class="list-group" style="padding-left: 25px;">{token.children|name:FUNCT_DEF&DOCBLOCK|formatHtml}</div>',
			'    </div>',
			'  </div>',
			'</div>',
		].join("\n"),
		'CONST_VAR': [
			'<p class="list-group-item-text">',
			'<span class="label label-warning">CONST</span> {self.constname} <span class="text-muted"> = {self.constvalue}</span><br>',
			'<span class="text-primary" style="padding-left: 20px">{doc.short_description}</span>',
			'</p>',
		].join("\n"),
		"PROPERTY": [
			'<div class="list-group-item-text">',
			'<div><span class="label label-warning">{self.visibility}</span> ${self.name}</div>',
			'<div class="text-muted" style="padding-left: 10px">{doc.data|var}</div>',
			'</div>'
		].join("\n"),
		'FUNCT_DEF': [
			'<div>',
			'<small><span class="label label-info">{self.visibility}</span></small>',
			'<small><span class="label label-danger">{self.static}</span></small>',
			'<span class="label label-success">FUNCTION</span>',
			'<strong class="text">{self.name}</strong><strong class="text-muted">{self.args}</strong>',
			'</div>',
			'<div>',
			'{doc.short_description}',
			'<div>{doc.description|markdown.toHTML}</div>',
			'</div>'
		].join("\n")
	}

	if (input instanceof Array) { tokens = input; } else { tokens = input.getTokens(); }

	tokens.forEach(function ftok(token, index) {
		if (token.name === 'DOCBLOCK') { doc = token; return; }
		var template = templates[token.name] + "";
		if (!template) { return; }
		var self = token.match;
		var match = null;
		var filter = function (d, c) {
			if (c === null) { return d; }
			var x; try { x = eval(c); } catch (e) { x = c; }
			if (typeof x === "function") { return x(d); }
			if (typeof x === "string") { return d[x]; }
			return d;
		};

		template = template.replace(/\{(.+?)(?:\.(.+?))?(?:\|(.+?))?(?:\|(.+?))?(?:\|(.+?))?(?:\|(.+?))?(?:\|(.+?))?\}/ig, function (_match, obj, prop, f1, f2, f3, f4, f5) {
			var data, tempmatch, tempdata, i;
			try { data = eval(obj); if (prop) { data = data[prop]; } } catch (e) { data = null };
			if (data !== null) {
				for (i=0;i<6;i++) {
					if (arguments[i+3]) {
						if ((tempmatch = /^(.*?):(.*?)$/.exec(arguments[i+3])) !== null) {
							tempdata = [];
							data.forEach(function (d, i) {
								var x = tempmatch[2].split("&");
								x.forEach(function (j) {
									if (d[tempmatch[1]] == j) { tempdata.push(d); }
								});
							});
							data = tempdata;
						} else {
							data = filter(data,arguments[i+3]);
						}
					}
				}
				return data;
			}
			return "";
		});
		output += template;
		doc = null;
	});

	return output;
};



function wrapHtml(input, opt) {
	return [
	'<!doctype html>',
	'<html lang="en">',
	' <head>',
	'  <meta charset="UTF-8">',
	'  <title> ' + 'titulo' + '</title>',
	'  <link href="http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css" rel="stylesheet">',
	'  <style>',
	'  </style>',
	' </head>',
	' <body>',
	'  <div class="container" style="margin-top: 20px">',
	input,
	'  </div>',
	'  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>',
	'  <script src="http://netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js"></script>',
	' </body>',
	'</html>'].join("\n");
}


module.exports = {};
module.exports.html = { format: formatHtml, wrap: wrapHtml };