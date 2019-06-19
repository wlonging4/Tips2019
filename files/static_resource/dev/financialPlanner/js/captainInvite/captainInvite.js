var Dialog=function(options){
	this.dom=options.dialogBox;
	this.domClassObj=options.dialogBox.classList.toString();
	this.statuClass=options.statuClass;
	this.init();
};
Dialog.prototype.init=function(){
	this.bindClose();
}
Dialog.prototype.bindClose=function(){
	var self=this;
	var closebtn=self.dom.querySelector(".close");
	closebtn.addEventListener("click",function(){
			self.hide();
	})
	
}
Dialog.prototype.show=function(){
	this.setStatu();
	this.dom.classList.add("show");
}
Dialog.prototype.hide=function(){
	this.dom.classList.remove("show");
}
Dialog.prototype.setStatu=function(){
	var self=this;
	self.dom.classList.remove("statu1");
	self.dom.classList.remove("statu2");
	self.dom.classList.remove("statu3");
	self.dom.classList.remove("statu4");
	self.dom.classList.add(self.statuClass);
}
/*loading显示隐藏*/
var Loading={
	init:function(){
		this.dom=document.createElement("div");
		this.dom.className="loadingDiv hidden";
		document.body.appendChild(this.dom);
	},
	show:function(){
		this.dom.classList.add("show");
		this.dom.classList.remove("hidden");
	},
	hide:function(){
		this.dom.classList.add("hidden");
		this.dom.classList.remove("show");
	}
}
/*loading:end*/

/*弱提示*/
var Tips={
	init:function(){
		this.dom=document.createElement("div");		//最外层遮罩
		this.dom.className="tipsOvrly";			
		this.ovrlyWordBox=document.createElement("div");	//消息框
		this.ovrlyWordBox.className="ovrlyWordBox";
	    this.ovrlyWord=document.createElement("div");	//显示内容，
	    this.ovrlyWord.className="ovrlyWord";
	    
	    this.ovrlyWordBox.appendChild(this.ovrlyWord);
		this.dom.appendChild(this.ovrlyWordBox);
		document.body.appendChild(this.dom);
	},
	show:function(msgString){
		var self=this;
		if(!msgString){
			return;
		}
		this.setContent(msgString);
		
		self.dom.classList.add("tipsOvrlyShow");
		setTimeout(function(){
			self.hide();
		},1900);
	},
	hide:function(){
		this.dom.classList.remove("tipsOvrlyShow");
	},
	setContent:function(msgString){
		this.ovrlyWord.innerHTML=msgString;
	}
}
/*弱提示：end*/

/*验证*/
var validationStrategies={
	isNoEmpty:function(element,errMsg,value){
		if(value===""){
			Tips.show(errMsg)
			return false;
		}
		return true;
	},
	isPhoneNum:function(element,errMsg,value){
		  var reg = /^[1][3,4,5,7,8,9][0-9]{9}|16[6][0-9]{8}$/;
          if(!reg.test(value)){
            Tips.show(errMsg);
            return false;
          }
          return true;
	}
}

function InputValidators(){
	this.validators=[];
	this.strategies={};
}

InputValidators.prototype.importStategies=function(strategies){
	for(var strategyName in strategies){
		this.addValidationStrategy(strategyName, strategies[strategyName]);
	}
}
InputValidators.prototype.addValidationStrategy=function(name,strategy){
	this.strategies[name]=strategy;
}

InputValidators.prototype.addValidator=function(rule,element,errMsg,value){
	var self=this;
	
	this.validators.push(function(){
		var strategy=rule;
		var params=[];
		params.unshift(value);
		params.unshift(errMsg);
		params.unshift(element);
		return self.strategies[strategy].apply(self,params);
	})
}

InputValidators.prototype.check=function(){
	var results=[];
	for(var i=0,validator; validator=this.validators[i++];){
		var result=validator();
		if(!result){
			results.push(false);
		}
	}
	if(results.length==0){
		return true;
	}
}

/*验证:end*/
	



function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
       return callback(WebViewJavascriptBridge)
    } else {
        document.addEventListener(
            'WebViewJavascriptBridgeReady'
            , function() {
              return  callback(WebViewJavascriptBridge)
            },
            false
        );
    }

    if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
}


var onloadNum=getCookie('onloadNum');
var appUserId=getCookie('appUserId'); 
var appPhoneNumber=getCookie('appPhoneNumber');
var token=getCookie('token');
var realnameStr=getCookie("realnameStr");
var nicknameStr=getCookie("nicknameStr")?getCookie("nicknameStr"):"";
function getUserInfo(callBackFn){
	var dataJSON="";
	setupWebViewJavascriptBridge(function(bridge) {
		 bridge.registerHandler('xhUserInfoToWeb', function(data, responseCallback) {
	            var dataString=data;
	            dataJSON=JSON.parse(dataString); 
	            getUserInfoData=dataJSON;
	            appUserId=dataJSON.userid?dataJSON.userid:dataJSON.userId;
	         
	            appPhoneNumber=dataJSON.phoneNum?dataJSON.phoneNum:"";
	            onloadNum=0;
	            token=dataJSON.token?dataJSON.token:""
	            
	            setCookie('appUserId', appUserId);   
	            setCookie('appPhoneNumber', appPhoneNumber); 
	            setCookie('token', token); 
	            
	            setCookie('onloadNum', onloadNum);  
	            
	            callBackFn();
	            
	           	return dataJSON;
	           
	           
	     })	
	})
	
	 
}


function setWebTitle(titleStr){
	setupWebViewJavascriptBridge(function(bridge) {
	     bridge.callHandler('xhWebTitle', titleStr, function(response) {
		 })
	})
}

function setAppBtn(){
	var host=window.location.host;
	var ruleUrl="http://"+host+"/h5static/financialPlanner/captainInvite/captainInviteRule.html";
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowButton', {"titleBack": "1","titleClose": "0","titleWeb": {"titleContent": "邀请规则","url":ruleUrl}}, function(response) {
		})
	})
}

function setNoAppBtn(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowButton', {"titleBack": "1","titleWeb": {"titleContent": "","url": ""}}, function(response) {
		})
	})
}

function shareWeiXin(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShareSocialPlatform', {'shareTitle': 'test',"shareContent":"shareConTest"}, function(response) {
		})
	});
	
}
function share(inviteNum){
	var host="https://"+window.location.host;
	var shareUrl=host+"/mobile/mt/teamRegister.shtml?managerid="+appUserId+"&mobile="+inviteNum;
	var shareTitleStr=(nicknameStr?nicknameStr:realnameStr)+'诚邀你加入星火金服';
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShareSocialPlatform', {"shareType": "wx",'shareTitle': shareTitleStr,"shareContent":"加入星火，让专属理财师为您量身定制理财计划，省心省力","shareImageUrl": "","shareUrl":shareUrl}, function(response) {
		})
	});
	
}

function setCookie(name,value)
{
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days*24*60*60*1000);
	document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}
function getCookie(name)
{
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
	return unescape(arr[2]);
	else
	return null;
}
