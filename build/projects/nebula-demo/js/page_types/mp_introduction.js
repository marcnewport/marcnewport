var mp_introduction=PageType.extend({setup:function(){var $leftColumn=$$("div","","left-column"),$rightColumn=$$("div","","right-column"),$infoBox=$$("div","info-box"),l_emptyRight=true;if(!empty(this.data.module)){$leftColumn.append($$("div","main-text").html(this.data.module))}if(!empty(this.data.learn_about)){$leftColumn.append($$("div","learn-text").html($$("h3").html(this.data.learn_about_title)).append(this.data.learn_about))}if(!empty(this.data.get_started)){$leftColumn.append($$("div","start-text").html($$("h3").html(this.data.get_started_title)).append(this.data.get_started))}$infoBox.append($$("h3").html(this.data.about_module_title));if(!empty(this.data.time)){$infoBox.append($$("div","","block-time block").append($$("span","","icon icon-stopwatch")).append($$("h5").html(this.data.time_title)).append(this.data.time));l_emptyRight=false}if(!empty(this.data.audio_info)){$infoBox.append($$("div","","block-audio block").append($$("span","","icon icon-headphones")).append($$("h5").html(this.data.audio_info_title)).append(this.data.audio_info));l_emptyRight=false}if(!empty(this.data.text_references)){$infoBox.append($$("div","","block-text block").append($$("span","","icon icon-book")).append($$("h5").html(this.data.text_references_title)).append(this.data.text_references));l_emptyRight=false}this.html.append($leftColumn);if(!l_emptyRight){this.html.append($rightColumn.append($infoBox))}this._super()},resizePage:function(){var $pageTitle=_app.$content.find(".page-title"),$inner=_app.$content.find(".inner"),l_margin=$inner.outerHeight(true)-$inner.outerHeight(),l_outer=$pageTitle.outerHeight(true)+l_margin,$leftColumn=_app.$content.find(".left-column"),lc_margin=$leftColumn.outerHeight(true)-$leftColumn.outerHeight(),$rightColumn=_app.$content.find(".right-column"),rc_margin=$rightColumn.outerHeight(true)-$rightColumn.outerHeight(),l_height=_app.$content.height();$leftColumn.css({maxHeight:l_height-l_outer-lc_margin,paddingRight:"15px",overflow:"auto"});$rightColumn.css({maxHeight:l_height-l_outer-rc_margin})}});