var Session=Class.extend({init:function(){this.resume=1;this.time={start:0,stop:0};var l_data={};this.data=function(){return l_data};this.set=function(p_key,p_value){l_data[p_key]=p_value;return true};this.add=function(p_key,p_value){var l_storedValue=this.get(p_key);if(l_storedValue==undefined){this.set(p_key,[p_value]);return true}else{if(!(l_storedValue instanceof Array)){l_storedValue=[l_storedValue]}if(p_key=="cmi.suspend_data"){var l_count=l_storedValue.length;for(var i=0;i<l_count;i++){if(p_value[0]==l_storedValue[i][0]){l_storedValue[i]=p_value;this.set(p_key,l_storedValue);return true}}}l_storedValue.push(p_value);this.set(p_key,l_storedValue);return true}};this.get=function(p_key){return l_data[p_key]};this.remove=function(p_key){delete l_data[p_key]}},start:function(p_callback){var l_status="";this.time.start=Date.now();this.resume=Number(_app.structure.course.settings.resume_session);if(_app.scorm.connected){l_status=_app.scorm.retrieve("cmi.core.lesson_status");switch(l_status){case"passed":case"completed":case"failed":_app.scorm.disconnect();break;case"not attempted":this.set("cmi.core.lesson_status","incomplete");_app.scorm.save();break}if(this.resume){_app.scorm.retrieveAll(p_callback)}else{this.set("cmi.core.score.raw","0");this.set("cmi.core.score.max","100");this.set("cmi.core.score.min","0");_app.scorm.save(p_callback)}}else{if(p_callback!=undefined)p_callback()}},end:function(p_callback){if(_app.scorm.connected){var l_timeTaken=0;if(this.time.stop<1){this.time.stop=Date.now();l_timeTaken=this.time.stop-this.time.start;this.set("cmi.core.session_time",l_timeTaken.toScormTimeString())}this.checkCompletion(function(){if(p_callback)p_callback();_app.scorm.close()});return true}return false},getUserData:function(p_id){var l_id=p_id||_app.currentPage.id,l_userData=this.get("cmi.suspend_data")||[],l_count=l_userData.length;for(var i=0;i<l_count;i++){if(l_userData[i][0]==l_id){return l_userData[i]}}return false},setUserData:function(p_data){var l_id=p_data[0],l_userData=this.get("cmi.suspend_data")||[],l_count=l_userData.length;for(var i=0;i<l_count;i++){if(l_userData[i][0]==l_id){l_userData[i]=p_data;return}}this.add("cmi.suspend_data",p_data)},unsetUserData:function(p_id){var l_id=p_id||_app.currentPage.id,l_userData=this.get("cmi.suspend_data")||[],l_count=l_userData.length;for(var i=0;i<l_count;i++){if(l_userData[i][0]==l_id){l_userData.splice(i,1);return}}},getTopicCompletion:function(p_id){var l_topics=_app.structure.getTopics(),l_topicCount=l_topics.length,l_pages=[],l_pageCount=0,l_pageData=[],l_complete=true;for(var i=0;i<l_topicCount;i++){if(l_topics[i].id===p_id){l_pages=$.makeArray(l_topics[i].children.item);l_pageCount=l_pages.length;for(var j=0;j<l_pageCount;j++){l_pageData=this.getUserData(l_pages[j].id);if(l_pageData){if(l_pageData[1]===-2){return false}}else{return false}}break}}return l_complete},checkCompletion:function(p_callback){var l_topics=_app.structure.getTopics(),l_topicCount=l_topics.length,l_topic={},l_topicId="",l_topicStatus="",l_topicCompleted=true,l_allTopicsCompleted=true,l_topicRawScore=0,l_topicMaxScore=0,l_topicPercent=0,l_pages={},l_pageCount=0,l_page={},l_pageData=[],l_summaryReached=false,l_lessonStatus="incomplete",l_moduleAssessed=false,l_moduleCompleted=true,l_moduleRawScore=0,l_moduleMaxScore=0,l_modulePercent=0,l_timeTaken=0,l_forceComplete=Number(_app.structure.course.settings.force_complete);for(var i=0;i<l_topicCount;i++){l_topic=l_topics[i];l_topicId=l_topic.title.truncate(250,l_topic.id);l_topicStatus="not attempted";l_topicCompleted=true;l_topicRawScore=0;l_topicMaxScore=0;this.set("cmi.objectives."+i+".id",l_topicId);l_pages=$.makeArray(l_topic.children.item);l_pageCount=l_pages.length;for(var j=0;j<l_pageCount;j++){l_page=l_pages[j];l_pageData=this.getUserData(l_page.id);if(l_pageData.length){switch(l_pageData[1]){case 0:l_topicMaxScore++;break;case 1:l_topicMaxScore++;l_topicRawScore++;break}l_topicStatus="incomplete";if(l_page.type==="mp_summary"){l_summaryReached=true}}else{l_topicCompleted=false;l_allTopicsCompleted=false}}if(l_topic.assessable==="true"){l_moduleAssessed=true;if(l_topicCompleted){l_topicStatus="completed";l_moduleRawScore+=l_topicRawScore;l_moduleMaxScore+=l_topicMaxScore;l_topicPercent=l_topicRawScore/l_topicMaxScore*100;l_topicPercent=Math.round(l_topicPercent*100)/100;l_topicPercent=isNaN(l_topicPercent)?0:l_topicPercent;this.set("cmi.objectives."+i+".score.raw",l_topicPercent);this.set("cmi.objectives."+i+".score.max","100");this.set("cmi.objectives."+i+".score.min","0")}else{l_moduleCompleted=false}}this.set("cmi.objectives."+i+".status",l_topicStatus)}if(l_moduleCompleted){l_lessonStatus="completed";if(l_moduleAssessed){l_modulePercent=l_moduleRawScore/l_moduleMaxScore*100;l_modulePercent=Math.round(l_modulePercent*100)/100;l_modulePercent=isNaN(l_modulePercent)?0:l_modulePercent;this.set("cmi.core.score.raw",l_modulePercent);this.set("cmi.core.score.max","100");this.set("cmi.core.score.min","0");this.setUserData(["score",l_moduleRawScore,l_moduleMaxScore,l_modulePercent]);if(l_modulePercent>=Number(_app.structure.course.settings.pass_mark)){l_lessonStatus="passed"}else{l_lessonStatus="failed"}if(this.time.stop<1){this.time.stop=Date.now();l_timeTaken=this.time.stop-this.time.start;this.set("cmi.core.session_time",l_timeTaken.toScormTimeString())}}else{if(!l_allTopicsCompleted){l_lessonStatus="incomplete"}}}if(!l_moduleAssessed&&l_forceComplete&&l_summaryReached){l_lessonStatus="completed"}if(!this.resume){switch(l_lessonStatus){case"passed":l_lessonStatus="completed";break;case"failed":l_lessonStatus="incomplete";break}}this.set("cmi.core.lesson_status",l_lessonStatus);if(p_callback)p_callback()},getComments:function(p_id){var l_comments=this.get("comments")||[],l_count=l_comments.length,l_pageComments=[];for(var i=0;i<l_count;i++){if(l_comments[i][0]===p_id){l_pageComments=l_comments[i][1]}}return l_pageComments},setComments:function(p_id,p_comments){var l_comments=$.makeArray(p_comments),l_stored=this.getComments(p_id);if(JSON.stringify(l_comments)!==JSON.stringify(l_stored)){this.add("comments",[p_id,l_comments]);_app.scorm.send("cmi.comments",[p_id,l_comments]);_app.scorm.commit()}}});