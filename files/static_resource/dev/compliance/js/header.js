var header={
	showHeader:function(){
		var self=this;
		var isWap=this.getQueryString("type");
		if(isWap=="wap"){
			$("body").addClass("wap");
			self.showMobileShop();
		}
	},
	//获取url 参数值
	getQueryString:function(name){
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	    var r = window.location.search.substr(1).match(reg); 
	    if (r != null) return unescape(r[2]); 
	    return null; 
	},
	
	getMobileNum:function(str){
		return this.getQueryString(str);
	},
	showMobileShop:function(){
		var self=this;
		var mobileNumStr=self.getMobileNum("storeCode");
		if(!!mobileNumStr){
			var showModalObj=$(".nav_list").find(".hide");
			showModalObj.removeClass("hide");
			var shrefObj=showModalObj.find("a");
			var showModalObjHref=shrefObj.attr("href")+mobileNumStr;
			shrefObj.attr("href",showModalObjHref);
		}
	}
}
$(document).ready(function(){
	header.showHeader();  //判断是否为wap页面，显示头部
	/*alert(header.getCookieByString("xinghuo_token"));*/
})
