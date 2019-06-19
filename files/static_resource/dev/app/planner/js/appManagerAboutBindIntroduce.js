import {Tools, G, Dialog} from "COMMON/js/common";

var appManagerAboutBind={
	init:function(titleStr){
		var self=this;
		self.enventBind();
		self.shareGetData();
		
		Tools.setTitle(titleStr);	
		
		
	},
	shareBtn:function(){
		var self=this;
		var host=window.location.host;
		
		var options={}
		options.shareTitle="星火金服介绍";
		options.shareContent="加入星火金服，享理财师专属服务，开启财富之路";
		var defaultHeadPortrait="https://"+host+'/h5static/financialPlanner/images/captainInvite/defaultHeadPortrait.jpg';
		
		options.shareUrl="https://"+host+"/h5static/app/planner/appManagerIntroduceShare.html?storeCode="+self.storeCode;
		options.shareImageUrl=/*self.accountimg?self.accountimg:*/defaultHeadPortrait;
		var shareOptions={"titleTranslate":"0","titleBack": "1","titleClose": "0","titleShare":options};
		Tools.shareHeaderBtn(shareOptions);
	},
	shareGetData:function(){
		var self=this;
		Tools.getUserInfo().then(function (data) {
			return Tools.AJAX({
		        url: G.base + "/promote/getPromoteShare.json",
			    type: 'post',
		        async: true,
		        cache:false,
		        dataType: 'JSON',
		        data:{
		            token:data.token
		        }
	    	})
		}).then(function (res) {
		    if(res.code==1){
		    	var ajaxReData=res.data;
		       	self.storeCode=ajaxReData.storeCode;
		       	self.accountimg=ajaxReData.accountimg;
		    	self.nickName=ajaxReData.nickName;
				self.realName=ajaxReData.realName;
		      	self.shareBtn();
		    }
		    
		});
	},
	enventBind:function(){		//swiper绑定事件
		var swiper = new Swiper('.swiper-container', {
			direction: 'vertical',
			resistanceRatio: 0,
			loop:false,
			lazyLoadingInPrevNext:true,
			on: {
				init: function(){  
					var swiperObj=this;
					var activeIndexNum=swiperObj.activeIndex;
					var activeDocument=swiperObj.slides[activeIndexNum];
					var addAnimObj=activeDocument.querySelectorAll(".js_add_anim");
					var addAnimObjLen=addAnimObj.length;
					for(var i=0; i<addAnimObjLen;i++){
						addAnimObj[i].classList.add("anim");
					}
					
			    },     
				slideChange: function() {
					var swiperObj=this;
					var activeIndexNum=swiperObj.activeIndex;
					var activeDocument=swiperObj.slides[activeIndexNum];
					var addAnimObj=activeDocument.querySelectorAll(".js_add_anim");
					var addAnimObjLen=addAnimObj.length;
					
					/*remove anim*/
					var animObj=document.querySelectorAll(".anim");
					for(var i=0; i<animObj.length; i++){
						animObj[i].classList.remove("anim");
					}
					/*remove anim:end*/
					
					for(var i=0; i<addAnimObjLen;i++){
						addAnimObj[i].classList.add("anim");
					}
				}
			}
			
		});
	}
}

window.onload=function(){
	appManagerAboutBind.init("星火介绍");
}
//兼容
;(function(){
	var agent = navigator.userAgent.toLowerCase();
	var iLastTouch = null; //缓存上一次tap的时间
	if (agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0) //检测是否是ios
	{
		document.body.addEventListener('touchend', function(event){
			var iNow = new Date().getTime(); 
			iLastTouch = iLastTouch || iNow + 1 /** 第一次时将iLastTouch设为当前时间+1 */ ;
			var delta = iNow - iLastTouch;
			if (delta < 500 && delta > 0)
			{
				event.preventDefault();
				return false;
			}
			iLastTouch = iNow; 
		}, false);
	}
 
})();