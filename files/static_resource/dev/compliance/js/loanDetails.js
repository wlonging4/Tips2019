var loanDetails={
	init:function(boxObj){
		this.boxObj=boxObj;
		this.borrowDetails();
	},
	dataProcessing:function(data){
		var detailTitle=[
			{"borrowerTypeCode":"借款人类型：","type":""},
			{"borrowerName":"借款人：","type":""}, 
			{"borrowerIdNumber":"证件号码：","type":""},
			/*{"corpFullName":"借款人：","type":"1"},*/ /*企业全称  */      /* "法人-全称"*/
			/*{"corpAbbrName":"证件号码：","type":"1"}, */     /*企业简称*/           /*  "法人-简称"*/
			{"corpRegCapital":"注册资本：","type":"1"},		/*	法人-注册资本*/
			{"corpRegAddr":"注册地址：","type":"1"},         /*法人-注册地址*/
			{"corpFoundingTime":"成立时间：","type":"1"},          /* 法人-成立时间*/
			{"corpRepName":"法定代表人：","type":"1"},					/*法人-法定代表人*/
			/*新加:20180528*/
			/*{"shareholderType":"股东类型","type":"1"},
			{"shareholderName":"股东名称","type":"1"},
			{"shareholderIdType":"股东证件类型","type":"1"},*/
			
			
			{"shareholderInfoList":[{"shareholderType":"股东类型："},{"shareholderName":"股东名称："},{"shareholderIdType":"股东证件类型："}],"type":"1"},
			/*新加:20180528:end*/
			{"corpIndustry":"所属行业：","type":"1"},				/*法人-所属行业*/
			  /*借款人姓名*/
			/*{"borrowerIdNumber":"证件号码：","type":"0"},*/   /*借款人证件号*/
			{"workCase":"工作性质：","type":"0"},
			{"projectName":"项目名称：","type":""},
			{"projectIntroduce":"项目简介：","type":""},
			{"loanPurpose":"借款用途：","type":""},
			{"loanAmount":"借款金额：","type":""},
			{"loanExpire":"借款期限：","type":""},
			{"loanRatio":"年化利率：","type":""},
			{"relationAmount":"相关费用：","type":""},    /*"html":"参见《出借咨询与服务协议》"*/
			{"valueDate":"起息日：","type":""},
			{"refundType":"还款方式：","type":""},
			{"repaySource":"还款来源：","type":""},
			{"repayGuarantee":"保障措施：","type":""},
			{"projectProgress":"项目撮合进度：","type":""},
			{"borrowerWarn":"出借人适当性管理提示：","type":""},
			{"incomeSource":"收入情况：","type":""},
			{"debtCase":"负债情况：","type":""},
			{"overdueNumber":"在本平台的逾期次数：","type":""},       /*逾期次数*/
			{"overdueAmount":"在本平台的逾期总金额：","type":""},			/*逾期金额*/
			{"otherReportInfo":"截至借款前6个月内借款人<br />在征信报告中的逾期情况：","type":""},    /*征信报告情况*/
			{"otherNetloanCase":"在其他网络借贷平台借款情况：","type":""},         /*借款人在其他网络借贷平台借款情况*/
			
			{"otherFinanceCase":"在其他金融机构借款情况：","type":""}, 
			
			


			/*新加:201800802*/
			/*{"corpSharehoder":"法定代表人信用信息：","type":"1"},  */
			{"corpCreditInfo":"法定代表人信用信息：","type":"1"},  
			{"corpRealCapital":"实缴资本：","type":"1"},  
			{"corpOfficeAddr":"办公地点：","type":"1"},  
			{"corpManageArea":"经营区域：","type":"1"},
			/*新加:201800802:end*/
			{"raiseEndTime":"募集期截止日：","type":""}
		];
		if(data.borrowerTypeCode==0){
			detailTitle=detailTitle.filter(function(item){
			  return item.type !== "1";
			});
		}else{
			detailTitle=detailTitle.filter(function(item){
			  return item.type !== "0";
			});
		}
		var  borrowerTypeStr=["自然人","法人或其他组织"];
		data.borrowerTypeCode=borrowerTypeStr[data.borrowerTypeCode];
		
		var showArray=[];			
		
		for(var i=0; i<detailTitle.length; i++){
			$.each( detailTitle[i],function(index,value){ 
				if(index=="type"){
					return;
				}
				var detailTitleObj=detailTitle[i];
				var tit=detailTitleObj[index];
				var dataStr=(data[index]==null||data[index]=="")?"保密":data[index];
				
				if(index=="shareholderInfoList"){
					if(data[index].length==0){
						/*股东信息列表为空时 ，只显示字段   股东类型、名称、证件 */
						showArray.push({"title":tit[0].shareholderType,"word":"保密"});
						showArray.push({"title":tit[1].shareholderName,"word":"保密"});
						showArray.push({"title":tit[2].shareholderIdType,"word":"保密"});
						/*股东法人信息列表为空时 ，只显示字段  股东类型、名称、证件：end */
						return;
					}
					$.each(dataStr,function(i,v){
						var itemData=dataStr[i];
						showArray.push({"title":tit[0].shareholderType,"word":itemData.shareholderType});
						showArray.push({"title":tit[1].shareholderName,"word":itemData.shareholderName});
						showArray.push({"title":tit[2].shareholderIdType,"word":itemData.shareholderIdType});
					})
					return;
				}
				
				if((index=="loanRatio" || index=="projectProgress") && !isNaN(dataStr)){
					dataStr=(parseFloat(dataStr)*100).toFixed(2) +"%";
				}
				if((index=="loanAmount" || index=="overdueAmount")  && !isNaN(dataStr)){
					dataStr=dataStr+"元";
				}
				if(index=="overdueNumber"  && !isNaN(dataStr)){
					dataStr=dataStr+"次";
				}
				if(index=="loanExpire"  && !isNaN(dataStr)){
					dataStr=dataStr+"个月";
				}
				
				if(index=="repayGuarantee"){
					dataStr='<a href="javascript:void(0);" onclick="loanDetails.agreementConShow()">保障计划</a>';
				}
				
				if(index=="relationAmount" ){
					dataStr="参见《出借信息咨询与服务协议》";
				}
				if(index=="otherReportInfo" ){
					dataStr="暂时无法提供<br /><br />";
				}
				showArray.push({"title":tit,"word":dataStr});
				
				
				if(index=="projectProgress"){
					var isWap=loan.getQueryString("type");
					if(isWap=="wap"){
						showArray.push({"title":"合同模板：","word":'参见<a href="/mobile/product/wapProtocol/jiekuanxieyi_0710.shtml">《借款协议》</a>'});
			 			showArray.push({"title":"项目风险评估：","word":'参见<a href="/mobile/product/wapProtocol/fengxianjieshishu_0710.shtml">《风险揭示书》</a>'});
					}else{
						showArray.push({"title":"合同模板：","word":'参见<a href="/mobile/productProtocolApp.shtml?type=jiekuanxieyi_0710">《借款协议》</a>'});
			 			showArray.push({"title":"项目风险评估：","word":'参见<a href="/mobile/productProtocolApp.shtml?type=fengxianjieshishu_0710">《风险揭示书》</a>'});
					}
			 		
			 		
			 		
			 		
			 	}

			})
		}
		
		/*var dateNow10=this.getDateTime(10);
		showArray.push({"title":"募集期截止日","word":dateNow10});*/
		
		return  showArray;
	},
	borrowDetailsHtml:function(data){
		var self=this;
		
		/*shareholderInfoList数据处理*/
		/*shareholderInfoList=data["shareholderInfoList"];
		
		
		if(shareholderInfoList && shareholderInfoList.length!=0){
			var shareholderTypeList=[];
			var shareholderNameList=[];
			var shareholderIdTypeList=[];
			$.each(shareholderInfoList, function(i,v) {
				shareholderTypeList.push(shareholderInfoList[i].shareholderType);
				shareholderNameList.push(shareholderInfoList[i].shareholderName);
				shareholderIdTypeList.push(shareholderInfoList[i].shareholderIdType);
			});
			shareholderTypeList=$.unique(shareholderTypeList);  
			shareholderNameList=$.unique(shareholderNameList); 
			shareholderIdTypeList=$.unique(shareholderIdTypeList); 
			data["shareholderType"]=shareholderTypeList.join("/")?shareholderTypeList.join("/"):null;
			data["shareholderName"]=shareholderNameList.join(";")?shareholderNameList.join(";"):null;
			data["shareholderIdType"]=shareholderIdTypeList.join("/")?shareholderIdTypeList.join("/"):null;*/
		
		/*shareholderInfoList数据处理:end*/
			
		var showArray=self.dataProcessing(data);
		var html="";

		html+='<ul>';
		 $.each(showArray,function(index,value){  		 	
            html+='<li>';
			html+='		<div class="tit">'+value.title+'</div>';
			html+='		<div class="word">'+value.word+'</div>';
			html+='</li>';
			
        });  
        html+='</ul>';
		return  html;
	},
	borrowDetails:function(pageNum){
		var self=this;
		var borrowerid=loan.getQueryString("borrowerid");
		var loadingHtml='<div class="loadingDiv"></div>';
		$.ajax({
	        url: '/webapi/borrowLoans/getBorrowLoansDetail/'+borrowerid,
	        type: 'get',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	        success: function (result) {
	        	loan.loadingHidden();
	            if (result.code== "1"){
	               var appendHtml=self.borrowDetailsHtml(result.data);
	               self.boxObj.append(appendHtml);
	            }else{
	            	loan.msgDialog(result.msg);
	            }
	        },
	        error: function(e) {
	        	loan.loadingHidden();
	        	loan.msgDialog(e);
	        }
	    })
	},
	agreementConShow:function(){
		var isWap=loan.getQueryString("type");
		if(isWap=="wap"){
			var storeCode=loan.getQueryString("storeCode");
			if(!storeCode){
			 	location.href="/mobile/gologin.shtml";
			 	return;
			}
		}
		dialog.show();
	},
	getDateTime:function(dayNum){
		var nowDate=new Date();
		dayNum=parseInt(dayNum);
		dateNumData=nowDate;
		dateNumData.setDate(dateNumData.getDate() +dayNum);
		var dateStr=dateNumData.getFullYear()+"年"+(parseInt(dateNumData.getMonth())+1)+"月"+dateNumData.getDate()+"日";
		return dateStr;
	}
	
	
}
var dialog={
	show:function(){
		$(".dialogBox").show();
		$('.ovrly').show();
	},
	hide:function(){
		$(".dialogBox").hide();
		$('.ovrly').hide();
	}
}

$(document).ready(function(){
	loanDetails.init($(".loanDetails"));  //判断是否为wap页面，显示头部
	$(".closeBtn").click(function(){dialog.hide()});
})