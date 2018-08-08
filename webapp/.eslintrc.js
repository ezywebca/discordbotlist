module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": [
		"eslint:recommended",
		"plugin:vue/recommended"
	],
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "indent": "off",
        "vue/order-in-components": "off",
        "vue/mustache-interpolation-spacing": "off",
        "vue/attributes-order": "off",
        "vue/max-attributes-per-line": "off",
        "vue/script-indent": [
        	"error",
        	"tab",
        	{
        		"baseIndent": 1
        	}
        ],
        "vue/html-indent": [
        	"error",
        	"tab",
        ],
    },
    "globals": {
    	"axios": false,
    }
};