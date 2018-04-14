/** 
	fastclass
	L10N MODULE (localization)
	(c) 2017 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

var defaultLocale = 'de',	
	userLocale = document.documentElement.lang || defaultLocale;

define(['../../res/lang/' + userLocale], function (lang) {

	var localizer =  function (key) {
		switch (typeof key) {
			case 'string':
				if (lang.hasOwnProperty(key)) {
					return lang[key];
				} else {			
					return 'MISSING LABEL for ' + key;
				}
				break;			
			case 'object':
				if (key.hasOwnProperty(userLocale)) {
					return key[userLocale];
				} else {			
					return 'MISSING LANGUAGE for ' + key;
				}
				break;
		}
	};

	return localizer;
});