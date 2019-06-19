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

var investment={
	msgDialog:function(msgString){
		if(msgString=="" || msgString==null || msgString==undefined){
			return;
		}
		var self=this;
		var msgBoxObj=$(".tipsOvrly");
		msgBoxObj.find(".ovrlyWord").html(msgString);
		msgBoxObj.addClass("tipsOvrlyShow");
		setTimeout(self.msgDialogHide,2000);
	},
	msgDialogHide:function(){
		var msgBoxObj=$(".tipsOvrly");
		msgBoxObj.removeClass("tipsOvrlyShow");
	},
	loadingShow:function(){
		var loadingObj=$(".loadingDiv");
		loadingObj.removeClass("hidden");
		loadingObj.addClass("show");
	},
	loadingHidden:function(){
		var loadingObj=$(".loadingDiv");
		loadingObj.removeClass("show");
		loadingObj.addClass("hidden");
	},
	getQueryString:function(name){
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	    var r = window.location.search.substr(1).match(reg); 
	    if (r != null) return unescape(r[2]); 
	    return null; 
	} 
	
	
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


/*loading显示隐藏*/
var bottomLoading={
	init:function(){
		this.dom=document.createElement("div");
		this.dom.className="loadingBox hide";
		this.dom.innerHTML='<div class="loading">加载更多&nbsp;.&nbsp;.&nbsp;.</div>';
		this.callBackFn=function(){};
		
		this.domNoMore=document.createElement("div");
		this.domNoMore.className="noMoreTips hide";
		this.domNoMore.innerHTML="<div class='noMoreTipsWord'>没有更多了</div><div class='noMoreLine'>&nbsp;</div>"
		document.body.appendChild(this.dom);
		document.body.appendChild(this.domNoMore);
	},
	bottomLoadShow:function(){
		this.dom.classList.add("show");
		this.dom.classList.remove("hide");
	},
	bottomLoadHide:function(){
		this.dom.classList.add("hide");
		this.dom.classList.remove("show");
		this.bottomNoMoreShow();
	},
	bottomNoMoreShow:function(){
		this.domNoMore.classList.add("show");
		this.domNoMore.classList.remove("hide");
	},
	bottomNoMoreHide:function(){
		this.domNoMore.classList.add("hide");
		this.domNoMore.classList.remove("show");
	},
	bodyScroll:function(){
		var self=this;
		self.bottomLoadShow();
		var scrollTop =document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop; //滚动条高度
		var htmlHeight=document.documentElement.scrollHeight;		//页面总高度
		var clientHeight=document.documentElement.clientHeight; //页面可视高度
		if(scrollTop+clientHeight>htmlHeight-60){  //滚动到底部
			self.callBackFn();
		}
	},
	bodyScrollBind:function(callBack){
		var self=this;
		self.callBackFn=callBack;
		document.addEventListener('scroll',bodyScroll,false);
	},
	bodyScrollUnBind:function(){
		var self=this;
		document.removeEventListener('scroll',bodyScroll,false);
		
	}

}
function bodyScroll(){
	bottomLoading.bodyScroll();
}




/*Loading.init();
Loading.show();
Loading.hide();*/
/*loading:end*/
	