define(["controller/store","helper/l10n"],function(e,r){var i={label:r({en:"Similarities (CDV)",de:"Ähnlichkeiten (CSV)"}),extension:"csv",filename:"fastclass_similarity"};return{register:function(){return i},condition:function(){return e.repSimilarModules.data.results&&0!==e.repSimilarModules.data.results.length},execute:function(){return new Promise(function(r,i){var n="Similarity;Object 1;Object 2\r\n";e.repSimilarModules.data.results.forEach(function(e){n+=e[0]+";"+e[1][0]+";"+e[1][1]+"\r\n"}),r(n)})}}});