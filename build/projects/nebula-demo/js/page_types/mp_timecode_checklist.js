var mp_timecode_checklist=TimecodeActivity.extend({setup:function(){var l_responses=$.makeArray(this.data.responses.item),l_count=l_responses.length,$responses=$$("fieldset","activity"),$response=[];$responses.append($$("legend","","hidden").html("Activity"));for(var i=0;i<l_count;i++){$response=$$("div","r-"+i,"response").html($$("label").attr("for","i-"+i).append(l_responses[i].option)).append($$("checkbox","i-"+i).attr({name:"i-"+i})).append($$("span","","custom-input"));$responses.append($response)}this.html.append($$("div","question").html(this.data.question)).append($responses);this._super()},ready:function(){this._super();var $activity=this.$popup.find("#activity"),$submit=this.$popup.find("#btn-submit-popup");$submit.disable();$activity.bind("change",function(e){if($activity.find("input:checked").length){$submit.enable()}else{$submit.disable()}})},submit:function(){this.attempts++;_app.pausePlayers();var $activity=this.$popup.find("#activity"),$responses=$activity.find(".response"),l_answers=$.makeArray(this.data.responses.item),l_userData=[],l_correct=true,l_classes="",l_finalRound=this.attempts>=this.data.max_attempts;$("#btn-submit-popup").disable();$responses.find("input").attr("disabled","true").each(function(i){if(this.checked){l_userData[i]=1;if(!Number(l_answers[i].correct)){l_correct=false}}else{l_userData[i]=0;if(Number(l_answers[i].correct)){l_correct=false}}l_classes=l_userData[i]?"checked":"";l_classes+=Number(l_answers[i].correct)?" correct":"";$responses.eq(i).addClass(l_classes)});if(l_finalRound||l_correct){$activity.addClass("completed")}else{$responses.removeClass("checked correct");$activity.addClass("disabled")}this.updateActivityData([Number(l_correct),l_userData,this.attempts])}});