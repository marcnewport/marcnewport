(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports=function(){function o(o){var t=i.find("a"),n=66;o?t.each(function(o){var t=this;setTimeout(function(){t.style.transform="scale(1)"},n*o)}):t.removeAttr("style")}var t,n,e=$(window),c=e.height(),i=$document.find("footer"),r=i.height(),u=!1;$document.on("scroll",function(){t=$document.scrollTop()+c,n=(document.body.scrollHeight-t)/r,1>n?.5>n&&!u&&(o(!0),u=!0):u&&(o(!1),u=!1)})};
},{}],2:[function(require,module,exports){
(function (global){
var utils=require("./utils"),footer=require("./footer");utils(),function(e){global.$document=e(document),$document.ready(function(){"use strict";footer()})}(jQuery);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./footer":1,"./utils":3}],3:[function(require,module,exports){
module.exports=function(){_.mixin({randomFloat:function(n,o){return Math.max(Math.random()*o,n).toFixed(1)}})};
},{}]},{},[2])


//# sourceMappingURL=build/js/main.js.map