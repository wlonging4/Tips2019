import {Tools, G, Dialog} from "COMMON/js/common";
var noviceGuide={
	init:function(titleStr){
		var self=this;
		self.shareGetData();
		Tools.setTitle(titleStr);	
		
		
	},
	shareGetData:function(){
		var self=this;
		Tools.getUserInfo().then(function (data) {
			return Tools.AJAX({
		        url: G.base + "/promote/getPromoteShare.json",
			    type: 'post',
		        async: true,
		        cache:false,
		        dataType: 'JSON',
		        data:{
		            token:data.token
		        }
	    	})
		}).then(function (res) {
		    if(res.code==1){
		    	var ajaxReData=res.data;
		       	self.storeCode=ajaxReData.storeCode;
		       	self.accountimg=ajaxReData.accountimg;
		    	//self.nickName=ajaxReData.nickName;
				//self.realName=ajaxReData.realName;
		      	self.headerShareBtn();
		    }
		    
		});
	},
	headerShareBtn:function(){
		var self=this;
		var host=window.location.host;
		var options={}
		options.shareTitle="星火金服新客户引导";
		options.shareContent="新客户如何完成第一笔出借";
		var defaultHeadPortrait="https://"+host+"/h5static/financialPlanner/images/captainInvite/defaultHeadPortrait.jpg";
		options.shareImageUrl=self.accountimg?self.accountimg:defaultHeadPortrait;
		options.shareUrl="https://"+host+"/h5static/app/planner/noviceGuide.html";
		var shareOptions={"titleTranslate":"0","titleBack": "1","titleClose": "0","titleShare":options};
		Tools.shareHeaderBtn(shareOptions);
	}
}

noviceGuide.init("新客户引导");