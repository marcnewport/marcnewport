var mp_search_scene=PageType.extend({setup:function(){var l_image=this.data.asset.item,l_hotspots=$.makeArray(this.data.hotspots.item),l_hsCount=l_hotspots.length,$image=$$("img").attr({src:"files/"+l_image.content,alt:l_image.alt_text+" Select each clickable within the image.",width:l_image.width,height:l_image.height}),l_userData=_app.session.getUserData(this.id),l_class="";this.$scene=$$("div","scene").attr({role:"listbox"});this.$scene.append($image);for(var i=0;i<l_hsCount;i++){l_hotspots[i].id="hs-"+i;l_hotspots[i].viewed=false;l_class="hotspot";if(l_userData[2]!=undefined&&Boolean(l_userData[2][i])){l_class+=" complete";l_hotspots[i].viewed=true}this.$scene.append($$("a",l_hotspots[i].id,l_class,{href:"#",role:"option"}).css({position:"absolute",top:l_hotspots[i].top+"px",left:l_hotspots[i].left+"px"}).html(l_hotspots[i].title))}this.hotspots=l_hotspots;this.html.append($$("div","main-text").html(this.data.main)).append(this.$scene);this._super();this.hotspotId=""},pageReady:function(){this._super();var scope=this,l_offset={},c_offset=_app.$content.offset(),l_userData=_app.session.getUserData(this.id),l_hotspotCount=this.hotspots.length,l_completed=true,l_opacity=Number(_app.structure.course.settings.disabled_navigation_opacity);if(l_userData[2]){for(var i=0;i<l_hotspotCount;i++){if(!this.hotspots[i].viewed){$("#btn-page-navigation-next").disable({opacity:l_opacity});l_completed=false;break}}}else{l_completed=false}if(l_completed){$("#btn-page-navigation-next").enable()}this.$scene.bind("click",function(event){var $target=$(event.target),l_id="";_app.$page.find("#hs-popup").fadeOut(400,function(){$(this).remove()});if($target.hasClass("hotspot")){l_id=$target.attr("id");if(l_id!=scope.hotspotId){scope.hotspotId=l_id;l_offset=$target.offset();scope.position={top:l_offset.top-c_offset.top,left:l_offset.left-c_offset.left};scope.hotspotClicked(l_id)}else{scope.hotspotId=""}return false}else{scope.hotspotId=""}});this.$scene.find(".hotspot").hover(function(){$(this).addClass("hover")},function(){$(this).removeClass("hover")})},resizePage:function(){var $pageTitle=_app.$content.find(".page-title"),$inner=_app.$content.find(".inner"),l_margin=$inner.outerHeight(true)-$inner.outerHeight(),l_outer=$pageTitle.height()+l_margin,$main=_app.$content.find("#main-text"),$scene=_app.$content.find("#scene"),l_height=_app.$content.height(),l_width=_app.$content.find(".inner").width(),l_imageWidth=$scene.find("img").attr("width");$main.css({maxHeight:l_height-l_outer,width:l_width-l_imageWidth-35,paddingRight:"1em",overflow:"auto"});$scene.css({maxHeight:l_height-l_outer,overflow:"hidden"})},hotspotClicked:function(p_id){var scope=this,l_hsCount=this.hotspots.length,l_hotspot={};for(var i=0;i<l_hsCount;i++){if(this.hotspots[i].id==p_id){this.hotspots[i].viewed=true;l_hotspot=this.hotspots[i];break}}_app.$page.find("#hs-popup").remove();this.popup(l_hotspot);setTimeout(function(){scope.submit()},400)},popup:function(p_data){var scope=this,$hotspot=$("#"+this.hotspotId),$popup=$$("div","hs-popup","hidden popup",{role:"dialog"}),l_title=p_data.title||"&nbsp;",l_content=p_data.label||"&nbsp;",l_offset=0,l_width=0,l_height=0,l_top=0,l_left=0,l_bottom=0,l_right=0,l_buttonWidth=0,l_buttonOffset=0,l_topBounds=0;$popup.html($$("div","","title").append($$("div","","inner").html($$("h3").html(l_title)))).append($$("div","","content").html(l_content));_app.$page.append($popup);l_width=$popup.actual("width");l_height=$popup.actual("height");l_buttonOffset=(l_height-$hotspot.outerHeight())/2;l_offset=$("#"+this.hotspotId).offset();l_top=l_offset.top-_app.dimensions.top-l_buttonOffset;l_left=l_offset.left-_app.dimensions.left-l_width;l_bottom=_app.dimensions.height;l_right=_app.dimensions.width;l_topBounds=_app.$header.height()+5;if(l_top+l_height+60>l_bottom){l_top=l_bottom-l_height-60}if(l_top<l_topBounds){l_top=l_topBounds}if(l_left+l_width+10>l_right){l_left=l_right-l_width-10}l_buttonWidth=_app.navigation==="top"?0:$("#panel-buttons").width();if(l_left<l_buttonWidth+20){l_left=l_offset.left-_app.dimensions.left+$hotspot.outerWidth()-2}$popup.css({top:Math.round(l_top)+"px",left:Math.round(l_left)+"px"});$popup.fadeIn(400,function(){$popup.findFirstText().attr({tabindex:"-1"}).focus();$(document).bind("keyup.removehspopup",function(e){switch(e.keyCode){case 9:case 13:case 27:_app.$content.trigger("click");$(document).unbind("keyup.removehspopup");e.preventDefault();break}})});_app.$content.bind("click.closePopup",function(p_event){$popup.fadeOut(400,function(){$("#"+p_data.id).focus();$(this).remove()});_app.$content.unbind("click.closePopup");scope.hotspotId="";p_event.preventDefault()})},submit:function(){var l_hsCount=this.hotspots.length,l_userData=[],l_viewedCount=0;for(var i=0;i<l_hsCount;i++){if(this.hotspots[i].viewed){$("#"+this.hotspots[i].id).addClass("complete");l_userData[i]=1;l_viewedCount++}else{l_userData[i]=0}}if(l_viewedCount==this.hotspots.length){$("#btn-page-navigation-next").enable();this.updatePageData([-1,l_userData])}if(_app.session.getUserData(this.id)){_app.session.setUserData([this.id,-1,l_userData])}}});