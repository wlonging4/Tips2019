var loanDetails={
	init:function(boxObj){
		this.boxObj=boxObj;
		this.borrowDetails();
	},
    loanTemplate: function(){
		var str = '';
        str += '<li><div class="tit">借款人类型：</div><div class="word"><% this.data.borrowerTypeCode === "0"?"自然人":"法人" %></div></li>';
        str += '<li><div class="tit">借款人：</div><div class="word"><% this.data.borrowerName %></div></li>';
        str += '<li><div class="tit">证件号码：</div><div class="word"><% this.data.borrowerIdNumber %></div></li>';
        str += '<% if(this.data.borrowerTypeCode === "0"){ %>';
        str += '<li><div class="tit">工作性质：</div><div class="word"><% this.data.workCase %></div></li>';
        str += '<% }else{ %>';
        str += '<li><div class="tit">所属行业：</div><div class="word"><% this.data.corpIndustry %></div></li>';
        str += '<% } %>';
        str += '<li><div class="tit">收入情况：</div><div class="word"><% this.data.incomeSource %></div></li>';
        str += '<li><div class="tit">负债情况：</div><div class="word"><% this.data.debtCase %></div></li>';
        str += '<li><div class="tit">在本平台逾期总次数：</div><div class="word"><% this.data.overdueNumber %></div></li>';
        str += '<li><div class="tit">在本平台逾期总金额：</div><div class="word"><% this.data.overdueAmount %></div></li>';
        str += '<li><div class="tit">截至借款前6个月内借款人<br />在征信报告中的逾期情况：</div><div class="word"><% this.data.otherReportInfo %><br /><br /></div></li>';
        str += '<li><div class="tit">在其他网络借贷平台借款情况：</div><div class="word"><% this.data.otherNetloanCase %></div></li>';
        str += '<li><div class="tit">在其他金融机构借款情况：</div><div class="word"><% this.data.otherFinanceCase %></div></li>';
        str += '<% if(this.data.borrowerTypeCode === 1){ %>';
        str += '<li><div class="tit">注册资本：</div><div class="word"><% this.data.corpRegCapital %></div></li>';
        str += '<li><div class="tit">注册地址：</div><div class="word"><% this.data.corpRegAddr %></div></li>';
        str += '<li><div class="tit">成立时间：</div><div class="word"><% this.data.corpFoundingTime %></div></li>';
        str += '<li><div class="tit">法人代表：</div><div class="word"><% this.data.corpRepName %></div></li>';
        str += '<li><div class="tit">股东信息：</div><div class="word"><% this.data.corpSharehoder %></div></li>';
        str += '<li><div class="tit">法定代表人信息：</div><div class="word"><% this.data.corpSharehoder %></div></li>';
        str += '<li><div class="tit">实缴资本：</div><div class="word"><% this.data.corpRealCapital %></div></li>';
        str += '<li><div class="tit">办公地点：</div><div class="word"><% this.data.corpOfficeAddr %></div></li>';
        str += '<li><div class="tit">经营区域：</div><div class="word"><% this.data.corpManageArea %></div></li>';
      str += '<% } %>';
        str += '<li><div class="tit">募集期截止日：</div><div class="word"><% this.data.raiseEndTime %></div></li>';
        str += '<li><div class="tit">项目名称：</div><div class="word"><% this.data.projectName %></div></li>';
        str += '<li><div class="tit">项目简介：</div><div class="word"><% this.data.projectIntroduce %></div></li>';
        str += '<li><div class="tit">借款金额：</div><div class="word"><% this.data.loanAmount %>元</div></li>';
        str += '<li><div class="tit">借款期限：</div><div class="word"><% this.data.loanExpire %>个月</div></li>';
        str += '<li><div class="tit">借款用途：</div><div class="word"><% this.data.loanPurpose %></div></li>';
        str += '<li><div class="tit">还款方式：</div><div class="word"><% this.data.refundType %></div></li>';
        str += '<li><div class="tit">借款年利率：</div><div class="word"><% this.data.loanRatio %></div></li>';
        str += '<li><div class="tit">起息日：</div><div class="word"><% this.data.valueDate %></div></li>';
        str += '<li><div class="tit">还款来源：</div><div class="word"><% this.data.repaySource %></div></li>';
        str += '<li><div class="tit">保障措施：</div><div class="word"><a href="javascript:void(0);" onclick="loanDetails.agreementConShow()">保障计划</a></div></li>';
        str += '<li><div class="tit">项目风险评估：</div><div class="word">参见<a href="/mobile/productProtocolApp.shtml?type=sanbiao_fengxianjieshishu190610">《风险揭示书》</a></div></li>';
        str += '<li><div class="tit">项目撮合进度：</div><div class="word"><% this.data.projectProgress %></div></li>';
        str += '<li><div class="tit">相关费用：</div><div class="word"><% this.data.relationAmount %></div></li>';
        str += '<li><div class="tit">合同模版：</div><div class="word">参见<a href="/mobile/productProtocolApp.shtml?type=sanbiao_jiekuanxieyi190610">《借款协议》</a></div></li>';
        str += '<li><div class="tit">出借人适当性管理提示：</div><div class="word"><% this.data.borrowerManage %></div></li>';
        return str;
	},
	borrowDetails:function(){
		var self=this;
		var loanCode=loan.getQueryString("loanCode");
		$.ajax({
	        url: '/webapi/borrowLoans/getScatteredLoanDetail/'+loanCode,
	        type: 'get',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	        success: function (result) {
	        	loan.loadingHidden();
	            if (result.code== "1"){
                    loan.templateEngine({
                        template:self.loanTemplate(),
                        obj:{data:result.data},
                        container: '#loanDetails'
                    });
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
