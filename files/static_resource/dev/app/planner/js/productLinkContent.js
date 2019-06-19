import $ from 'jquery'
import {Tools, G, Dialog} from "COMMON/js/common";

var productLinkContent={
	init:function(){
		var self=this;
		self.getData();
	},
	urlType:function(){			//连接type
		var self=this;
		return self.getQueryString("type");
	},
	sesameCode:function(){
		var self=this;
		return self.getQueryString("sesameCode"); //连接 sesameCode  私募产品 code
	},	
	contentBox:document.querySelector(".js_content")?document.querySelector(".js_content"):"",
	ajaxSuccess:function(ajaxReData){
		var self=this;
		if(self.contentBox==""){
			return;
		}
		var conStr=self.type[self.pageType].content;	//内容
		var innerHTMLStr=ajaxReData[conStr];
		innerHTMLStr=innerHTMLStr.replace(/\n/g,'<br/>');
		self.contentBox.innerHTML=innerHTMLStr;
	},
	type:{
		"bright":{"ajaxUrl":"/capp/sesame/projectBrightSpot.ason","content":"brightSpot","title":'项目亮点'}, /*项目亮点: wiki:http://wiki.creditease.corp/pages/viewpage.action?pageId=18224941*/
		"risk":{"ajaxUrl":"/capp/sesame/riskTip.ason","content":"risk","title":'风险揭示'}		/*风险揭示 http://wiki.creditease.corp/pages/viewpage.action?pageId=18224943*/
	},
	getData:function(){
		var self=this;
		var ajaxDataJson={"sesameCode": self.sesameCode()};
		var pageType=self.urlType();
		/*test:删*/
		/*ajaxDataJson={"sesameCode": 'zma152404182672811563'};
		pageType="risk";*/
		/*test:删*/
		
		if(!pageType){
			return
		}
		
		/**/	//app  title
		/*test:删*/
		self.pageType=pageType;
		
		var appTitle=self.type[self.pageType].title;
		Tools.setTitle(appTitle);
		
		var ajaxUrl=self.type[self.pageType].ajaxUrl;
		
		
		/*test:删*/
		/*项目亮点*/
		/*ajaxDataJson={"sesameCode": "zma152404182672811563"};*/
		/*ajaxDataJson={"sesameCode": self.sesameCode()};
		ajaxData={"appReqData": ajaxDataJson,"appVersion": "3.0.1","appid": "8aead9a64cc04916014cc049169d0000","deviceIdentifier": "finance_c10d9599-1c6d-492b-8ef7-32dad950cd10","orgCode": "3636346132616633316162613461363338623463","orgId": "h7kuLlAS4mXevdJDxYOOYA==","sign": "0702549BA9E6C70A911243621A7ACBBC","token": "7b2797cbb55ac43161e4f1bafba61eed:1","version": "2.0.0"}
		*/
		
		/*风险提示数据*/
		/*ajaxDataJson={"sesameCode": "zma153052181056814497"};*/
		/*var ajaxDataBright={"appReqData": ajaxDataJson,"appVersion": "3.0.1","appid": "8aead9a64cc04916014cc049169d0000","deviceIdentifier": "finance_c10d9599-1c6d-492b-8ef7-32dad950cd10","orgCode": "3636346132616633316162613461363338623463","orgId": "h7kuLlAS4mXevdJDxYOOYA==","sign": "0702549BA9E6C70A911243621A7ACBBC","token": "7b2797cbb55ac43161e4f1bafba61eed:1","version": "2.0.0"}
		var ajaxDataTestRisk={"appReqData": ajaxDataJson,"appVersion": "3.0.1","appid": "8aead9a64cc04916014cc049169d0000","deviceIdentifier": "finance_c10d9599-1c6d-492b-8ef7-32dad950cd10","orgCode": "3636346132616633316162613461363338623463","orgId": "h7kuLlAS4mXevdJDxYOOYA==","sign": "D11808D03B469F9D058AB5B4B514CA93","token": "7b2797cbb55ac43161e4f1bafba61eed:1","version": "2.0.0"}
		var ajaxData=(self.pageType=="bright"?ajaxDataBright:ajaxDataTestRisk);*/
		/*test:删*/
		
		
		
		/*ajaxData=JSON.stringify(ajaxData);*/
		/*?type=  bright 项目亮点 risk风险提示*/
		
		Tools.AJAXTOKEN({
            url: G.base + ajaxUrl,
            type:"post",
            async: true,
	        cache:false,
	        dataType: 'JSON',
            data:ajaxDataJson
        }).then(function (data) {
            if(data.code == 1){
            	var ajaxReData=data.data
            	self.ajaxSuccess(ajaxReData);
            }
        });
		/*Tools.AJAX({
			url: G.base + "/capp/sesame/projectBrightSpot.ason",  //项目亮点
	       	url: G.base + "/capp/sesame/riskTip.ason", //风险提示
	       	url: G.base + ajaxUrl,
	        type: 'post',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	        data:{
	        	data:ajaxData
	        }
	 }).then(function (data) {
            if(data.code == 1){
            	var ajaxReData=data.data
            	self.ajaxSuccess(ajaxReData);
            }
        });*/
	},
	getQueryString:function(name){
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	    var r = window.location.search.substr(1).match(reg); 
	    if (r != null) return unescape(r[2]); 
	    return null; 
	}
}

productLinkContent.init();