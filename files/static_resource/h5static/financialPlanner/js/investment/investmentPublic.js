function bodyScroll(){bottomLoading.bodyScroll()}!function(){var o={};this.tmpl=function t(i,n){var e=/\W/.test(i)?new Function("obj","var p=[]; var print=function(){p.push.apply(p,arguments)};with(obj){p.push('"+i.replace(/[\r\t\n]/g," ").split("<%").join("	").replace(/((^|%>)[^\t]*)'/g,"$1\r").replace(/\t=(.*?)%>/g,"',$1,'").split("	").join("');").split("%>").join("p.push('").split("\r").join("\\'")+"');}return p.join('');"):o[i]=o[i]||t(document.getElementById(i).innerHTML);return n?e(n):e}}();var investment={msgDialog:function(o){if(""!=o&&null!=o&&void 0!=o){var t=this,i=$(".tipsOvrly");i.find(".ovrlyWord").html(o),i.addClass("tipsOvrlyShow"),setTimeout(t.msgDialogHide,2e3)}},msgDialogHide:function(){var o=$(".tipsOvrly");o.removeClass("tipsOvrlyShow")},loadingShow:function(){var o=$(".loadingDiv");o.removeClass("hidden"),o.addClass("show")},loadingHidden:function(){var o=$(".loadingDiv");o.removeClass("show"),o.addClass("hidden")},getQueryString:function(o){var t=new RegExp("(^|&)"+o+"=([^&]*)(&|$)","i"),i=window.location.search.substr(1).match(t);return null!=i?unescape(i[2]):null}};!function(){var o=navigator.userAgent.toLowerCase(),t=null;(o.indexOf("iphone")>=0||o.indexOf("ipad")>=0)&&document.body.addEventListener("touchend",function(o){var i=(new Date).getTime();t=t||i+1;var n=i-t;return 500>n&&n>0?(o.preventDefault(),!1):void(t=i)},!1)}();var Loading={init:function(){this.dom=document.createElement("div"),this.dom.className="loadingDiv hidden",document.body.appendChild(this.dom)},show:function(){this.dom.classList.add("show"),this.dom.classList.remove("hidden")},hide:function(){this.dom.classList.add("hidden"),this.dom.classList.remove("show")}},bottomLoading={init:function(){this.dom=document.createElement("div"),this.dom.className="loadingBox hide",this.dom.innerHTML='<div class="loading">加载更多&nbsp;.&nbsp;.&nbsp;.</div>',this.callBackFn=function(){},this.domNoMore=document.createElement("div"),this.domNoMore.className="noMoreTips hide",this.domNoMore.innerHTML="<div class='noMoreTipsWord'>没有更多了</div><div class='noMoreLine'>&nbsp;</div>",document.body.appendChild(this.dom),document.body.appendChild(this.domNoMore)},bottomLoadShow:function(){this.dom.classList.add("show"),this.dom.classList.remove("hide")},bottomLoadHide:function(){this.dom.classList.add("hide"),this.dom.classList.remove("show"),this.bottomNoMoreShow()},bottomNoMoreShow:function(){this.domNoMore.classList.add("show"),this.domNoMore.classList.remove("hide")},bottomNoMoreHide:function(){this.domNoMore.classList.add("hide"),this.domNoMore.classList.remove("show")},bodyScroll:function(){var o=this;o.bottomLoadShow();var t=document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop,i=document.documentElement.scrollHeight,n=document.documentElement.clientHeight;t+n>i-60&&o.callBackFn()},bodyScrollBind:function(o){var t=this;t.callBackFn=o,document.addEventListener("scroll",bodyScroll,!1)},bodyScrollUnBind:function(){document.removeEventListener("scroll",bodyScroll,!1)}};