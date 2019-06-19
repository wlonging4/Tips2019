/* 模板方法 只 支持 简单 <%= %>*/
(function() {
    var cache = {};
    this.tmpl = function tmpl(str, data) {
        var fn = !/\W/.test(str) ? 
        cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML):
        new Function('obj', 
        "var p=[];" 
        +" var print=function(){p.push.apply(p,arguments)};"
        + "with(obj){p.push('"
        +str.replace(/[\r\t\n]/g, ' ')
            .split("<%").join('\t')
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
            .replace(/\t=(.*?)%>/g, "',$1,'")
            .split('\t').join("');")
            .split("%>").join("p.push('")
            .split("\r").join("\\'")
        + "');}return p.join('');");
        return data? fn(data): fn;
    }
})();
function Dialog(options){
    this.options = options || {};
    this.wrapperClass = options.wrapperClass || "";
    this.title = options.title || "";
    this.contentText = options.contentText || "";
    this.isPromptbtn = (typeof options.isPromptbtn == "boolean" ? options.isPromptbtn : false) || false;
    this.conisPromptText = options.conisPromptText;
    this.conisPromptClick=options.conisPromptClick ||  "";
    this.conisPromptClass=options.conisPromptClass || ["",""];
    this._createMask();
    this.popup=this._createPopup(this.options);
    this.mash=this._createMask();
    return this;
}

Dialog.prototype._createMask = function(){
    var  body = document.querySelector("body");
    mask = document.createElement("div");
    mask.className = "ovrly";
    body.appendChild(mask)
    return mask;
};
Dialog.prototype._createPopup = function(thisObj){
   	var  body = document.querySelector("body"), html = "";
    var popup = document.createElement("div");
    popup.className = "dialogBox";
    if(this.wrapperClass){
        popup.className += " " + this.wrapperClass;
    };
    
    html += '<div class="dialog"><div class="dialogTitle">';
    if(thisObj.title){
    	 html += '<div class="titWord">' + thisObj.title + '</div>';
    }
    html += '</div><div class="dialogConBox"><div class="dialogCon">';
    html += thisObj.contentText;
    html += '</div></div>';
    if(this.isPromptbtn){
        html += '<div class="bottomBtn topBorder">';
        for(i=0;i<thisObj.conisPromptText.length; i++){
        	html +='<a href="javascript:void(0);" onclick="'+( thisObj.conisPromptClick?thisObj.conisPromptClick[i]:"" )+'">'+ thisObj.conisPromptText[i] +'</a>';
        }
        html +='</div>';
    }
    html += '</div>';
    popup.innerHTML = html;

    body.appendChild(popup);
    return popup;

};
Dialog.prototype.open = function(){
    this.popup.style.display="block";
    this.mash.style.display="block";
};
Dialog.prototype.close = function(){
   this.popup.style.display = "none";
   this.mash.style.display = "none";
};
Dialog.prototype.setContent=function(setConStr){
	this.popup.querySelector(".dialogCon").innerHTML=setConStr;
}
/*
 * Tips：弱提示
 * init：初始化方法
 * show：显示
 * hide:隐藏
 * setContent：修改Tips 里面的内容
 */
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
//关闭webview
function callBackBtnCloseWeb(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhWapGoBack','wapCloseWeb', function(response) {
		})
	})
}
//与 app交互 加密
/*
 * postDataStr  需加密字符串 必须为 string 类型
 * callBackObj  回调方法 所在的obj
 * fntype		回调方法名
 */
function xhReqDataHandleFn(postDataStr,callBackObj,fntype){
	var appDataStr={"reqDataJson":postDataStr,"isAes":"0"};
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhReqDataHandle',appDataStr, function(responseCallback) {
			
			if( (typeof responseCallback) !== 'string'){
				responseCallback=JSON.stringify(responseCallback);
			}
			
			/*根据回调方法名不同 调用不同方法*/
			if(fntype=="loadData"){
				callBackObj.loadData(responseCallback);
			}else if(fntype=="submitFn"){
				callBackObj.submitFn(responseCallback);
			}else if(fntype=="loadList"){
				
				/*pageNo pageSize 得为int类型 去双引号*/
				responseCallbackJson=JSON.parse(responseCallback);
				var pageNo=responseCallbackJson.appReqData.pageNo;
				var pageSize=responseCallbackJson.appReqData.pageSize;
				if(responseCallbackJson.appid === '8aead9a64cc04916014cc049169d0000' && Number(responseCallbackJson.versionCode) <= 179){
                    responseCallbackJson.appReqData.pageNo=parseInt(pageNo);
                    responseCallbackJson.appReqData.pageSize=parseInt(pageSize);
				}

				responseCallback=JSON.stringify(responseCallbackJson);
				/*pageNo pageSize 得为int类型 去双引号:end*/
				
				
				callBackObj.loadList(responseCallback);
			}
			
	    })	
	})	 
}
//右上角小铃铛
function appSmallBellBtn(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowButton', {"smallBell":"0","titleTranslate":"1"}, function(response) {
		})
	})
}

//app带上标题栏
function apphasHeader(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowButton', {"smallBell":"0","titleTranslate":"0"}, function(response) {
		})
	})
}
//app title
function appSetWebTitle(titleStr){
	setupWebViewJavascriptBridge(function(bridge) {
	     bridge.callHandler('xhWebTitle', titleStr, function(response) {
		 })
	})
}
//token过期，跳转到登录页面
function appToLogin(){
	/*Tips.show("app跳转，进入抢满减券列表页");*/
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhTokenExpired',  function(response) {
		})
	})
}
//app跳转 抢满减券
function appToGrabRedEnvelope(){
	/*Tips.show("app跳转，进入抢满减券列表页");*/
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowRedEnveList',  function(response) {
		})
	})
}
//app跳转 发满减券
function appToSentRedEnvelope(){
	/*Tips.show("app跳转，进入发满减券页面");*/
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowGrabRedEnveList',  function(response) {
		})
	})
	
}
//app跳转 发满减券列表详情
function appToSendRed(redPacketStoreId,redPacketTemplateId,remain){
	if(remain<=0){return false};
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowAppSendRed',{"redPacketTemplateId":redPacketTemplateId,"redPacketStoreId":redPacketStoreId},function(response) {
		})
	})
}

function getQueryString(name){
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) return unescape(r[2]); 
    return null; 
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
//兼容：end
