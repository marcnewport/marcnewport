(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports=function(){function o(o){var t=i.find("a"),n=66;o?t.each(function(o){var t=this;setTimeout(function(){t.style.transform="scale(1)"},n*o)}):t.removeAttr("style")}var t,n,e=$(window),c=e.height(),i=$document.find("footer"),r=i.height(),u=!1;$document.on("scroll",function(){t=$document.scrollTop()+c,n=(document.body.scrollHeight-t)/r,1>n?.5>n&&!u&&(o(!0),u=!0):u&&(o(!1),u=!1)})};
},{}],2:[function(require,module,exports){
module.exports=function(){var o=$("#home"),t=o.height(),i=o.find(".title-big"),e=o.find(".title-small");$document.on("scroll",function(){var o=$document.scrollTop(),p=o/t*100,s=(100-p)/100;e.css({position:"relative",top:o/2+"px",opacity:s}),i.eq(0).css({position:"relative",top:o/3.5+"px",opacity:1.5*s}),i.eq(1).css({position:"relative",top:o/15+"px",opacity:2*s})})};
},{}],3:[function(require,module,exports){
(function (global){
var home=require("./home"),projects=require("./projects"),footer=require("./footer");!function(e){global.$document=e(document),global.hash="#home",$document.ready(function(){"use strict";e("body");home(),projects(),footer(),ScrollReveal({reset:!0}).reveal(".img-circle",{duration:1e3})})}(jQuery);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./footer":1,"./home":2,"./projects":4}],4:[function(require,module,exports){
module.exports=function(){var o=$("#projects");$("body").on("click.project",".project-link",function(n){o.addClass("no-hover")}),$(".project-modal").on("hidden.bs.modal",function(n){o.removeClass("no-hover")})};
},{}]},{},[3])


//# sourceMappingURL=build/js/main.js.map