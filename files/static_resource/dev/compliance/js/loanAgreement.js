var loanAgreement={
	productId:header.getQueryString("productId")?header.getQueryString("productId"):"",
	token:header.getQueryString("token")?header.getQueryString("token"):'',
	terminal:header.getQueryString("token")?"APP":"WAP",
	protocolType:header.getQueryString("protocolType")?header.getQueryString("protocolType"):3,
	init:function(dataOption){
		this.urlValueJson();
		this.appendBox=dataOption.appendBox;
		this.wapBindClick();
		this.agreementLoad(3); //出错协议
		/*this.urlProcessing("checkActive");*/
	},
	aprotocolTypeNum:0,
	aprotocolTypeArr:[15,16,8,18,1,9,3],
	dataProcessing:function(data){
		
	},
	agreementLoad:function(protocolTypeCode){
		var self=this;
		var protocolTypeNum=self.aprotocolTypeArr[self.aprotocolTypeNum];
		//https://www.creditease.cn/s1/prototolapi/prototol/300002484040412?version=20188312230&protocolType=15&_=1536650238080
		
		self.bodyScrollUnBind();
		$.ajax({
	        url: '/prototolapi/prototol/'+self.productId,
	        type: 'get',
	        async: true,
	        cache:false,
	        data:{
	        	protocolType:protocolTypeNum,
	        	terminal:self.terminal,
	        	token:self.token
	        },
	        dataType: 'JSON',
	        success: function (result) {
	            if (result.code== "1"){
	            	self.ajaxCallBackSucc(result);
	               /*var appendHtml=self.borrowDetailsHtml(result.data);
	               self.boxObj.append(appendHtml);*/
	            }else{
	            	/*loan.msgDialog(result.msg);*/
	            }
	        },
	        error: function(e) {
	        /*	loan.loadingHidden();
	        	loan.msgDialog(e);*/
	        }
	    })
	},
	ajaxCallBackSucc:function(result){
		var self=this;
		var protocolTypeNum=self.aprotocolTypeArr[self.aprotocolTypeNum];
		if(result.data){
    		var agreementDiv=document.createElement("div");
    		agreementDiv.className="agreement"+protocolTypeNum;
    		var agreementStr="";
    		if(result.data.jiekuanContent){
    			agreementStr=result.data.jiekuanContent;
    		}else if(result.data.zhaiquanContent){
    			agreementStr=result.data.zhaiquanContent;
    		}else if(result.data.protocolContent){
    			agreementStr=result.data.protocolContent;
    		}
    		
    		agreementDiv.innerHTML=agreementStr;
    		self.appendBox.appendChild(agreementDiv);
    		self.aprotocolTypeNum=self.aprotocolTypeNum+1;
    		
    		if(self.aprotocolTypeNum==self.aprotocolTypeArr.length){
           		self.bottomLoadHide();
            }else{
            	self.bodyScrollBind();
            }
	            		
	    }
	},
	wapBindClick:function(){
		var self=this;
		var isWap=header.getQueryString("type");
		if(isWap=="wap"){
			var btnObj = document.querySelector(".js_btnOK");
			btnObj.setAttribute("href","javascript:void(0);");
			btnObj.addEventListener("click",function(){
				self.btnClickFn();
			},false);
		}
	},
	/*  月盈宝
		出借金额	amount
		月回款日期	reDay
		月回款金额	eachMonthRe

		零投宝
		出借金额	money2
	*/
	replaceArr:["amount","reDay","eachMonthRe","money2","earning"],
	urlReplaceJson:[],
	urlValueJson:function(){
		var self=this;
		for(var i=0; i<self.replaceArr.length; i++){
			self.urlReplaceJson.push({"key":self.replaceArr[i],"val":header.getQueryString(self.replaceArr[i])});
			if(self.replaceArr[i]=="amount"){
				self.urlReplaceJson.push({"key":"ownedamount","val":header.getQueryString(self.replaceArr[i])});
			}
		}
	},
	replaceUrl:function(currentURL){
		var self=this;
		for(var i=0; i<self.urlReplaceJson.length; i++){
			var arg=self.urlReplaceJson[i].key;
			var val=self.urlReplaceJson[i].val;
			if(val!=null && val!=undefined){
				var pattern = '[&|?]'+arg+'=([^&]*)';
			    var replaceText = arg+'='+val;
			    currentURL=currentURL.match(pattern) ? currentURL.replace(eval('/('+ arg+'=)([^&]*)/gi'), replaceText) : (currentURL.match('[\?]') ? currentURL+'&'+replaceText : currentURL+'?'+replaceText);
			}
		}
		return currentURL;
	},
	urlProcessing:function(key){
		var historyUrl=document.referrer;
		var reg = new RegExp("(^|&)"+key+"=([^&]*)");
		historyUrl=historyUrl.replace(reg,"");
		this.historyUrl=historyUrl;
	},
	btnClickFn:function(){
		var historyUrl=document.referrer;
		historyUrl=this.replaceUrl(historyUrl);
		var callBackUrl=historyUrl+"&checkActive=true";
		
		location.href=callBackUrl;
		
	},
	bottomLoadShow:function(){
		$(".loadingBox").removeClass("hide");
		$(".loadingBox").addClass("show");
	},
	bottomLoadHide:function(){
		$(".loadingBox").removeClass("show");
		$(".loadingBox").addClass("hide");
	},
	bodyScroll:function(){
		var self=this;
		loanAgreement.bottomLoadShow();
		var scrollTop =document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop; //滚动条高度
		var htmlHeight=document.documentElement.scrollHeight;		//页面总高度
		var clientHeight=document.documentElement.clientHeight; //页面可视高度
		if(scrollTop+clientHeight>htmlHeight-150){  //滚动到底部
			loanAgreement.agreementLoad(self.pageNum);
		}
	},
	bodyScrollBind:function(){
		var self=this;
		document.addEventListener('scroll',bodyScroll,false);
	},
	bodyScrollUnBind:function(){
		var self=this;
		document.removeEventListener('scroll',bodyScroll,false);
	}
	
}

function bodyScroll(){
	loanAgreement.bodyScroll();
}
window.onload=function(){
	var appendBox=document.querySelector(".argeementMain");
	loanAgreement.init({
		'appendBox':appendBox
	});  
	//判断是否为wap页面，显示头部
}
