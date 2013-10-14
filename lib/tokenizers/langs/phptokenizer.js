var util = require('util');

module.exports = function (Tokenizer, eregxp) {

	/* language specific */
	function PHPTokenizer(src) {
		Tokenizer.apply(this, arguments);
		this.tokens.CLASS_DEF  = eregxp("class\\s+(:<classname>\\S+)(?:\\s+extends\\s+(:<classextends>\\S+))?\\s*(m<children>{:}m)");
		this.tokens.CONST_VAR  = eregxp("const\\s+(:<constname>[^\\s=]+)\\s*=\\s*(:<constvalue>.*?);");
		this.tokens.FUNCT_DEF  = eregxp("(:<visibility>public|private|protected|)(:<static>\\s+static|)\\s+function\\s+(:<name>[^\\s\\(]+)\\s*(m<args>(:)m)\\s*(m<body>{:}m)");
		this.tokens.PROPERTY   = eregxp("(:<visibility>public|private|protected|)\\s*\\$(:<name>.*?);");
	}
	util.inherits(PHPTokenizer, Tokenizer);

	return PHPTokenizer;
};