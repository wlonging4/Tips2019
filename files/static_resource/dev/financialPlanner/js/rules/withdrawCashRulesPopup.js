/*appSetWebTitle("提现规则");*/ /*app title*/

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

var cashRules={
	init:function(replaceBox){
		var self=this;
		self.replaceBox=replaceBox;
		self.loadData();
	},
	templateStr:"单笔提现最低<%= item.withdrawMinAmount%>元 ",/*，每日可提现<%= item.withdrawTimes%>次 */
	ajaxUrl:"/mobile/trusteeship/queryTrusteeshipWithdrawParam.shtml",
	loadData:function(ajaxData){
		var self=this;	
		/*data={"aaa":"aaaValue","bbb":"bbbValue"};
		self.replaceBox.innerHTML=tmpl(self.templateStr,{item:data});*/
		$.ajax({
	        url: self.ajaxUrl,
	    /*    type: 'POST',*/
	   		type: 'get',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	   /*     data:ajaxData,*/
	        success: function (result) {
	            if (result.success){
	            	data=result.data;
					self.replaceBox.innerHTML=tmpl(self.templateStr,{item:data});
	            }
	        },
	        error: function(e) {
	        	
	        }
	    })
	}
}

window.onload=function(){
	var replaceBox=document.querySelector(".js_dataReplace");		//详情 box
	cashRules.init(replaceBox);	
}
