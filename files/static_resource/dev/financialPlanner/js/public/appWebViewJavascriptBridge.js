/*
 * 与app，Bridge交互
 * wiki地址：http://wiki.creditease.corp/pages/viewpage.action?pageId=14770763
 * */
function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
    	
       return callback(window.WebViewJavascriptBridge)
    } else {
        document.addEventListener(
            'WebViewJavascriptBridgeReady'
            , function() {
              return  callback(window.WebViewJavascriptBridge)
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

/*var onloadNum=getCookie('onloadNum');
var appUserId=getCookie('appUserId'); 
var appPhoneNumber=getCookie('appPhoneNumber');
var token=getCookie('token');
var realnameStr=getCookie("realnameStr");
var nicknameStr=getCookie("nicknameStr")?getCookie("nicknameStr"):"";*/

/*function xhAppVersion(){
	alert("xhAppVersion")
	setupWebViewJavascriptBridge(function(bridge) {
		 bridge.registerHandler('xhAppVersion', function(data, responseCallback) {
	        return dataJSON;   
	     })	
	})
	
	 
}
xhAppVersion();*/

function getUserInfo(callBackFn){
	/*alert("getUserInfo")*/
	setupWebViewJavascriptBridge(function(bridge) {
		 bridge.registerHandler('xhUserInfoToWeb', function(data, responseCallback) {
		 	var dataString=data;
	        var dataJSON=JSON.parse(dataString); 
            var token=dataJSON.token;
            var userId=dataJSON.userId;
            var managerId=dataJSON.managerId;
            
            setCookie('token', token);
            setCookie('userId', userId);   
            setCookie('managerId', managerId); 
             
            callBackFn();
	            
	        return dataJSON;
	           
	           
	     })	
	})
	
	 
}



//关闭webview
function callBackBtnCloseWeb(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhWapGoBack','wapCloseWeb', function(response) {
		})
	})
}
//原生分享
function share(inviteNum){
	var host="https://"+window.location.host;
	var shareUrl=host+"/mobile/mt/teamRegister.shtml?managerid="+"111"/*appUserId*/+"&mobile="/*+inviteNum*/;
	var shareTitleStr=/*(nicknameStr?nicknameStr:realnameStr)+*/'诚邀你加入星火金服';
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShareSocialPlatform', {"shareType": "wx",'shareTitle': shareTitleStr,"shareContent":"加入星火，让专属理财师为您量身定制理财计划，省心省力","shareImageUrl": "","shareUrl":shareUrl}, function(response) {
		})
	});
	
}

function wapMobileShare(options){
	var shareOptions={
			"shareType": "all",
			'shareTitle': '',
			"shareContent":'',
			"shareUrl":'',
			"shareImageUrl":''
			
		}
	for(var i in options){
		//分享url加https
		shareOptions[i]=options[i];
		if(i==="shareUrl"){
			var host=window.location.host;	
			var optUrl=options.url;
			optUrl="https://"+host+options[i];
			shareOptions[i]=optUrl;
			
		}
		
		
	}
	//console.log(shareOptions)
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShareSocialPlatform', shareOptions, function(response) {
		})
	});
}

function setAppBtn(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowButton', {"titleBack": "1","titleClose": "0","titleShare": "1"}, function(response) {
			/*alert("定制规则 按钮");*/
		})
	})
}
//app打开新的webview
function newWebview(options){
	var host=window.location.host;	
	var optUrl=options.url;
	optUrl="https://"+host+optUrl;
	
	/*,"XXparams":"1111"*/
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhH5GoAppPages', {"page":"webview","pageParams":{"url":optUrl,login:"1"}}, function(response) {
		})
	})
}

//分享按钮参数
function shareAppBtnOption(options){
	var host=window.location.host;
	
	var optShareTitle=options.shareTitle;
	var shareContent=options.shareContent;
	var optShareImageUrl=options.shareImageUrl;
	var optShareUrl=options.shareUrl;
	
	optShareUrl="https://"+host+optShareUrl;
	
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowButton', {"titleTranslate":"0","titleBack": "1","titleClose": "0","titleShare":{"shareTitle": optShareTitle,"shareContent": shareContent,"shareImageUrl":optShareImageUrl,"shareUrl": optShareUrl}}, function(response) {
			/*alert("定制规则 按钮");*/
		})
	})
}

function xhReqDataHandleFn(postDataStr,callBackFn){
	var appDataStr={"reqDataJson":postDataStr,"isAes":"0"};
	//callBackFn({data:"test"});
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhReqDataHandle',appDataStr, function(responseCallback) {
			if( (typeof responseCallback) !== 'string'){
				responseCallback=JSON.stringify(responseCallback);
			}
			callBackFn({data:responseCallback});
	    })	
	})	 
}
var publicFun={};
publicFun.xhReqDataHandleFn=function(postDataStr,callBackObj){
	if( (typeof postDataStr) !== 'string'){
		postDataStr=JSON.stringify(postDataStr);
	}
	 xhReqDataHandleFn(postDataStr,callBackObj);
}


/*function shareAppBtnOption(options){
	var optShareTitle=options.shareTitle;
	var shareContent=options.shareContent;
	var optShareImageUrl=options.shareImageUrl;
	var optShareUrl=options.shareUrl;
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhGetShareInfo', {"shareTitle": optShareTitle,"shareContent": optShareContent,"shareImageUrl":optShareImageUrl,"shareUrl":optShareUrl}, function(response) {
		})
	});
	
}*/



/*给title*/
function setWebTitle(titleStr){
	setupWebViewJavascriptBridge(function(bridge) {
	     bridge.callHandler('xhWebTitle', titleStr, function(response) {
		 })
	})
}


function setCookie(name,value)
{
	document.cookie = name + "="+ escape (value);
}
function getCookie(name)
{
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
	return unescape(arr[2]);
	else
	return null;
}
function getQueryString(name){
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) return unescape(r[2]); 
    return null; 
}
