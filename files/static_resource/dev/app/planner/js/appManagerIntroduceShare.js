import {Tools, G, Dialog} from "COMMON/js/common";

var appManagerAboutBind={
	init:function(titleStr){
		var self=this;
		self.btnUrl();
		self.enventBind();
		Tools.setTitle(titleStr);	
		
		
	},
	btnUrl:function(){
		var self=this;
		var params = Tools.queryUrl(location.href);
		var storeCode=params.storeCode;
		self.storeCode=storeCode;
		var host="https://"+window.location.host;
		var btnUrl=host+"/h5static/app/planner/shareShop.html?storeCode="+self.storeCode;
		document.querySelector(".js_btn_register").setAttribute("href",btnUrl);
	},
	enventBind:function(){		//swiper绑定事件
		var swiper = new Swiper('.swiper-container', {
			direction: 'vertical',
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
	
	appManagerAboutBind.init("");
	
	//兼容 Safari
	//document.body.classList.add("safari");
	var userAgent = navigator.userAgent;
	if (userAgent.indexOf("Safari") > -1) {
		document.body.classList.add("safari");
    }
	
	 
}