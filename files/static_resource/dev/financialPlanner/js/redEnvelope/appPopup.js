Tips.init();
var appPopup={
	init:function(detailBox){
		this.detailBox=detailBox
		/*this.loadData();*/
		
		/*首页弹窗 ajax {}*/
		var self=this;
		var ajaxData={};
		var postDataStr=JSON.stringify(ajaxData);
		xhReqDataHandleFn(postDataStr,appPopup,"loadData");
	},
	loadData:function(ajaxData){
		ajaxData={"data":ajaxData};
		$.ajax({
	        url: '/webapi/capp/store/index.ason',
	        type: 'POST',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	        data:ajaxData,
	        success: function (result) {
	        	/*loan.loadingHidden();*/
	            if (result.code== "1"){
	            	appPopup.detailsHtml(result.data);
	              
	            }else{
	            	/*loan.msgDialog(result.msg);*/
	            }
	        },
	        error: function(e) {
	        	/*loan.loadingHidden();
	        	loan.msgDialog(e);*/
	        }
	    })
	},
	statuClass:["statu1","statu2"],	/*抢满减券 和发 满减券 class*/
	btnWord:["立即抢","去发满减券"],
	tipsWord:["","快去发给您的客户吧"],
	clickFn:["appToGrabRedEnvelope()","appToSentRedEnvelope()"],
	btnLink:[],
	detailsHtml:function(data){
		var detailsArr=[];
		var statuClassObj=this.statuClass;
		data=this.dataProcess(data);
		/*Tips.show(tmpl("js_appPopupTmpl", {item:data} ));*/
		this.detailBox.innerHTML=tmpl("js_appPopupTmpl", {item:data} );
		/*this.bottomBoxObj.innerHTML=tmpl("detailBottom",{item:data});*/
	},
	dataProcess:function(data){
		var returnData={}
		var redStatu=data.grabAmount?0:1;
		returnData.amount=data.grabAmount?data.grabAmount:data.sentAmount;
		returnData.statuClass=this.statuClass[redStatu];/*状态显示图片*/
		returnData.btnWord=this.btnWord[redStatu];      /*按钮文字*/
		returnData.tipsWord=this.tipsWord[redStatu];	/*提示文字*/
		returnData.onclickFn=this.clickFn[redStatu];	/*按钮点击事件*/
		return returnData;
	}
}

window.onload=function(){	
	var detailBox=document.querySelector(".js_detail");		//详情 box
/*	var result={data:{"grabAmount":0,"sentAmount":100}};*/


	/* app交互 url传递 grabAmount 可抢金额 sentAmount 已发到店铺金额  */
	var grabAmount=getQueryString("grabAmount")?getQueryString("grabAmount"):0;
	var sentAmount=getQueryString("sentAmount")?getQueryString("sentAmount"):0;
	grabAmount=parseInt(grabAmount);
	sentAmount=parseInt(sentAmount);
	/* app交互 url传递 grabAmount 可抢金额 sentAmount 已发到店铺金额 :end */
	
	var appData={"grabAmount":grabAmount,"sentAmount": sentAmount};
	appPopup.detailBox=detailBox;
	appPopup.detailsHtml(appData);
	/*appPopup.init(detailBox);*/
/*	appPopup.detailsHtml(result.data);*/
}
