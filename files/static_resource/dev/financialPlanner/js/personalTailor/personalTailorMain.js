callBackBtnCloseWeb();	//返回按钮关闭webview
Tips.init();
Loading.init();

var customSwitch={
	token:"635ee9b2a5c34b607bf645c32cfa6c16",
	init:function(){
		var self=this;
		self.token=getCookie("token")?getCookie("token"):"";
		
		self.load();
		
		
	},
	mainDisabledShow:function(){
		setAppBtn(); 	//显示定制规则按钮
		document.querySelector(".mainDisabled").classList.add("show");
	},
	load:function(){
		var self=this;
		self.getData={"appReqData":{},"token":self.token};
		self.getData=JSON.stringify(self.getData);
		
		Loading.show();
		//11.是否可以定制
		$.ajax({
		  	url: '/webapi/custom/canCustom.ason',		//接口wiki:http://wiki.creditease.corp/pages/viewpage.action?pageId=15342128
		    type: 'get',
		    async: true,
		    timeout:15000,
		    dataType: 'JSON',
		    data:{
		    	data:self.getData
		    },
		    cache:false, 
		    success: function (result) {
		    	Loading.hide();
		        if (result.code== "1" && result.data.canCustom=="0"){/*result.data.canCustom=="0"*/
		        	location.href="personalTailorEdit1.html";
		        }else{
		        	/*Tips.show(result.msg);*/
		        	self.mainDisabledShow();
		        }
		    },
		    error: function(e) {
		    	Loading.hide();
		    	self.mainDisabledShow();
		    	/*Tips.show(e);*/
		    },
		    complete: function (XMLHttpRequest,status) {
		    	Loading.hide();
		    	if(status=="success"){
		    		return;
		    	}
                if(status == 'timeout') {
                  Tips.show("网络异常");
                }else{
                	Tips.show("服务器异常");
                }
            }
		})
	}

}

function getUserInfo(callBackFn){
	var dataJSON="";
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.registerHandler('xhUserInfoToWeb', function(data, responseCallback) {
	            var dataString=data;
	            dataJSON=JSON.parse(dataString); 
	            getUserInfoData=dataJSON;
	            appUserId=dataJSON.userid?dataJSON.userid:dataJSON.userId;
	         
	            appPhoneNumber=dataJSON.phoneNum?dataJSON.phoneNum:"";

	            token=dataJSON.token?dataJSON.token:""
	            
	            setCookie('appUserId', appUserId);   
	            setCookie('appPhoneNumber', appPhoneNumber); 
	            setCookie('token', token); 
	            
	            
	            callBackFn();
	            
	           	return dataJSON;
	           
	           
	     })	
	    
	})	 
}
function urlCallBackToken(){
	if(setCookie('token')==undefined){
		var token=getQueryString("token");
		setCookie('token', token); 
		getUserInfoCallBack();
	}
	
}
/*获取app信息:end*/
function getUserInfoCallBack(){
	customSwitch.init();
}

window.onload=function(){
	clearArrCookie(applyClearCookie);
	
	//测试数据
	/*getUserInfoCallBack();*/
	/*setCookie('token', "0fac09d06844d3bb978d571a7597b1c9"); 
	getUserInfoCallBack();*/

	/*判断是否回调*/
	var loadType=getQueryString("type")?getQueryString("type"):"0";
	if(loadType==1){
		callBackBtnCloseWeb();
		getUserInfoCallBack();
		
	}
	
	if(loadType==2){
		customSwitch.mainDisabledShow();
		return;
	}
	
	/*判断是否回调*/
	getUserInfo(getUserInfoCallBack);
	/*getUserInfoCallBack();*/
	
	//兼容
	setTimeout(urlCallBackToken,500);
	//兼容:end
	
	
	
}
