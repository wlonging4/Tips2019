import $ from 'jquery'
import {Tools, G, Dialog} from "COMMON/js/common";


/*test:删*/
var invitationRegister={
	init:function(){
		var self=this;
	/*	alert(Tools.getUserInfo());
		Tools.getUserInfo().then(function (data) {
			alert("token:"+data.token)
			alert(JSON.stringify(data));
		}).then(function(data){
			alert(data.token)
		})*/
		self.getData();
		Tools.setTitle("邀请客户注册");
		/*self.bindEvent();*/
	},
	share:function(){
		var self=this;
		var nicknameStr=self.nickName;
		var realnameStr=self.realName;
		
		var host="https://"+window.location.host;
	
		var shareUrlStr=host+"/h5static/app/planner/shareShop.html?storeCode="+self.storeCode;
		var regRedEnveAmountStr=self.regRedEnveAmount?"，送你"+self.regRedEnveAmount+"元现金红包。" :"";
		var shareTitleStr=(nicknameStr?nicknameStr:realnameStr)+'诚邀您加入星火金服'+regRedEnveAmountStr;
		var shareImageUrlStr=self.accountimg?self.accountimg: "" ;
		var shareOption={
			"shareType": "all",
			'shareTitle': shareTitleStr,
			"shareContent":"加入星火，专属理财师为您提供一对一专业咨询，省心又省力。",
			"shareUrl":shareUrlStr,
			"shareImageUrl":shareImageUrlStr
			
		}
		Tools.SHARE(shareOption);
	},
	previewBtn:document.querySelector(".js_previewBtn"),
	ajaxSuccess:function(ajaxReData){
		var self=this;
		self.storeCode=ajaxReData.storeCode;
    	var previewBtnUrl="shareShop.html?storeCode="+self.storeCode; //预览跳转 分享页面注册页面 
    	self.previewBtn.setAttribute("href",previewBtnUrl);
    	
    	self.accountimg=ajaxReData.accountimg;
    	self.regRedEnveAmount=ajaxReData.regRedEnveAmount
    	self.nickName=ajaxReData.nickName;
		self.realName=ajaxReData.realName;
	},
	getData:function(){
		var self=this;
		var params = Tools.queryUrl(location.href);
		var token=params.token?params.token:"";
		if(!token){
			return
		}
		/*token="5389bf1c030380d0e9085f25f83ca078:1";*/
		var ajaxData={"token":token};
		
		Tools.AJAX({
	       	url: G.base + "/promote/getPromoteShare.json",
	        type: 'post',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	        data:ajaxData
	 }).then(function (data) {
            if(data.code == 1){
            	var ajaxReData=data.data
            	self.ajaxSuccess(ajaxReData);
            	self.bindEvent();
            }
        });
	},
	bindEvent:function(){
		$(document).on("click", ".shareBtn", function () {
			invitationRegister.share();
		})
	}
}

invitationRegister.init();
