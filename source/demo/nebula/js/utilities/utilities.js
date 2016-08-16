Function.prototype.addMethod=function(p_name,p_function){if(!this.prototype[p_name]){this.prototype[p_name]=p_function;return this}};Array.addMethod("shuffle",function(){var l_count=this.length,l_temporary,l_random;for(var i=0;i<l_count;i++){l_temporary=this[i];l_random=Math.floor(Math.random()*l_count);this[i]=this[l_random];this[l_random]=l_temporary}return this});Array.addMethod("remove",function(from,to){var index=0,range=from+(to||1),newArray=[];for(var key in this){index=parseInt(key);if(index<from||index>=range){newArray.push(this[key])}}return newArray});if(!Array.indexOf){Array.addMethod("indexOf",function(p_item){var l_length=this.length;for(var i=0;i<l_length;i++){if(this[i]==p_item){return i}}return-1})}Number.addMethod("toScormTimeString",function(){var l_seconds=this/1e3,l_hrs=Math.floor(l_seconds/(60*60)),l_divisor_for_minutes=l_seconds%(60*60),l_mins=Math.floor(l_divisor_for_minutes/60),l_divisor_for_seconds=l_divisor_for_minutes%60,l_secs=Math.ceil(l_divisor_for_seconds);l_hrs=l_hrs<10?"0"+l_hrs:l_hrs;l_mins=l_mins<10?"0"+l_mins:l_mins;l_secs=l_secs<10?"0"+l_secs:l_secs;return l_hrs+":"+l_mins+":"+l_secs});if(!Number.isInteger){Number.isInteger=function(n){return Number(n)===n&&n%1===0}}String.addMethod("uncarriage",function(){var text=this;text=text.replace(/\n\r|\r\n|\r|\n/g,"<br />");return text});String.addMethod("carriage",function(){var text=this;text=text.replace(/<br \/>/g,"\r\n");return text});String.addMethod("stripTags",function(){var text=this;text=text.replace(/(<([^>]+)>)/gi,"");return text});String.addMethod("truncate",function(p_length,p_prefix){var l_words=this.split(" "),l_count=l_words.length,l_length=p_length||250,l_title=p_prefix||"",l_ignore=["a","an","as","at","before","but","by","for","from","is","in","into","like","of","off","on","onto","per","since","than","the","this","that","to","up","via","with"];for(var i=0;i<l_count;i++){if(l_ignore.indexOf(l_words[i])<0){l_title+="_"+l_words[i]}}if(p_prefix===undefined){l_title=l_title.substr(1)}l_title=l_title.substring(0,l_length);return l_title});if(!Date.now){Date.now=function(){var l_date=new Date;return l_date.getTime()}}function trace(data,depth){var error=new Error,stack="",info="",file="",line="",readable=null;readable=function(data){var output="";if(typeof data=="object"){output+="Object\n";for(var a in data){if(typeof data[a]!="function")output+="  "+a+" : "+data[a]+";\n"}}else{output=data}return output};if(console){if(error.stack){stack=error.stack.split("\n")[depth||1];info=stack.split("/").pop().split(":");file=info[0].replace(/\?.+/g,"");line=info.pop();console.group(file+" (line "+line+")");console.log(data);console.groupEnd()}else{console.log(readable(data))}}else{alert(readable(data))}}function empty(p_data){if(typeof p_data==="object"){for(var key in p_data){if(p_data.hasOwnProperty(key)){return false}}return true}else if(typeof p_data==="undefined"){return true}else{switch(p_data){case false:case null:case"":case 0:return true}}return false}function $$(p_element,p_id,p_classes,p_attributes){var $element,l_formElements=["button","checkbox","file","hidden","image","password","radio","reset","submit","text"];if(l_formElements.indexOf(p_element)>-1){$element=$(document.createElement("input")).attr("type",p_element);if(p_id){$element.attr({id:p_id,name:p_id})}}else{$element=$(document.createElement(p_element));if(p_id){$element.attr("id",p_id)}}if(p_classes){$element.attr("class",p_classes)}if(p_attributes){$element.attr(p_attributes)}return $element}jQuery.extend({randomString:function(p_length){var l_length=p_length||10,l_chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",l_count=l_chars.length,l_string="";for(var i=0;i<l_length;i++){l_string+=l_chars.charAt(Math.floor(Math.random()*l_count))}return l_string},loadScript:function(file,callback){$.ajax({dataType:"script",cache:true,url:file+"?cacheBuster="+_app.structure.course.settings.cache_buster,complete:callback})}});(function($){$.fn.transcript=function(direction,dimensions,id,open){return this.each(function(){var $this=$(this),$content=$(document.createElement("div")).addClass("transcript-content").attr("id",id+"-description"),$button=$(document.createElement("a")).attr("href","#").addClass("transcript-button"),showing=true,l_showText="<span>Show Transcript</span>",l_hideText="<span>Hide Transcript</span>",l_contentHeight=0,l_animate=0,l_open=open===false?false:true;$this.addClass("transcript open "+direction);$this.css({width:dimensions.width+"px",height:dimensions.height+"px","float":"left",position:"relative",overflow:"hidden"});if(dimensions.top!==undefined&&dimensions.left!==undefined){$this.css({position:"absolute",top:dimensions.top+"px",left:dimensions.left+"px"})}$content.css({"float":"left",padding:"10px",overflow:"auto",backgroundColor:"#E6E6E6",color:"#000000"});$button.css({display:"block",overflow:"hidden","float":"left",backgroundColor:"#404040",color:"#FFFFFF"});switch(direction){case"down":$this.css({maxHeight:dimensions.height+"px"});$content.css({width:dimensions.width-20+"px",maxHeight:dimensions.height-20-33+"px"});$button.html(l_hideText).css({width:"100%",height:"28px"});$this.wrapInner($content).append($button);l_contentHeight=$content.height();l_animate=dimensions.height-33;if(_app.structure.course.description_panel==="0"||!l_open){$button.html(l_showText);$content=$this.find(".transcript-content");var $clone=$content.clone();_app.$page.append($clone);l_contentHeight=$clone.height();$clone.remove();$content.css({height:0,paddingTop:0,paddingBottom:0});$this.removeClass("open");showing=false}$button.click(function(){$content=$this.find(".transcript-content");if(showing){$button.html(l_showText);l_contentHeight=$content.height();$content.animate({height:0,paddingTop:0,paddingBottom:0},200,function(){$this.removeClass("open")});showing=false}else{$button.html(l_hideText);$content.animate({height:l_contentHeight+"px",paddingTop:"10px",paddingBottom:"10px"},200,function(){$this.addClass("open").find(".transcript-content").attr("tabindex","-1").focus()});showing=true}return false});break;case"right":$content.css({width:dimensions.width-20-33+"px",height:dimensions.height-20+"px"});$button.html(l_hideText).css({width:"28px",height:"100%"});$this.wrapInner($content).append($button);l_animate=dimensions.width-33;if(_app.structure.course.description_panel=="0"){$button.html(l_showText);$this.css("left",l_animate*-1).removeClass("open");showing=false}$button.click(function(){if(showing){$button.html(l_showText);$this.animate({left:"-="+l_animate+"px"},200,function(){$this.removeClass("open")});showing=false}else{$button.html(l_hideText);$this.animate({left:"+="+l_animate+"px"},200,function(){$this.addClass("open").find(".transcript-content").attr("tabindex","-1").focus()});showing=true}return false});break}})};$.fn.tooltip=function(text,classes){return this.each(function(){var $this=$(this),offset=$this.offset(),$body=$("body"),$document=$(document),bodyLeft=parseInt($body.css("margin-left"),10),bodyTop=parseInt($body.css("margin-top"),10),position={},classNames=classes?classes+" tooltip":"tooltip",$tooltip=$(document.createElement("div")).addClass(classNames).attr({role:"dialog"}),$box=$(document.createElement("div")).addClass("box"),$content=$(document.createElement("div")).addClass("content").attr({tabindex:"-1"}),$point=$(document.createElement("div")).addClass("point");$body.find(".tooltip").remove();if($body.data("tooltip-showing")){$body.data("tooltip-showing",false)}else{$tooltip.append($box.html($content.html(text))).append($point);$body.append($tooltip);position.top=offset.top-bodyTop-$tooltip.height();position.left=offset.left-bodyLeft-$tooltip.width()/2+$this.width()/2;if(position.top<-5){position.top=-5}if(position.left+$tooltip.width()>$body.width()){position.newLeft=$body.width()-$tooltip.width();position.difference=position.left-position.newLeft;$point.css("left",parseInt($point.css("left"),10)+position.difference);position.left=position.newLeft}$tooltip.css({left:Math.round(position.left),top:Math.round(position.top),outline:"none",display:"none"}).fadeIn(100,function(){$content.focus();$body.bind("click.tooltip",function(){$tooltip.trigger("close")});$document.bind("keydown.tooltip",function(e){switch(e.keyCode){case 9:case 13:case 27:$tooltip.trigger("close");break}});$body.data("tooltip-showing",true)});$tooltip.bind("close",function(){$tooltip.fadeOut(100);setTimeout(function(){$this.focus();$body.data("tooltip-showing",false).unbind("click.tooltip");$document.unbind("keydown.tooltip")},100)})}})};$.fn.disableFocus=function(){return this.each(function(){var $this=$(this),focusable="a[href], area[href], input, select, textarea, button, iframe, [tabindex], [contentEditable]",$focusable=$this.find(focusable).filter(":visible");if($this.is(focusable)){$focusable.add(this)}$focusable.each(function(i){this.setAttribute("data-disabled-focus",true);this.setAttribute("data-original-focus",this.getAttribute("tabindex"));this.setAttribute("tabindex",-1)})})};$.fn.enableFocus=function(){return this.each(function(){var $this=$(this),disabled="[data-disabled-focus]",$disabled=$this.find(disabled);if($this.is(disabled)){$disabled.add(this)}$disabled.each(function(){if(this.dataset){if(this.dataset.originalFocus==="null"){this.removeAttribute("tabindex")}else{this.setAttribute("tabindex",this.dataset.originalFocus)}}this.removeAttribute("data-disabled-focus");this.removeAttribute("data-original-focus")})})};$.fn.disable=function(customStyles){return this.each(function(){var $this=$(this),store={},newStyles=$.extend({opacity:.5},customStyles),events=$._data(this,"events"),stopEvents=function(e){e.stopImmediatePropagation();e.stopPropagation();e.preventDefault();return false};if($this.data("mp-disabled"))return;this.style.transition="all 0.3s";store={title:$this.attr("title"),tabindex:$this.attr("tabindex"),styles:$this.attr("style")};$this.data("mp-disabled",store).attr("tabindex","-1").prop("disabled",true).removeAttr("title").addClass("disabled").css(newStyles);this.style.pointerEvents="none";if(events){$.each(events,function(type,definition){$.each(definition,function(index,event){if(event.handler.toString()!==stopEvents.toString()){if(!$._mpDisabled)$._mpDisabled={};$._mpDisabled[event.guid]=event.handler;event.handler=stopEvents}})})}})};$.fn.enable=function(customStyles){return this.each(function(){var $this=$(this),stored=$this.data("mp-disabled")||{},events=$._data(this,"events"),stopEvents=function(e){e.stopImmediatePropagation();e.stopPropagation();e.preventDefault();return false};if(stored.title){$this.attr("title",stored.title)}if(stored.tabindex){$this.attr("tabindex",stored.tabindex)}else{$this.removeAttr("tabindex")}if(stored.styles){$this.attr("style",stored.styles)}else{$this.removeAttr("style")}$this.removeData("mp-disabled").removeProp("disabled").removeClass("disabled");this.style.pointerEvents="auto";if(events){$.each(events,function(type,definition){$.each(definition,function(index,event){if(event.handler.toString()===stopEvents.toString()){event.handler=$._mpDisabled[event.guid];delete $._mpDisabled[event.guid]}})})}})};$.fn.scaleDimensions=function(p_dimensions){return this.each(function(){var $this=$(this),l_originalWidth=$this.width(),l_originalHeight=$this.height(),l_maxWidth=p_dimensions.width||0,l_maxHeight=p_dimensions.height||0,l_scale=Math.max(l_maxWidth/l_originalWidth,l_maxHeight/l_originalHeight),l_scaledWidth=Math.round(l_originalWidth*l_scale),l_scaledHeight=Math.round(l_originalHeight*l_scale),l_fill=p_dimensions.fill||false,l_marginLeft=0,l_marginTop=0;$this.width(l_scaledWidth).height(l_scaledHeight);if(l_fill){l_marginLeft=Math.round((l_maxWidth-l_scaledWidth)/2);l_marginTop=Math.round((l_maxHeight-l_scaledHeight)/2);$this.css({marginLeft:l_marginLeft,marginTop:l_marginTop})}})};$.fn.hasVerticalScroll=function(){var element=this.get(0);return element.clientHeight<element.scrollHeight};$.fn.findFirstText=function(){var children=this.children(),count=children.length,$child=[],childHTML="",$search=[];for(var i=0;i<count;i++){$child=$(children[i]);if($child.is(":visible")){childHTML=$child.html();if(childHTML!==""&&childHTML[0]!=="<"){return $child}else{$search=$child.findFirstText();if($search.get(0)!==$child.get(0)){return $search}}}}return this};$.fn.findFirstFocusable=function(){return this.find("a, input, select, textarea").filter(":visible").eq(0)}})(jQuery);