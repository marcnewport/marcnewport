var mp_diagram=PageType.extend({setup:function(){var l_image=this.data.image;this.html.html($$("img").attr({src:"files/"+l_image.file,width:l_image.width,height:l_image.height,alt:l_image.alt_text}));this._super()},resizePage:function(){var $inner=_app.$content.find(".inner").eq(0),$img=$inner.find("img");$inner.css({marginLeft:Math.round((_app.$content.width()-$img.width())/2),marginTop:Math.round((_app.$content.height()-$img.height())/2)})}});