var simdoc        = {};
var glob          = require("glob");
var fs            = require("fs");

simdoc.eregxp     = require('./extended-regexp.js');
simdoc.tokenizers = require('./tokenizers/main.js');
simdoc.formatters = require('./formatters/main.js');


glob("/home/dev/devel/spotliowrapper/spotlio/src/**/*.php", function (er, files) {
	var docs = [];
	files.forEach(function (file, index) {
			//if (index === 0) {
				var source = fs.readFileSync(file).toString('utf-8');
				var x = new simdoc.tokenizers.php(source);
				var o = simdoc.formatters.html.format(x);
				docs.push(o);
			//}
	});
	fs.writeFileSync('test.html', simdoc.formatters.html.wrap(docs.join("\n")));
})

module.exports = simdoc;