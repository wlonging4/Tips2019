var borrowSituation={
	init:function(){
		var self=this;
		self.appAjaxData(borrowSituation.getdetailsDataApp);
	},
	successFun:function(result){
		var self=this;
		if(result.code=="1"){
			if(self.detailsBox){
				var data=result.data.borrowSituationList;
				if(data.length==0){
					self.dataEmpty();
				}
				self.detailsBox.innerHTML=self.returnHtml(data);
				
			}
			
			
		}else{
			self.dataEmpty();
		}
		
	},
	returnHtml:function(data){
		
		var html="";

		html+='<ul>';
		 $.each(data,function(index,value){  		 	
            html+='<li>';
			html+='		<div class="tit">'+value.key+'</div>';
			html+='		<div class="word">'+value.value+'</div>';
			html+='</li>';
			
        });  
        html+='</ul>';
		return  html;
	},
	/*testData:{"data":{"borrowSituationList":[
		{"value":"sdfds",
		"key":"借款人",
		"isShow":true
		},
		{
		"value":"55444554444",
		"key":"证件号码",
		"isShow":true
		},
		{
		"value":"无变化",
		"key":"借款人资金运用情况",
		"isShow":true
		},
		{
		"value":"无变化",
		"key":"借款人经营状况及财务状况",
		"isShow":true
		},
		{
		"value":"无变化",
		"key":"借款人还款能力变化情况",
		"isShow":true
		},
		{
		"value":"无",
		"key":"借款人涉诉情况",
		"isShow":true
		},
		{
		"value":"无",
		"key":"借款人受行政处罚情况",
		"isShow":true
		},
		{
		"value":"还款",
		"key":"资金来源",
		"isShow":true
		},
		{
		"value":"0",
		"key":"逾期次数",
		"isShow":true
		},
		{
		"value":"0元",
		"key":"逾期金额",
		"isShow":true
		},
		{
		"value":"2019-04-30",
		"key":"更新时间",
		"isShow":true
		}
		]
		},
		"msg":"",
		"code":"1"
	},*/
	loanCode:getQueryString("loanCode")?getQueryString("loanCode"):"",
	appAjaxData:function(fn){
		var self=this;
		var postData={"loanCode":self.loanCode};
		postData=JSON.stringify(postData);
		publicFun.xhReqDataHandleFn(postData,fn);
	},
	detailsBox: document.querySelector(".js_borrowSituation")?document.querySelector(".js_borrowSituation"):null,
	borrowAjaxUrl:"/webapi/app/deal/getBorrowSituation.ason",
	getdetailsDataApp:function(appData){
		var self=this;
		/*test*/
		/*result=borrowSituation.testData;
		borrowSituation.successFun(result);
		loan.loadingHidden();
		return;*/
		/*test:end*/
		$.ajax({
	        url: borrowSituation.borrowAjaxUrl,
	        type: 'post',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	        data:appData,
	        success: function (result) {
	        	loan.loadingHidden();
	        	/*test*/
	        	//result=borrowSituation.testData;
	        	/*test:end*/
	        	borrowSituation.successFun(result);
	        },
	        error: function(e) {
	        	loan.loadingHidden();
	        }
	   });
	},
	dataEmpty:function(){
		document.querySelector("body").classList.add("emptyBody");
	}
}

borrowSituation.init();
