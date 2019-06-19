wapMobileJsBridge={
	newWebView:function(options){
		newWebview(options);
	},
	appNewWebView:function(thisObj){
		var self=this;
		self.newWebView({url:thisObj.getAttribute("data-href")});
	},
	appShare:function(options){
		//console.log(options)
		wapMobileShare(options);
	},
	getUrl:function(url){
		var self=this;
		var appNewWebUrl=url;
		self.newWebView({url:appNewWebUrl});
	},
	pageHasShareJson:function(){
		return document.querySelector("#shareUrl")? document.querySelector("#shareUrl"):false;
	},
	share:function(){
		var self=this;
		
		var pageHasShareJsonDom=self.pageHasShareJson();
		var appShareJson={};
		//页面中有拼接 好的 json 隐藏值
		if(pageHasShareJsonDom){
			
			var appShareJson=pageHasShareJsonDom.value;
			appShareJson=JSON.parse(appShareJson);
			
			//取值修改
			appShareJson.shareImageUrl=appShareJson.bigImage?appShareJson.bigImage:appShareJson.shareImage;
			appShareJson.shareContent=appShareJson.shareContent?appShareJson.shareContent:appShareJson.description;
			
			self.appShare( appShareJson);
			
		}
		
	},
	bindShareBtn:function(){
		var bindShareBtn=document.querySelector("#share")?document.querySelector("#share"):document.querySelector(".sm");
		bindShareBtn=bindShareBtn?bindShareBtn:document.querySelector(".fix_iphonex .btn");
		
		if(!bindShareBtn){
			return ;
		}else{
			bindShareBtn.setAttribute("onclick","wapMobileJsBridge.share();");
			bindShareBtn.setAttribute("href","javascript:void(0);");
		}
		
	},
	bindNewWebview:function(){
		var alink= document.querySelectorAll("a")?document.querySelectorAll("a"):false;
		
		if(alink){
			for(var i=0; i<alink.length;i++){
				var hrefUrl=alink[i].getAttribute("href")+"&interactiveMode=jsBridge";
				alink[i].setAttribute("data-href",hrefUrl);
				alink[i].setAttribute("href","javascript:void(0);");
				alink[i].setAttribute("onclick","wapMobileJsBridge.appNewWebView(this);");
			}
		}
	},
	getQueryString:function(name){
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	    var r = window.location.search.substr(1).match(reg); 
	    if (r != null) return unescape(r[2]); 
	    return null; 
	},
	load:function(){
		var self=this;
		if(wapMobileJsBridge.getQueryString('interactiveMode')=='jsBridge'){
			//带分享
			wapMobileJsBridge.bindShareBtn();
			//列表页
			if(document.querySelector(".topul")){
				wapMobileJsBridge.bindNewWebview();
			}
		}
		
		
	}
	
}
window.addEventListener("load",wapMobileJsBridge.load,false);
