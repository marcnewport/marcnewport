var Sequence=Class.extend({getData:function(p_pageId){var l_cacheBuster="?cacheBuster="+_app.structure.course.settings.cache_buster,l_xmlPath="./data/"+p_pageId+".xml"+l_cacheBuster,l_data={};if(p_pageId!=_app.structure.course.id){$.ajax({type:"GET",url:l_xmlPath,dataType:"xml",async:false,success:function(p_data){l_data=$.xml2json(p_data);if(l_data.text!=undefined){var l_dataString=String(l_data);if(l_dataString.indexOf("XML Parsing Error")>-1){trace(l_dataString)}}},error:function(p_response,p_status,p_error){trace('Could not load "'+l_xmlPath+'"\r\n'+p_status+": "+p_error.name)}})}return l_data},goTo:function(p_pageId,p_direction){var l_data=this.getData(p_pageId);if(_app.currentPage.audio)_app.currentPage.audio.pause();if(_app.currentPage.destroy)_app.currentPage.destroy();_app.currentPage={};_app.$content.unbind("click");_app.$loader.fadeIn(500,function(){_app.$loader.focus();_app.removePlayers("case-study");_app.$content.empty();$.loadScript("js/page_types/"+l_data.type+".js",function(){_app.currentPage=new window[l_data.type](l_data);if(_app.debug&&console){console.log("Location updated:",_app.structure.course.id[0],">",_app.currentPage.id)}})})},next:function(p_id){var scope=this,l_id=p_id||_app.currentPage.id,l_next=_app.structure.next(l_id),l_topic={},l_nextTopic={},l_notice="",$overlay=[];if(l_next=="last"){l_topic=_app.structure.parent(l_id).id;l_nextTopic=_app.structure.getNextTopic();if(l_nextTopic){l_notice=this.getData(l_topic).topic_notice;if(l_notice){$overlay=_app.modalOverlay("End of topic",l_notice,"small","OK");$overlay.bind("close.nextTopic",function(){l_next=_app.structure.firstViewableChild(l_nextTopic.id);scope.goTo(l_next.id,"next");$overlay.unbind("close.nextTopic")})}else{l_next=_app.structure.firstViewableChild(l_nextTopic.id);scope.goTo(l_next.id,"next")}return true}}else if(typeof l_next==="object"){this.goTo(l_next.id,"next");return true}return false},back:function(p_id){var l_id=p_id||_app.currentPage.id,l_back=_app.structure.previous(l_id),l_parent={},l_backTopic={},l_backFromParent={};if(l_back==="first"){l_parent=_app.structure.parent(l_id);if(l_parent){l_backTopic=_app.structure.getPreviousTopic();l_backFromParent=_app.structure.previous(l_parent.id);if(l_backTopic){l_back=_app.structure.lastViewableChild(l_backTopic.id)}else if(l_backFromParent.type==="mp_diagram"){l_back=l_backFromParent}}}if(typeof l_back==="object"){this.goTo(l_back.id,"back");return true}return false},exit:function(){var l_top=0,$message=[];_app.removePlayers();if(_app.scorm.connected){if(_app.currentPage.destroy)_app.currentPage.destroy();l_top=$(window).height()/2+50;$message=$$("p").html("Saving data...").css({top:l_top+"px"});_app.$body.html($$("div","loader").css("display","block").append($$("div","","inner")).append($message));_app.currentPage={};_app.session.end(function(){setTimeout(function(){var $exitBox=$$("div","exit-box");_app.$body.html($exitBox.append($$("div","","title").html(_app.structure.course.course_save_title)).append($$("div","","content").html(_app.structure.course.course_save_content)).css("margin-top",l_top-125+"px"));setTimeout(function(){if(window.opener){window.close()}if(window.top.opener){if(window.close_window){window.close_window({preventDefault:false})}window.top.close()}},2e3)},2e3)})}else{_app.$body.empty();_app.currentPage={};if(window.opener){window.close()}if(window.top.opener){if(window.close_window){window.close_window({preventDefault:false})}window.top.close()}}}});