(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports=function(){function o(o){var t=c.find("a"),n=66;o?t.each(function(o){var t=this;setTimeout(function(){t.style.transform="scale(1)"},n*o)}):t.removeAttr("style")}var t,n,e=$window.height(),c=$document.find("footer"),i=c.height(),r=!1;$document.on("scroll",function(){t=$document.scrollTop()+e,n=(document.body.scrollHeight-t)/i,1>n?.5>n&&!r&&(o(!0),r=!0):r&&(o(!1),r=!1)})};
},{}],2:[function(require,module,exports){
module.exports=function(){var o=$("#home"),t=.6*o.height(),i=[0,.15*t,.3*t],e=o.find(".title-big"),p=o.find(".title-small");$document.on("scroll",function(){var o=$document.scrollTop(),n=0,s=[];for(var a in i)n=0,o>=i[a]&&(n=(o-i[a])/t*100,n=Math.min(Math.max(n,0),100)),s.push((100-n)/100);p.css({position:"relative",top:(o/3).toFixed(3)+"px",opacity:s[0].toFixed(3)}),e.eq(0).css({position:"relative",top:(o/5).toFixed(3)+"px",opacity:s[1].toFixed(3)}),e.eq(1).css({position:"relative",top:(o/10).toFixed(3)+"px",opacity:s[2].toFixed(3)})})};
},{}],3:[function(require,module,exports){
(function (global){
var home=require("./home"),projects=require("./projects"),footer=require("./footer");!function(o){function e(e){var t="click"===e.type?o(this).attr("href"):window.location.hash||"#home",a=0;global.hash!==t&&(a=o(t).offset().top,o("html, body").animate({scrollTop:a},400,function(){window.location.hash="#home"===t?"":t}),global.hash=t),e.preventDefault()}global.$window=o(window),global.$document=o(document),global.hash="#home",$document.ready(function(){"use strict";var t=o("body");t.on("click.navigate",".btn-navigate-down",e),$window.on("hashchange",e),home(),projects(),footer(),ScrollReveal({reset:!0}).reveal(".img-circle",{duration:1e3})})}(jQuery);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./footer":1,"./home":2,"./projects":4}],4:[function(require,module,exports){
module.exports=function(){var o=$("#projects");$("body").on("click.project",".project-link",function(n){o.addClass("no-hover")}),$(".project-modal").on("hidden.bs.modal",function(n){o.removeClass("no-hover")})};
},{}]},{},[3])


//# sourceMappingURL=build/js/main.js.map