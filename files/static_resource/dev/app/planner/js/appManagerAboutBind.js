var appManagerAboutBind={
	init:function(){
		var self=this;
		self.enventBind();
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
	appManagerAboutBind.init();
}


