!function(t){function n(n){for(var e,o,c=n[0],u=n[1],i=0,f=[];i<c.length;i++)o=c[i],r[o]&&f.push(r[o][0]),r[o]=0;for(e in u)Object.prototype.hasOwnProperty.call(u,e)&&(t[e]=u[e]);for(a&&a(n);f.length;)f.shift()()}var e={},r={1:0};function o(n){if(e[n])return e[n].exports;var r=e[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,o),r.l=!0,r.exports}o.e=function(t){var n=[],e=r[t];if(0!==e)if(e)n.push(e[2]);else{var c=new Promise(function(n,o){e=r[t]=[n,o]});n.push(e[2]=c);var u,i=document.createElement("script");i.charset="utf-8",i.timeout=120,o.nc&&i.setAttribute("nonce",o.nc),i.src=function(t){return o.p+""+({0:"baffle",2:"scene",3:"scene-swap-helper"}[t]||t)+"."+{0:"c2086185",2:"3c5664cb",3:"1a012850",4:"776c6073",5:"5cffd7f3",6:"00ebc0b2",7:"be6b6381",8:"7e558330",9:"da95a1a9",10:"831983a1",11:"88854a26",12:"e223d4c1",13:"8d3d25b5",14:"7cfdf07e",15:"6d75272e",16:"f6c98845",17:"04582f32",18:"5fc0d5b9",19:"61ab0491",20:"c0389f72",21:"1265306c",22:"b1adec41",23:"bf39fa5c",24:"e500d6d8",25:"7ff71c18",26:"af8097ec",27:"13c8ba0a",28:"33e868af",29:"71811c63",30:"8549cecb",31:"7bbd09da",32:"620dfbfa",33:"c15a45d0",34:"91c88351",35:"a7de5377",36:"7f7bfa0d",37:"a977cd6d",38:"4baae6d2",39:"fc5d4501",40:"a9e66149",41:"fd87f915",42:"37023785",43:"28dde345",44:"5b7ee822",45:"11d6cb26",46:"b2e3c510",47:"d1626518",48:"3a752cd2",49:"0a06cc1c",50:"3979a1b9",51:"b8fc0f45",52:"56abf1b2",53:"f1005bc0",54:"450dbcd5",55:"43310dd8",56:"95855684",57:"a44fc719",58:"15ad51eb",59:"20333c8e",60:"ad675f96"}[t]+".js"}(t),u=function(n){i.onerror=i.onload=null,clearTimeout(a);var e=r[t];if(0!==e){if(e){var o=n&&("load"===n.type?"missing":n.type),c=n&&n.target&&n.target.src,u=new Error("Loading chunk "+t+" failed.\n("+o+": "+c+")");u.type=o,u.request=c,e[1](u)}r[t]=void 0}};var a=setTimeout(function(){u({type:"timeout",target:i})},12e4);i.onerror=i.onload=u,document.head.appendChild(i)}return Promise.all(n)},o.m=t,o.c=e,o.d=function(t,n,e){o.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:e})},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(t,n){if(1&n&&(t=o(t)),8&n)return t;if(4&n&&"object"==typeof t&&t&&t.__esModule)return t;var e=Object.create(null);if(o.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var r in t)o.d(e,r,function(n){return t[n]}.bind(null,r));return e},o.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(n,"a",n),n},o.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},o.p="",o.oe=function(t){throw console.error(t),t};var c=window.webpackJsonp=window.webpackJsonp||[],u=c.push.bind(c);c.push=n,c=c.slice();for(var i=0;i<c.length;i++)n(c[i]);var a=u;o(o.s=14)}([function(t,n,e){var r=e(4).Symbol;t.exports=r},function(t,n,e){"use strict";e.d(n,"b",function(){return p}),e.d(n,"g",function(){return v}),e.d(n,"c",function(){return y}),e.d(n,"d",function(){return w}),e.d(n,"a",function(){return x}),e.d(n,"e",function(){return O}),e.d(n,"f",function(){return k});var r,o=e(2),c=e.n(o),u=function(t,n,e,r){return new(e||(e=Promise))(function(o,c){function u(t){try{a(r.next(t))}catch(t){c(t)}}function i(t){try{a(r.throw(t))}catch(t){c(t)}}function a(t){t.done?o(t.value):new e(function(n){n(t.value)}).then(u,i)}a((r=r.apply(t,n||[])).next())})},i=function(t,n){var e,r,o,c,u={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return c={next:i(0),throw:i(1),return:i(2)},"function"==typeof Symbol&&(c[Symbol.iterator]=function(){return this}),c;function i(c){return function(i){return function(c){if(e)throw new TypeError("Generator is already executing.");for(;u;)try{if(e=1,r&&(o=2&c[0]?r.return:c[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,c[1])).done)return o;switch(r=0,o&&(c=[2&c[0],o.value]),c[0]){case 0:case 1:o=c;break;case 4:return u.label++,{value:c[1],done:!1};case 5:u.label++,r=c[1],c=[0];continue;case 7:c=u.ops.pop(),u.trys.pop();continue;default:if(!(o=(o=u.trys).length>0&&o[o.length-1])&&(6===c[0]||2===c[0])){u=0;continue}if(3===c[0]&&(!o||c[1]>o[0]&&c[1]<o[3])){u.label=c[1];break}if(6===c[0]&&u.label<o[1]){u.label=o[1],o=c;break}if(o&&u.label<o[2]){u.label=o[2],u.ops.push(c);break}o[2]&&u.ops.pop(),u.trys.pop();continue}c=n.call(t,u)}catch(t){c=[6,t],r=0}finally{e=o=0}if(5&c[0])throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}([c,i])}}},a="Deniz Gürkaynak",f=document.getElementById("heading-text"),l=!1,s="",d=document.getElementById("main"),b=21;setInterval(function(){var t=Math.floor(f.offsetHeight/b);d.setAttribute("data-line-count",""+t)},500);function p(){l||(l=!0,h(),r&&r.text(function(){return a}),r&&r.reveal(500))}function v(){l&&(h(),r&&r.text(function(){return s}),r&&r.reveal(500),l=!1)}function h(){k(),function(){u(this,void 0,void 0,function(){return i(this,function(t){switch(t.label){case 0:return[4,y()];case 1:return t.sent(),r.stop(),[2]}})})}()}function y(){return u(this,void 0,void 0,function(){var t;return i(this,function(n){switch(n.label){case 0:return r?[3,2]:[4,e.e(0).then(e.t.bind(null,20,7))];case 1:t=n.sent().default,r=t(f),n.label=2;case 2:return[2]}})})}function w(t){return u(this,void 0,void 0,function(){return i(this,function(n){switch(n.label){case 0:return[4,y()];case 1:return n.sent(),l?(t&&(s=t),[2]):(t&&(s=t,r.text(function(){return s})),r.start(),[2])}})})}function x(t,n){return u(this,void 0,void 0,function(){return i(this,function(e){switch(e.label){case 0:return[4,y()];case 1:return e.sent(),l?(t&&(s=t),[2]):(t&&(s=t,r.text(function(){return s})),r.reveal(n),[2])}})})}var m,g=500,j=0;function O(){l||(j=0,s=a,f.textContent=s,clearTimeout(m),m=setTimeout(S,g))}function S(){j=j%3+1;var t=c()(j,function(){return"."}).join("");s=a+t,f.textContent=s,m=setTimeout(S,g)}function k(){clearTimeout(m)}},function(t,n,e){var r=e(9),o=e(16),c=e(11),u=9007199254740991,i=4294967295,a=Math.min;t.exports=function(t,n){if((t=c(t))<1||t>u)return[];var e=i,f=a(t,i);n=o(n),t-=i;for(var l=r(f,n);++e<t;)n(e);return l}},function(t,n){var e;e=function(){return this}();try{e=e||new Function("return this")()}catch(t){"object"==typeof window&&(e=window)}t.exports=e},function(t,n,e){var r=e(13),o="object"==typeof self&&self&&self.Object===Object&&self,c=r||o||Function("return this")();t.exports=c},function(t,n){t.exports=function(t){var n=typeof t;return null!=t&&("object"==n||"function"==n)}},function(t,n,e){var r=e(0),o=e(18),c=e(19),u="[object Null]",i="[object Undefined]",a=r?r.toStringTag:void 0;t.exports=function(t){return null==t?void 0===t?i:u:a&&a in Object(t)?o(t):c(t)}},function(t,n){t.exports=function(t){return null!=t&&"object"==typeof t}},function(t,n,e){var r=e(6),o=e(7),c="[object Symbol]";t.exports=function(t){return"symbol"==typeof t||o(t)&&r(t)==c}},function(t,n){t.exports=function(t,n){for(var e=-1,r=Array(t);++e<t;)r[e]=n(e);return r}},function(t,n){t.exports=function(t){return t}},function(t,n,e){var r=e(17);t.exports=function(t){var n=r(t),e=n%1;return n==n?e?n-e:n:0}},function(t,n,e){var r=e(5),o=e(8),c=NaN,u=/^\s+|\s+$/g,i=/^[-+]0x[0-9a-f]+$/i,a=/^0b[01]+$/i,f=/^0o[0-7]+$/i,l=parseInt;t.exports=function(t){if("number"==typeof t)return t;if(o(t))return c;if(r(t)){var n="function"==typeof t.valueOf?t.valueOf():t;t=r(n)?n+"":n}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(u,"");var e=a.test(t);return e||f.test(t)?l(t.slice(2),e?2:8):i.test(t)?c:+t}},function(t,n,e){(function(n){var e="object"==typeof n&&n&&n.Object===Object&&n;t.exports=e}).call(this,e(3))},function(t,n,e){"use strict";e.r(n);e(15);var r=e(1),o=function(t,n,e,r){return new(e||(e=Promise))(function(o,c){function u(t){try{a(r.next(t))}catch(t){c(t)}}function i(t){try{a(r.throw(t))}catch(t){c(t)}}function a(t){t.done?o(t.value):new e(function(n){n(t.value)}).then(u,i)}a((r=r.apply(t,n||[])).next())})},c=function(t,n){var e,r,o,c,u={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return c={next:i(0),throw:i(1),return:i(2)},"function"==typeof Symbol&&(c[Symbol.iterator]=function(){return this}),c;function i(c){return function(i){return function(c){if(e)throw new TypeError("Generator is already executing.");for(;u;)try{if(e=1,r&&(o=2&c[0]?r.return:c[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,c[1])).done)return o;switch(r=0,o&&(c=[2&c[0],o.value]),c[0]){case 0:case 1:o=c;break;case 4:return u.label++,{value:c[1],done:!1};case 5:u.label++,r=c[1],c=[0];continue;case 7:c=u.ops.pop(),u.trys.pop();continue;default:if(!(o=(o=u.trys).length>0&&o[o.length-1])&&(6===c[0]||2===c[0])){u=0;continue}if(3===c[0]&&(!o||c[1]>o[0]&&c[1]<o[3])){u.label=c[1];break}if(6===c[0]&&u.label<o[1]){u.label=o[1],o=c;break}if(o&&u.label<o[2]){u.label=o[2],u.ops.push(c);break}o[2]&&u.ops.pop(),u.trys.pop();continue}c=n.call(t,u)}catch(t){c=[6,t],r=0}finally{e=o=0}if(5&c[0])throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}([c,i])}}};document.body.classList.add("javascript-enabled"),window.onload=function(){return o(this,void 0,void 0,function(){return c(this,function(t){switch(t.label){case 0:return function(){try{var t=document.createElement("canvas"),n=t.getContext("webgl")||t.getContext("experimental-webgl");return!!(n&&n instanceof WebGLRenderingContext)}catch(t){return!1}}?(r.e(),[4,e.e(2).then(e.bind(null,21))]):[3,2];case 1:t.sent(),t.label=2;case 2:return[2]}})})}},function(t,n,e){},function(t,n,e){var r=e(10);t.exports=function(t){return"function"==typeof t?t:r}},function(t,n,e){var r=e(12),o=1/0,c=1.7976931348623157e308;t.exports=function(t){return t?(t=r(t))===o||t===-o?(t<0?-1:1)*c:t==t?t:0:0===t?t:0}},function(t,n,e){var r=e(0),o=Object.prototype,c=o.hasOwnProperty,u=o.toString,i=r?r.toStringTag:void 0;t.exports=function(t){var n=c.call(t,i),e=t[i];try{t[i]=void 0;var r=!0}catch(t){}var o=u.call(t);return r&&(n?t[i]=e:delete t[i]),o}},function(t,n){var e=Object.prototype.toString;t.exports=function(t){return e.call(t)}}]);
//# sourceMappingURL=main.d3026f2f.js.map