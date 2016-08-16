var mp_image_multiple_choice=PageType.extend({setup:function(){var response_data=$.makeArray(this.data.responses.item),response_count=response_data.length,l_image={},$image=[],$items=$$("fieldset"),$why="",l_classes="",l_altText="";$items.append($$("legend","","hidden").html("Activity"));for(var i=0;i<response_count;i++){if(!empty(response_data[i].why)){l_altText="Find out why option "+(i+1)+" is ";l_altText+=response_data[i].correct=="1"?"correct.":"incorrect.";$why=$$("a","","btn-why w-"+i,{href:"#",title:l_altText}).html("?");this.whyFeedback=true}else{$why=""}l_classes="item";if((i+1)%3==0)l_classes+=" last-column";if(response_count<4||i>2)l_classes+=" last-row";l_image=response_data[i].asset.item;$image=$$("img","","response-image").attr({src:"files/"+l_image.content,alt:l_image.alt_text,width:120,height:120});$items.append($$("div","r-"+i,l_classes).append($$("div","","input-bdr")).append($$("checkbox","cb"+i,"response custom-input")).append($$("label").attr("for","cb"+i).html($image)).append($why))}this.html.append($$("div","","left-column").html($$("div","scenario").html(this.data.scenario))).append($$("div","","right-column").html($$("div","question").html(this.data.question)).append($$("div","activity").html($items)).append($$("a","btn-submit").attr({href:"#",role:"button"}).html("Submit")));this._super()},pageReady:function(){var l_scenarioless=this.data.scenario==undefined?true:false,l_userData=_app.session.getUserData(this.id);if(l_userData[2]!=undefined){_app.$page.find(".item").each(function(i){if(l_userData[2][i]==1){$(this).addClass("selected").find(".response").prop("checked",true)}})}if(l_scenarioless){$("#content").find(".left-column").hide();$("#content").find(".right-column").addClass("no-scenario")}this._super();this.setupActivity()},setupActivity:function(){var l_submitable=false,$responses=$("#activity").find(".response"),$submit=$("#btn-submit");$submit.disable();$responses.unbind("click").bind("click",function(){$(this).parent().toggleClass("selected");if(!l_submitable){$submit.enable();l_submitable=true}})},submitAnswers:function(){var $activity=$("#activity"),$responses=$activity.find(".response"),l_answers=$.makeArray(this.data.responses.item),l_userData=[],l_correct=true,l_final_round=this.attempts==this.data.max_attempts-1?true:false;this.attempts++;$("#btn-submit").disable();$responses.unbind("click").attr("disabled","disabled");$.each($responses,function(i){var $this=$(this),l_thisCorrect=Boolean(Number(l_answers[i].correct));if(l_thisCorrect){$this.parent().addClass("true")}if($this.prop("checked")){l_userData[i]=1;if(!l_thisCorrect){l_correct=false}}else{l_userData[i]=0;if(l_thisCorrect){l_correct=false}}});if(l_final_round||l_correct){$activity.addClass("final");$activity.find(".item").each(function(){var $this=$(this);if($this.hasClass("true")&&$this.hasClass("selected")){$this.prepend($$("span","","icon icon-tick"))}})}$activity.addClass("disable");this.updatePageData([Number(l_correct),l_userData,this.attempts])},resetActivity:function(){this._super();$("#activity").removeClass("final disable").find(".item").removeClass("selected true").find(".response").prop("checked",false).removeAttr("disabled");this.setupActivity()},resizePage:function(){var $pageTitle=_app.$content.find(".page-title"),$inner=_app.$content.find(".inner"),l_margin=$inner.outerHeight(true)-$inner.outerHeight(),l_outer=$pageTitle.outerHeight(true)+l_margin,$leftColumn=_app.$content.find(".left-column"),lc_margin=parseInt($leftColumn.css("margin-bottom"),10),$question=_app.$content.find("#question"),q_margin=parseInt($question.css("margin-bottom"),10),$activity=_app.$content.find("#activity"),a_margin=parseInt($activity.css("margin-bottom"),10),rc_margin=parseInt($inner.find(".right-column").css("margin-bottom"),10),l_height=_app.$content.height(),l_submit=_app.$content.find("#btn-submit").outerHeight(),l_availableHeight=l_height-l_outer-l_submit-q_margin-a_margin-rc_margin;$leftColumn.css({maxHeight:l_height-l_outer-lc_margin,paddingRight:"15px",overflow:"auto"});$question.css({maxHeight:l_availableHeight-$activity.height()})}});