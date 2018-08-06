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
        "indent": [
            "error",
            "tab"
        ],
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
        "vue/script-indent": [
        	"error",
        	"tab",
        	{
        		"baseIndent": 1
        	}
        ],
    },
    "globals": {
    	"axios": false,
    }
};