import {Tools, G, Dialog} from "COMMON/js/common";

var appManagerAboutBind={
	init:function(){
		var self=this;
		self.enventBind();
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
	appManagerAboutBind.init();
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