function btnShow(){document.querySelector(".js_endOk").style.display="block"}function arrayToJson(t){for(var e={},o=0;o<t.length;o++){var a=t[o];e[a]=getCookie(a)}}setNoHasAppBtn(),setWebTitle("定制预览");var dialogBox;window.onload=function(){Loading.init(),Tips.init(),submitCustomInfo.init();var t=new stepButton({btnClass:".js_endOk",clickFn:function(){submitCustomInfo.load(function(){clearArrCookie(applyClearCookie),dialogBox.show(),callBackBtnGoBackWebUrl()})}});t.bindClickFn();var e=document.querySelector(".dialogBox");dialogBox=new Dialog({dialogBox:e,closeFn:function(){toAppCustomize()}});{var o=[{name:"lenderName",tit:"定制用户",unit:""},{name:"customName",tit:"产品名称 ",unit:""},{name:"customRate",tit:"推荐服务费",unit:"%","class":"longShort"},{name:"customAnnaulRate",tit:"用户参考年回报率",unit:"%","class":"longShort"}],a=[{name:"customPeriodAndUnit",tit:"定制期限",unit:""},{name:"customAmount",tit:"定制金额",unit:"万元"},{name:"multipleRate",tit:"定制产品进阶打包回报率<br>（参考年回报率+推荐服务费）",unit:"%","class":"longShort"}];new preview({wrapperClass:".preview1",previewData:o}),new preview({wrapperClass:".preview2",previewData:a})}btnShow()};var preview=function(t){this.wrapperClass=t.wrapperClass,this.wrapperBox=document.querySelector(this.wrapperClass),this.previewData=t.previewData||[],this.init()};preview.prototype.init=function(){var t=document.createElement("div");t.classList.add("itemList"),t.classList.add("preview"),t.innerHTML=this.previewHtml(),this.dom=this.wrapperBox.appendChild(t)},preview.prototype.previewHtml=function(){for(var t=this.previewData,e=[],o=0;o<t.length;o++){var a=t[o],i=a["class"]?a["class"]:"",n=a.tit,s=getCookie(a.name),r=a.unit;"customAmount"==a.name&&s&&(s=parseInt(s)/1e4);var u=['<div class="item '+i+'">','<div class="tit">',"<label>"+n+"</label>","</div>",'<div class="infoWord">',s+r,"</div>","</div>"].join("");e.push(u)}return e.join("")};var submitCustomInfo={token:"aaaa",init:function(){var t=this;t.token=getCookie("token")?getCookie("token"):""},load:function(t){var e=this;Loading.show();var o=e.getPostData();o={appReqData:o,token:e.token},e.postData=o,e.postData=JSON.stringify(e.postData),$.ajax({url:"/webapi/custom/submitCustomInfo.ason",type:"post",async:!0,data:{data:e.postData},dataType:"JSON",timeout:15e3,cache:!1,success:function(e){Loading.hide(),"1"==e.code?t():Tips.show(e.msg)},error:function(t){Loading.hide()},complete:function(t,e){Loading.hide(),"success"!=e&&Tips.show("timeout"==e||4==t.readyState&&"error"==e||0==t.readyState||1==t.readyState?"网络出现异常,请稍后重试":"服务器异常")}})},getPostData:function(){var t=this,e=["token","lenderId","customName","customRate","customAnnaulRate","customPeriod","customPeriodUnit","customAmount","multipleRate","productCode"];return postData=t.arrayToJson(e),postData},arrayToJson:function(t){for(var e={},o=0;o<t.length;o++){var a=t[o];e[a]=getCookie(a)}return e}};