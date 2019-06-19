/*share("111");*/
/*test*/
/*var appTestOptions={"shareTitle": "111111","shareContent": "2222222","shareImageUrl":'333333',"shareUrl":"/h5static/financialPlanner/personalTailor/customRules.html"};
shareAppBtnOption(appTestOptions);*/
/*test:end*/
var materialDetails={
	itemId:investment.getQueryString("id"),
	appType:investment.getQueryString("appType"), //appType=finance 理财师端；appType=lend 出借人端
	init:function(){
		var self=this;
		setCookie("swiperActiveIndex",1);//项目详情页  tabs回显
		self.token=getCookie("token");
		self.userId=getCookie("userId");
		self.managerId=getCookie("managerId")!="undefined"?getCookie("managerId"):"";
		self.introduceConData["managerId"]=self.managerId;

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
		var nikeName=data.nickName?data.nickName:data.managerName; //昵称
		var storeCode=data.storeCode?data.storeCode:"";
		var shareArr=[
				'<a href="/mobile/activityPage/shareShop/'+storeCode+'?from=singlemessage&isappinstalled=0">',
				'<div class="shareHeadImg">',
				'	<img src="'+avatar+'" onload="materialDetails.loadImage(this);"/>',
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
	introduceAjaxUrl:"/webapi/goodhopesubject/getSubjectDataInfo",
	introduceConData:{"id":investment.getQueryString("id"),"managerId":investment.getQueryString("managerId"),"token":investment.getQueryString("token")},
	introduceCon:function(conStr){
		var self=this;
		//详情内容
		self.ajaxData({"ajaxUrl":self.introduceAjaxUrl,"data":self.introduceConData}).then(function(data){
		  self.introduceConSucc(data);
		},function(){
	      /*test 删*/
	     	/*var data={"msg":"","data":{"id":10,"subjectId":149,"fileName":"项目文件","fileType":1,"fileTypeStr":"相关文件","sort":1,"isExtUrl":false,"url":null,"content":"<p>水电费水电费戊二醛无热</p>","createTime":1543376089000,"updateTime":1543376089000},"code":"1"}
 
	     	if(data.code=="1"){
		   		var conStr=data.data.content;  //详情内容
		   		var appTit=data.data.fileName;
		   		setWebTitle(appTit);
		   		self.htmlTitle(appTit);
		   		self.introduceConHtml(conStr);
		   }*/
	     /*test 删*/
	   });
	},
	introduceConSucc:function(data){
		var self=this;
		 if(data.code=="1"){
	   		var conStr=data.data.content;  //详情内容
	   		var appTit=data.data.fileName;
	   		setWebTitle(appTit);
	   		self.htmlTitle(appTit);
	   		self.introduceConHtml(conStr);
	   		
	   		/*app分享参数*/
	   		var shareData=data.data;
	   		var shareTitle=shareData.subtitle+" "+shareData.fileName;	/*title*/
	   		var shareContent=shareData.subdesc?shareData.subdesc:"";	/*简介*/
	   		var shareImageUrl=shareData.subimage?shareData.subimage:"";	/*图片*/
	   		self.managerId=shareData.managerInfo.managerId;
	   		var shareUrl="/h5static/financialPlanner/investment/shareMaterialDetails.html?id="+self.itemId+"&managerId="+self.managerId;	/*url*/


			/*var appTestOptions={"shareTitle": "111111","shareContent": "2222222","shareImageUrl":'333333',"shareUrl":"/h5static/financialPlanner/personalTailor/customRules.html"};
			shareAppBtnOption(appTestOptions);*/
	   		var appTestOptions={"shareTitle": shareTitle,"shareContent":shareContent,"shareImageUrl":shareImageUrl,"shareUrl":shareUrl};
			shareAppBtnOption(appTestOptions);
			/*app分享参数：end*/
	   		
	   		if(document.querySelectorAll(".js_watermarkBox").length>0){
	   			document.querySelector(".js_watermarkBox").innerHTML=self.watermarkBoxHtml(data.data);
	   			self.watermarkBoxClone();
	   		}
	   		
	   		
	   		if(document.querySelectorAll(".js_shareBox").length!=0){
				document.querySelector(".js_shareBox").innerHTML=self.shareConHtml(data.data);
			}
	   		
	   }
	},
	watermarkBoxHtml:function(data){
		var data=data.managerInfo;
		var waterMarkArr=[
			'<div class="watermark">',
			'	<div class="watermarkCon"> ',
			'		<div class="watermarkName">'+data.managerName+'</div>',
			'		<div class="watermarkPhone">'+data.managerMobile+'</div>',
			'	</div>',
			'</div>'
		]
		
		return waterMarkArr.join("");
	},
	htmlTitle:function(htmlTit){
		var self=this;
		document.querySelector("title").innerHTML=htmlTit;
	},
	introduceConHtml:function(conStr){
		var self=this;
		document.querySelector(".js_materialCon").innerHTML=conStr;
	},
	emptyShow:function(){
		
		document.querySelector(".js_empty").style.display="block";
	},
	watermarkBoxClone:function(){
		if(document.querySelectorAll(".js_watermarkBox").length>0){
			var cloneNum=60;
			var cloneHtml=document.querySelector(".watermark").outerHTML;
			var cloneHtmlAll="";
			for(i=0; i<cloneNum; i++){
				cloneHtmlAll+=cloneHtml;
			}
			document.querySelector(".js_watermarkBox").innerHTML=cloneHtmlAll;
			
		}	
	},
	/*相关资料:end*/
	ajaxData:function(options){
		var self=this;

		return $.ajax({
	        url: options.ajaxUrl,
	        type: 'get',
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
	}
}
