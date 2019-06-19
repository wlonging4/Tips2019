import $ from 'jquery'
import {Tools, G, Dialog} from "COMMON/js/common";


var invitationRegisterQRCode={
	init:function(){
		var self=this;
		
		self.getData();
		Tools.setTitle("工作室二维码");
	},
	getData:function(){
		var self=this;
		var self=this;
		var params = Tools.queryUrl(location.href);
		var token=params.token?params.token:"";
		if(!token){
			return
		}
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
            	self.storeCode=ajaxReData.storeCode;
		       	self.accountimg=ajaxReData.accountimg;
		    	self.nickName=ajaxReData.nickName;
				self.realName=ajaxReData.realName;
				/*下载*/
				self.bindEvent();
				/*二维码回显*/
				self.selfCodeBox.src=self.returnCodeImgUrl();
				
            }
        });
	},
	selfCodeBox:document.querySelector(".js_QRCode_img"),
	returnCodeImgUrl:function(){
		var self=this;
		var imgUrl=G.base+"/store/getQRcode/2/"+self.storeCode;
		
		return imgUrl;
	},
	getQueryString:function(name){
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	    var r = window.location.search.substr(1).match(reg); 
	    if (r != null) return unescape(r[2]); 
	    return null; 
	},
	appQRCodeDownload:function(){
		var self=this;
		var host="https://"+window.location.host;
		/*var shareUrl=host+"/mobile/mt/teamRegister.shtml?"*//*managerid="+appUserId+"&mobile="+inviteNum*/;
		
		/*dev*/
		var downLoadImgUrl=host+G.base+"/store/getQRcode/2/"+self.storeCode;
		var downLoadObj={"url":downLoadImgUrl,"isAes":"0","suffix":"png"};
		/*console.log(downLoadObj);*/
		Tools.DownloadImg(downLoadObj);
		/*invitationRegisterQRCode.tipsShow();*/
	},
	bindEvent:function(){
		$(document).on("click", ".loadImg", function () {
			invitationRegisterQRCode.appQRCodeDownload()
		})
	},
	tipsDom:document.querySelector(".tipsBox"),
	tipsShow:function(){
		var self=this;
		self.tipsDom.classList.add("show");
		setTimeout(function(){
			self.tipsDom.classList.remove("show");
		},3000)
		
	}
}
invitationRegisterQRCode.init();