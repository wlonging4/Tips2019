/*share("111");*/
/*test*/
/*setWebTitle("titleAAAA");
setAppBtn();*/
/*var appTestOptions={"shareTitle": "111111","shareContent": "2222222","shareImageUrl":'333333',"shareUrl":"/h5static/financialPlanner/personalTailor/customRules.html"};
shareAppBtnOption(appTestOptions);*/
/*setWebTitle("titleBBB");*/
/*test:end*/
var investmentDetails={
	appType:investment.getQueryString("appType"), //appType=finance 理财师端；appType=lend 出借人端
	domBody:document.querySelector("body"),
	itemId:investment.getQueryString("id")?investment.getQueryString("id"):"",
	managerId:"",/*"100162082699"*/
	tokenComparisonBool:true,	//需要比较过token
	/*容错：存储token不同时，调用*/
	tokenComparison:function(){
		var self=this;
		
		var tokenCookie=getCookie("token");
		var urlCookie=investment.getQueryString("token");
		self.tokenComparisonBool=false; 
		if(tokenCookie!=urlCookie){
			getUserInfo(getUerCallBack);
		}else{
			investmentDetails.init()
		}
		  
	},
	init:function(){
		var self=this;
		var showClass=self.appType;
		this.domBody.classList.add(showClass);
		if(self.tokenComparisonBool){
			self.tokenComparison();
			return;
		}
		/*app理财师*/
		self.token=getCookie("token");
		self.userId=getCookie("userId");
		self.managerId=getCookie("managerId")!="undefined"?getCookie("managerId"):"";
		self.introduceConData["managerId"]=self.managerId;
		self.materialLinkData["managerId"]=self.managerId;
		/*app理财师*/
		/*alert(self.appType=="finance")*/
		if(self.appType=="finance"){
			self.financeDetails();
		}else{
			self.lendDetails();
		}
	},
	financeDetails:function(){
		var self=this;			
		self.introduceCon();		//项目介绍
		self.materialLink();		//资料列表
		self.swiperBind();
	},
	lendDetails:function(){
		var self=this;
		self.introduceCon();
	},
	//分享
	shareDetails:function(){
		var self=this;
		self.introduceCon();
		
	},
	shareConHtml:function(data){
		data=data.managerInfo;
		var avatar=data.avatar?data.avatar:"../../financialPlanner/images/captainInvite/defaultHeadPortrait.png";//头像
		var nikeName=data.nickName?data.nickName:data.managerName;  //昵称
		var storeCode=data.storeCode?data.storeCode:"";
		var shareArr=[
				'<a href="/mobile/activityPage/shareShop/'+storeCode+'?from=singlemessage&isappinstalled=0">',
				'<div class="shareHeadImg">',
				'	<img src="'+avatar+'" onload="investmentDetails.loadImage(this);"/>',
				'</div>',
				'<div class="shareContent">',
				'	<div class="share">',
				'		<div class="topWord">星火理财师：'+nikeName+'</div>',
				'		<div class="bottomWord">为您提供贴心专业的理财服务</div>',
				'	</div>',
				'</div>',
				'<div class="shareBtn">',
				'	<span>打开</span>',
				'</div>',
				'</a>'
		
		];
		
		return shareArr.join("");
	},
	loadImage:function(thisObj){
		thisObj.classList.add("show");
	},
	/*项目简介*/
	introduceAjaxUrl:"/webapi/goodhopesubject/getById",
	introduceConData:{"id":investment.getQueryString("id"),"token":investment.getQueryString("token"),"managerId":investment.getQueryString("managerId")},
	introduceCon:function(){
		var self=this;
		//详情内容
		self.ajaxData({"ajaxUrl":self.introduceAjaxUrl,"data":self.introduceConData}).then(function(data){
		   self.introduceConSucc(data);
		},function(){
	      self.introduceConSucc(data);
	   });
	},
	introduceConSucc:function(data){
		var self=this;
     	if(data.code=="1"){
	   		var conStr=data.data.content;  //详情内容
	   		var appTit=data.data.name;
	   		setWebTitle(appTit);
	   		self.htmlTitle(appTit);
	   		self.introduceConHtml(conStr);
	   		
	   		/*支持电话 */
	   		var managerInfo=data.data.managerInfo;
	   		var supportMobileNum=managerInfo.supportMobile;
	   		var supportMobile="tel:"+supportMobileNum;
	   		var managerMobile="tel:"+managerInfo.managerMobile;
	   		document.querySelector(".js_supportMobileNum").innerHTML= supportMobileNum;
	   		document.querySelector(".js_supportMobile").setAttribute("href",supportMobile);
	   		document.querySelector(".js_managerMobile").setAttribute("href",managerMobile);
	   		/**/
	   		
	   		/*app分享参数*/
	   		var shareData=data.data;
	   		var shareTitle=shareData.name?shareData.name:"";	/*title*/
	   		var shareContent=shareData.subdesc?shareData.subdesc:"";	/*简介*/
	   		var shareImageUrl=shareData.subimage?shareData.subimage:"";	/*图片*/
	   		self.managerId=shareData.managerInfo.managerId;
	   		var shareUrl="/h5static/financialPlanner/investment/shareInvestmentDetails.html?appType="+self.itemId+"&id="+self.itemId+"&managerId="+self.managerId;	/*url*/

	   		var appTestOptions={"shareTitle": shareTitle,"shareContent":shareContent,"shareImageUrl":shareImageUrl,"shareUrl":shareUrl};
			shareAppBtnOption(appTestOptions);
			/*app分享参数：end*/
			
			
	   		if(document.querySelectorAll(".js_shareBox").length!=0){
				document.querySelector(".js_shareBox").innerHTML=self.shareConHtml(data.data);
			}
	   }
	   
		
		
		
		
	},
	htmlTitle:function(htmlTit){
		var self=this;
		document.querySelector("title").innerHTML=htmlTit;
	},
	introduceConHtml:function(conStr){
		var self=this;
		document.querySelector(".js_backgroundConfigurationCon").innerHTML=conStr;
	},
	
	/*项目简介:end*/
	/*相关资料*/
	materialLinkUrl:"/webapi/goodhopesubject/getSubjectDataList/"+investment.getQueryString("id"),
	materialLinkData:{"id":investment.getQueryString("id"),"token":investment.getQueryString("token"),"managerId":investment.getQueryString("managerId")},
	materialLink:function(){
		var self=this;
		//详情内容
		self.ajaxData({"ajaxUrl":self.materialLinkUrl,"data":self.materialLinkData,"type":"get"}).then(function(data){
		   self.materialLinkSucc(data);
		},function(data){
			/*test 删*/
	     /*	var data={"msg":"","data":[{"id":10,"fileName":"项目文件"},{"id":11,"fileName":"qqqqqq"}],"code":"1"}*/
	     	/*test 删*/
	      	self.materialLinkSucc(data);
	     
	   });
	},
	materialLinkSucc:function(data){
		var self=this;
     	if(data.code=="1"){
     		var data=data.data;
	   		self.materialLinkHtml(data);
	   }
	},
	emptyShow:function(){
		
		document.querySelector(".js_empty").style.display="block";
	},
	materialLinkHtml:function(data){
		var self=this;
		var items=[];
		/*data=[]*/
		if(data.length<=0){
			self.emptyShow();
		}
		for(var i=0; i<data.length; i++){
			var item=data[i];
			var htmlItem=[
				'<div class="item">',
				'	<a href="./materialDetails.html?id='+item.id+'">',
				'		<div class="itemCon">',
				'			<div class="word">'+item.fileName+'</div>',
				'			<div class="arrowIcon">&nbsp;</div>',
				'		</div>',
				'	</a>',
				'</div>'
			];
			items.push(htmlItem.join(""));
		}
		
		document.querySelector(".js_materialLink").innerHTML=items.join("");
	},
	/*相关资料:end*/
	ajaxData:function(options){
		var self=this;

		return $.ajax({
	        url: options.ajaxUrl,
	        type: options.type?options.type:'POST',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	        timeout : 20000,		/*超时设置，test:删*/
	        data:options.data/*,
	        success: function (result) {
	        	
	            if (result.code== "1"){
	            	
	              
	            }else{
	            	
	            }
	        },
	        error: function(e) {
	        	
	        }*/
	    })
	},
	bottomTransform:function(leftNum){
		var self=this;
		self.bottomObj=document.querySelector(".js_financePhone");
		self.bottomObj.style.left=leftNum+"px";
	},
	swiperBind:function(){
		var swiperActiveIndex= getCookie("swiperActiveIndex")!=0?getCookie("swiperActiveIndex"):0; 
		swiperActiveIndex=swiperActiveIndex?swiperActiveIndex:0;	
		swiperActiveIndex=parseInt(swiperActiveIndex);
		setCookie("swiperActiveIndex",0);
		 //暂时设计每个slide大小需要一致
		  barwidth = "50%" //导航粉色条的长度px
		  tSpeed = 0 //切换速度300ms
		  var navSwiper = new Swiper('#nav', {
		  	slidesPerView: 2,
		  	freeMode: true,
		  	initialSlide:swiperActiveIndex,
		  	on: {
		  		init: function() {
		  			navSlideWidth = this.slides.eq(0).css('width'); //导航字数需要统一,每个导航宽度一致
		  			bar = this.$el.find('.bar')
		  			bar.css('width', navSlideWidth)
		  			bar.transition(tSpeed)
		  			navSum = this.slides[this.slides.length - 1].offsetLeft //最后一个slide的位置
		
		  			clientWidth = parseInt(this.$wrapperEl.css('width')) //Nav的可视宽度
		  			navWidth = 0
		  			for (i = 0; i < this.slides.length; i++) {
		  				navWidth += parseInt(this.slides.eq(i).css('width'))
		  			}
		
		  			topBar = this.$el.parents('body').find('#top') //页头
		  			
		  			/*兼容 差几像素*/
	  				activeIndex = this.activeIndex
		  			activeSlidePosition = this.slides[activeIndex].offsetLeft
		  			//释放时导航粉色条移动过渡
		  			bar.transition(tSpeed)
		  			bar.transform('translateX(' + activeSlidePosition + 'px)');
		  			/*兼容 差几像素：end*/
		  			
		
		  		},
		
		  	},
		  });
		
		  var pageSwiper = new Swiper('#page', {
		  	watchSlidesProgress: true,
		  	resistanceRatio: 0,
		  	initialSlide:swiperActiveIndex,
		  	on: {
		  		touchMove: function() {
		  			progress = this.progress
		  			
		  			/*兼容*/
		  			if(Math.abs(progress)==0){
		  				activeIndex = this.activeIndex
			  			activeSlidePosition = navSwiper.slides[activeIndex].offsetLeft
			  			//释放时导航粉色条移动过渡
			  			bar.transition(tSpeed)
			  			bar.transform('translateX(' + activeSlidePosition + 'px)');
		  			}else{
		  				bar.transition(0);
		  				bar.transform('translateX(' + navSum * progress + 'px)')
		  			}
		  			investmentDetails.bottomTransform(this.translate);
		  			/*兼容：end*/
		  			//粉色255,72,145灰色51,51,51
		  			for (i = 0; i < this.slides.length; i++) {
		  				slideProgress = this.slides[i].progress
		  				if (Math.abs(slideProgress) < 1) {
		  					r = Math.floor((222 - 173) * (1 - Math.pow(Math.abs(slideProgress), 2)) + 173)
		  					g = Math.floor((146 - 173) * (1 - Math.pow(Math.abs(slideProgress), 2)) + 173)
		  					b = Math.floor((38 - 173) * (1 - Math.pow(Math.abs(slideProgress), 2)) + 173)
		  					navSwiper.slides.eq(i).find('span').css('color', 'rgba(' + r + ',' + g + ',' + b + ',1)')
		  				}
		  			}
		  		},
		  		transitionStart: function() {
		  			activeIndex = this.activeIndex
		  			activeSlidePosition = navSwiper.slides[activeIndex].offsetLeft
		  			//释放时导航粉色条移动过渡
		  			bar.transition(tSpeed)
		  			bar.transform('translateX(' + activeSlidePosition + 'px)')
		  			//释放时文字变色过渡
		  			navSwiper.slides.eq(activeIndex).find('span').transition(tSpeed)
		  			navSwiper.slides.eq(activeIndex).find('span').css('color', 'rgba(222,146,38,1)')
		  			if (activeIndex > 0) {
		  				navSwiper.slides.eq(activeIndex - 1).find('span').transition(tSpeed)
		  				navSwiper.slides.eq(activeIndex - 1).find('span').css('color', 'rgba(173,173,173,1)')
		  			}
		  			if (activeIndex < this.slides.length) {
		  				navSwiper.slides.eq(activeIndex + 1).find('span').transition(tSpeed)
		  				navSwiper.slides.eq(activeIndex + 1).find('span').css('color', 'rgba(173,173,173,1)')
		  			}
		  			//导航居中
		  			navActiveSlideLeft = navSwiper.slides[activeIndex].offsetLeft //activeSlide距左边的距离
		
		  			navSwiper.setTransition(tSpeed)
		  			if (navActiveSlideLeft < (clientWidth - parseInt(navSlideWidth)) / 2) {
		  				navSwiper.setTranslate(0)
		  			} else if (navActiveSlideLeft > navWidth - (parseInt(navSlideWidth) + clientWidth) / 2) {
		  				navSwiper.setTranslate(clientWidth - navWidth)
		  			} else {
		  				navSwiper.setTranslate((clientWidth - parseInt(navSlideWidth)) / 2 - navActiveSlideLeft)
		  			}
		  			investmentDetails.bottomTransform(this.translate);
		
		  		},
		  		transitionEnd: function(swiper){
		  			/*if(this.activeIndex==0){//ios兼容 
		  				$("#page").find(".swiper-wrapper").attr("style","");
		  			}*/
			  	},
		  	}
		  });
		  //跳回后
			tSpeed = 300 //切换速度300ms
		  /*navSwiper.$el.on('touchstart', function(e) {
		  	e.preventDefault() //去掉按压阴影
		  })*/
		  navSwiper.on('click', function(e) {
		
		  	clickIndex = this.clickedIndex
		  	clickSlide = this.slides.eq(clickIndex)
		  	pageSwiper.slideTo(clickIndex, 0);
		  	/*this.slides.find('span').css('color', 'rgba(173,173,173,1)');
		  	clickSlide.find('span').css('color', 'rgba(222,146,38,1)');*/
		  });
		  /*从资料详情页 回显资料页*/
		
		
		
		 /*从资料详情页 回显资料页：end*/
	}
}

function getUerCallBack(){
	/*alert("callBack");*/
	investmentDetails.init();
}
