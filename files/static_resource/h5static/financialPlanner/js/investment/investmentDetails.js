function getUerCallBack(){investmentDetails.init()}var investmentDetails={appType:investment.getQueryString("appType"),domBody:document.querySelector("body"),itemId:investment.getQueryString("id")?investment.getQueryString("id"):"",managerId:"",tokenComparisonBool:!0,tokenComparison:function(){var e=this,t=getCookie("token"),i=investment.getQueryString("token");e.tokenComparisonBool=!1,t!=i?getUserInfo(getUerCallBack):investmentDetails.init()},init:function(){var e=this,t=e.appType;return this.domBody.classList.add(t),e.tokenComparisonBool?void e.tokenComparison():(e.token=getCookie("token"),e.userId=getCookie("userId"),e.managerId="undefined"!=getCookie("managerId")?getCookie("managerId"):"",e.introduceConData.managerId=e.managerId,e.materialLinkData.managerId=e.managerId,void("finance"==e.appType?e.financeDetails():e.lendDetails()))},financeDetails:function(){var e=this;e.introduceCon(),e.materialLink(),e.swiperBind()},lendDetails:function(){var e=this;e.introduceCon()},shareDetails:function(){var e=this;e.introduceCon()},shareConHtml:function(e){e=e.managerInfo;var t=e.avatar?e.avatar:"../../financialPlanner/images/captainInvite/defaultHeadPortrait.png",i=e.nickName?e.nickName:e.managerName,n=e.storeCode?e.storeCode:"",a=['<a href="/mobile/activityPage/shareShop/'+n+'?from=singlemessage&isappinstalled=0">','<div class="shareHeadImg">','	<img src="'+t+'" onload="investmentDetails.loadImage(this);"/>',"</div>",'<div class="shareContent">','	<div class="share">','		<div class="topWord">星火理财师：'+i+"</div>",'		<div class="bottomWord">为您提供贴心专业的理财服务</div>',"	</div>","</div>",'<div class="shareBtn">',"	<span>打开</span>","</div>","</a>"];return a.join("")},loadImage:function(e){e.classList.add("show")},introduceAjaxUrl:"/webapi/goodhopesubject/getById",introduceConData:{id:investment.getQueryString("id"),token:investment.getQueryString("token"),managerId:investment.getQueryString("managerId")},introduceCon:function(){var e=this;e.ajaxData({ajaxUrl:e.introduceAjaxUrl,data:e.introduceConData}).then(function(t){e.introduceConSucc(t)},function(){e.introduceConSucc(data)})},introduceConSucc:function(e){var t=this;if("1"==e.code){var i=e.data.content,n=e.data.name;setWebTitle(n),t.htmlTitle(n),t.introduceConHtml(i);var a=e.data.managerInfo,s=a.supportMobile,r="tel:"+s,o="tel:"+a.managerMobile;document.querySelector(".js_supportMobileNum").innerHTML=s,document.querySelector(".js_supportMobile").setAttribute("href",r),document.querySelector(".js_managerMobile").setAttribute("href",o);var d=e.data,l=d.name?d.name:"",c=d.subdesc?d.subdesc:"",m=d.subimage?d.subimage:"";t.managerId=d.managerInfo.managerId;var v="/h5static/financialPlanner/investment/shareInvestmentDetails.html?appType="+t.itemId+"&id="+t.itemId+"&managerId="+t.managerId,u={shareTitle:l,shareContent:c,shareImageUrl:m,shareUrl:v};shareAppBtnOption(u),0!=document.querySelectorAll(".js_shareBox").length&&(document.querySelector(".js_shareBox").innerHTML=t.shareConHtml(e.data))}},htmlTitle:function(e){document.querySelector("title").innerHTML=e},introduceConHtml:function(e){document.querySelector(".js_backgroundConfigurationCon").innerHTML=e},materialLinkUrl:"/webapi/goodhopesubject/getSubjectDataList/"+investment.getQueryString("id"),materialLinkData:{id:investment.getQueryString("id"),token:investment.getQueryString("token"),managerId:investment.getQueryString("managerId")},materialLink:function(){var e=this;e.ajaxData({ajaxUrl:e.materialLinkUrl,data:e.materialLinkData,type:"get"}).then(function(t){e.materialLinkSucc(t)},function(t){e.materialLinkSucc(t)})},materialLinkSucc:function(e){var t=this;if("1"==e.code){var e=e.data;t.materialLinkHtml(e)}},emptyShow:function(){document.querySelector(".js_empty").style.display="block"},materialLinkHtml:function(e){var t=this,i=[];e.length<=0&&t.emptyShow();for(var n=0;n<e.length;n++){var a=e[n],s=['<div class="item">','	<a href="./materialDetails.html?id='+a.id+'">','		<div class="itemCon">','			<div class="word">'+a.fileName+"</div>",'			<div class="arrowIcon">&nbsp;</div>',"		</div>","	</a>","</div>"];i.push(s.join(""))}document.querySelector(".js_materialLink").innerHTML=i.join("")},ajaxData:function(e){return $.ajax({url:e.ajaxUrl,type:e.type?e.type:"POST",async:!0,cache:!1,dataType:"JSON",timeout:2e4,data:e.data})},bottomTransform:function(e){var t=this;t.bottomObj=document.querySelector(".js_financePhone"),t.bottomObj.style.left=e+"px"},swiperBind:function(){var e=0!=getCookie("swiperActiveIndex")?getCookie("swiperActiveIndex"):0;e=e?e:0,e=parseInt(e),setCookie("swiperActiveIndex",0),barwidth="50%",tSpeed=0;var t=new Swiper("#nav",{slidesPerView:2,freeMode:!0,initialSlide:e,on:{init:function(){for(navSlideWidth=this.slides.eq(0).css("width"),bar=this.$el.find(".bar"),bar.css("width",navSlideWidth),bar.transition(tSpeed),navSum=this.slides[this.slides.length-1].offsetLeft,clientWidth=parseInt(this.$wrapperEl.css("width")),navWidth=0,i=0;i<this.slides.length;i++)navWidth+=parseInt(this.slides.eq(i).css("width"));topBar=this.$el.parents("body").find("#top"),activeIndex=this.activeIndex,activeSlidePosition=this.slides[activeIndex].offsetLeft,bar.transition(tSpeed),bar.transform("translateX("+activeSlidePosition+"px)")}}}),n=new Swiper("#page",{watchSlidesProgress:!0,resistanceRatio:0,initialSlide:e,on:{touchMove:function(){for(progress=this.progress,0==Math.abs(progress)?(activeIndex=this.activeIndex,activeSlidePosition=t.slides[activeIndex].offsetLeft,bar.transition(tSpeed),bar.transform("translateX("+activeSlidePosition+"px)")):(bar.transition(0),bar.transform("translateX("+navSum*progress+"px)")),investmentDetails.bottomTransform(this.translate),i=0;i<this.slides.length;i++)slideProgress=this.slides[i].progress,Math.abs(slideProgress)<1&&(r=Math.floor(49*(1-Math.pow(Math.abs(slideProgress),2))+173),g=Math.floor(-27*(1-Math.pow(Math.abs(slideProgress),2))+173),b=Math.floor(-135*(1-Math.pow(Math.abs(slideProgress),2))+173),t.slides.eq(i).find("span").css("color","rgba("+r+","+g+","+b+",1)"))},transitionStart:function(){activeIndex=this.activeIndex,activeSlidePosition=t.slides[activeIndex].offsetLeft,bar.transition(tSpeed),bar.transform("translateX("+activeSlidePosition+"px)"),t.slides.eq(activeIndex).find("span").transition(tSpeed),t.slides.eq(activeIndex).find("span").css("color","rgba(222,146,38,1)"),activeIndex>0&&(t.slides.eq(activeIndex-1).find("span").transition(tSpeed),t.slides.eq(activeIndex-1).find("span").css("color","rgba(173,173,173,1)")),activeIndex<this.slides.length&&(t.slides.eq(activeIndex+1).find("span").transition(tSpeed),t.slides.eq(activeIndex+1).find("span").css("color","rgba(173,173,173,1)")),navActiveSlideLeft=t.slides[activeIndex].offsetLeft,t.setTransition(tSpeed),t.setTranslate(navActiveSlideLeft<(clientWidth-parseInt(navSlideWidth))/2?0:navActiveSlideLeft>navWidth-(parseInt(navSlideWidth)+clientWidth)/2?clientWidth-navWidth:(clientWidth-parseInt(navSlideWidth))/2-navActiveSlideLeft),investmentDetails.bottomTransform(this.translate)},transitionEnd:function(e){}}});tSpeed=300,t.on("click",function(e){clickIndex=this.clickedIndex,clickSlide=this.slides.eq(clickIndex),n.slideTo(clickIndex,0)})}};