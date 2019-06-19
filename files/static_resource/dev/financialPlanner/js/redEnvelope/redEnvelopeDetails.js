appSmallBellBtn();    //小铃铛

Tips.init();
Loading.init();

/*redPacketStoreId    repeatTimeId     redPacketTemplateId*/
var redEnvelopeDetails={
	types:"",	//grab:抢满减券 sent：发满减券
	redPacketStoreId:getQueryString("redPacketStoreId")?getQueryString("redPacketStoreId"):"",		/*满减券id*/
	repeatTimeId:getQueryString("repeatTimeId")?getQueryString("repeatTimeId"):"",					/*抢满减券计划id*/
	redPacketTemplateId:"",
	init:function(conboxObj,bottomBoxObj){
		this.types="sent"; // "sent" "grab"
		this.types=getQueryString("type")?getQueryString("type"):"sent";
		this.types=(this.types=="grab")?"grab":"sent";  /*sent send*/
		/*this.loadData();*/
		this.detailBox=conboxObj;
		this.bottomBoxObj=bottomBoxObj;
		
		var self=this;
		var ajaxData={};
		var redPacketStoreId=self.redPacketStoreId;
		var repeatTimeId=self.repeatTimeId;
		var postDataStr=JSON.stringify({"redPacketStoreId":redPacketStoreId,"repeatTimeId":repeatTimeId});
		xhReqDataHandleFn(postDataStr,redEnvelopeDetails,"loadData");
	},
	loadData:function(ajaxData){
		var self=this;
		//抢满减券
		if(this.types=="grab"){
			/* wiki:http://wiki.creditease.corp/pages/viewpage.action?pageId=15344916 */
			self.ajaxUrl='/webapi/capp/redpacket/store/getGrabDetail.ason';/*抢满减券 详情页 接口*/
		//发满减券
		}else if(this.types=="sent"){
			/*wiki:http://wiki.creditease.corp/pages/viewpage.action?pageId=15341343*/
			self.ajaxUrl='/webapi/capp/redpacket/store/get.ason';	/*发满减券 详情页 接口*/
		}
		ajaxData={data:ajaxData}
		
		$.ajax({
	        url: self.ajaxUrl,
	        type: 'POST',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	        data:ajaxData,
	        success: function (result) {
	            if (result.code== "1"){
	            	self.redPacketTemplateId=result.data.redPacketTemplateId;
	            	redEnvelopeDetails.detailsHtml(result.data);
	            	self.successDialogCreateFn();
	            }else if(result.code=="5001"){
	            	appToLogin();
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
	grabSubmit:function(){
		var self=this;
		var ajaxData={};
		var redPacketStoreId=self.redPacketStoreId;
		var repeatTimeId=self.repeatTimeId;
		var postDataStr=JSON.stringify({"repeatId":repeatTimeId});
		xhReqDataHandleFn(postDataStr,redEnvelopeDetails,"submitFn");
	},
	submitFn:function(ajaxData){
		ajaxData={"data":ajaxData};

		var ajaxUrl='/webapi/capp/redpacket/store/grab.ason';/*抢满减券 详情页 接口*/
		Loading.show();
		$.ajax({
	        url: ajaxUrl,
	        type: 'POST',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	        data:ajaxData,
	        success: function (result) {
	        	Loading.hide();
	        	/*loan.loadingHidden();*/
	            if (result.code== "1"){
	            	 var sucWordStr="恭喜成功抢到"+result.data.count+"个满减券";
    				successDialog.setContent(sucWordStr);
	            	successDialog.open();	//满减券详情
	            }else if(result.code=="605001"){
	            	erroDialog.open();
	            }else if(result.code=="605004"){
	            	Tips.show("请重新尝试");
	            }else if(result.code=="5001"){
	            	appToLogin();
	            }else{
	            	Tips.show(result.msg);
	            }
	            
	            
	        },
	        error: function(e) {
	        	Loading.hide();
	        	/*loan.loadingHidden();
	        	loan.msgDialog(e);*/
	        }
	    })
	},
	loadDetails:function(){
		
	},
	btnWord:{"sentStatus1":{"btnTxt":"立即发放","onclickFn":"appToSendRed()"},  //发满减券页
			"sentStatus2":{"btnTxt":"已过期","onclickFn":""},
			"grabStatus1":{"btnTxt":"立即抢","onclickFn":"redEnvelopeDetails.grabSubmit()"},  
			"grabStatus3":{"btnTxt":"已抢","onclickFn":""},
			"grabStatus4":{"btnTxt":"抢光了","onclickFn":""},
			"grabStatus5":{"btnTxt":"距离开抢","onclickFn":""}
	},
	dataProcess:function(data){
		var self=this;
		var returnData=data;
		var btnStatuStr="";
		var btnDisable=false;
		//抢满减券详情页
		if(this.types=="grab"){
			btnStatuStr=this.types+"Status"+data.grabStatus;
			if(data.grabStatus==3 || data.grabStatus==4){
				btnDisable=true;
				returnData.canGetCount=0;
			};

		//发满减券详情页
		}else if(this.types=="sent"){
			btnStatuStr=this.types+"Status"+data.status;
			var remainingNum=parseInt(data.redCount)-parseInt(data.putCount);	//剩余满减券数
			this.remainingNum=remainingNum;
			returnData.remainingNum=remainingNum;
			btnDisable=(data.status==2||remainingNum<=0);
		}
		returnData.types=this.types;
		returnData.btnWord=this.btnWord[ btnStatuStr ].btnTxt;		//按钮显示文字
		returnData.onclickFn=this.btnWord[ btnStatuStr ].onclickFn;	//点击方法  btnWord
		
		if(returnData.onclickFn=="appToSendRed()"){
			//if(remainingNum<=0){return false;}
			returnData.onclickFn="appToSendRed('"+this.redPacketStoreId+"','"+this.redPacketTemplateId+"','"+this.remainingNum+"')";
		}

        /*按钮提示文字： 抢满减券 倒计时：end*/
        if(data.fullCutAmount==0 || data.fullCutAmount==null){										//fullCutAmount==0 不限 满减
            returnData.fullCutAmount="不限金额"; //fullCutAmount为0 不限金额
        }else{
            returnData.fullCutAmount="满"+returnData.fullCutAmount+"元可用";
        }
        returnData.btnClass=btnDisable?"disabled":"";

		/*按钮提示文字： 抢满减券 倒计时 按钮提示*/
		if(data.grabStatus==5 && this.types=="grab"){
			returnData.btnWord=this.btnWord[ btnStatuStr ].btnTxt+"&emsp;<span class='js_timingStr'>"+this.strToSeconds(data.countdown)+"</span>";
			this.countdown=data.countdown;
			setInterval(function(){
				redEnvelopeDetails.countdown=parseInt( redEnvelopeDetails.countdown)-1;
				var timeStr=redEnvelopeDetails.strToSeconds(redEnvelopeDetails.countdown);
				if(timeStr.indexOf('-')>-1){
					timeStr='';
                    redEnvelopeDetails.dataTimeNowChange(timeStr);
                    //returnData.btnWord='立即抢';
                    document.querySelector(".btnBox a").innerHTML='立即抢';
                    //returnData.onclickFn="redEnvelopeDetails.grabSubmit()";
                    document.querySelector(".btnBox").addEventListener('click',function(){
                        redEnvelopeDetails.grabSubmit();
					});
                    //return returnData;
				}
				redEnvelopeDetails.dataTimeNowChange(timeStr);
			},1000)
		}
        return returnData;
	},
	detailsHtml:function(data){
		var detailsArr=[];
		data=this.dataProcess(data);
		//修改关联产品逗号变顿号
		if(data.productNames){data.productNames=data.productNames.replace(/,/g, '、')}
		this.detailBox.innerHTML=tmpl("detailTop",{item:data});
		
		if(getQueryString("btnState")!="noBtn"){	//满减券使用列表 跳转
			this.bottomBoxObj.innerHTML=tmpl("detailBottom",{item:data});
		}else{
            this.bottomBoxObj.innerHTML=tmpl("detailBottomHideBtn",{item:data});
		}
	},
	dataTimeNowChange:function(timeStr){
		document.querySelector(".js_timingStr").innerHTML=timeStr;
	},
	phoneEndTime:null,
	strToSeconds:function(countdown){
		
		if(!redEnvelopeDetails.phoneEndTime){
			countdown=parseInt(countdown);
			var phoneTime=new Date();
			var endTime=phoneTime.getTime() + countdown*1000;
			this.phoneEndTime=endTime;
			
		}
		
		var timingStr=redEnvelopeDetails.dataTimeNow(redEnvelopeDetails.phoneEndTime);
		
		return timingStr;
		/*var nowDate=new Date();
		var hours=Math.floor(countdown/60/60) ;
		countdown=countdown-hours*60*60;
		var minutes=Math.floor(countdown/60);
		seconds=countdown-minutes*60;
		minutes=minutes<10?"0"+minutes:minutes;
		seconds=seconds<10?"0"+seconds:seconds;
		hours=hours<10?"0"+hours:hours;
		var timingStr=hours+":"+minutes+":"+seconds;*/
		
		
	},
	dataTimeNow:function(dateTime){
		var date1=new Date();  //开始时间
		/*dateTime=dateTime.replace(/-/g,   "/");*/
		var date2=new Date(dateTime);    //结束时间
		var date3=date2.getTime()-date1.getTime();  //时间差的毫秒数
		var days=Math.floor(date3/(24*3600*1000));		 
		//计算出小时数
		var leave1=date3%(24*3600*1000);    //计算天数后剩余的毫秒数
		var hours=Math.floor(leave1/(3600*1000));
		//计算相差分钟数
		var leave2=leave1%(3600*1000);        //计算小时数后剩余的毫秒数
		var minutes=Math.floor(leave2/(60*1000));
		//计算相差秒数
		var leave3=leave2%(60*1000) ;     //计算分钟数后剩余的毫秒数
		var seconds=Math.round(leave3/1000);
		if(minutes==60){
			hours=hours+1;
			minutes=0;
		}
		if(seconds==60){
			minutes=minutes+1;
			seconds=0;
		}
		minutes=minutes<10?"0"+minutes:minutes;
		seconds=seconds<10?"0"+seconds:seconds;
		hours=days*24+hours;
		hours=hours<10?"0"+hours:hours;
		var timingStr=hours+":"+minutes+":"+seconds;
		return timingStr;
	},
	dataTimeNow1:function(dateTime){
		 //结束时间
		dateTime=dateTime.replace(/-/g,   "/")
	    var endDate = new Date(dateTime);
	    //当前时间
	    var nowDate = new Date();
	    //相差的总秒数
	    var totalSeconds = parseInt((endDate - nowDate) / 1000);
	    //天数
	    var days = Math.floor(totalSeconds / (60 * 60 * 24));
	    //取模（余数）
	    var modulo = totalSeconds % (60 * 60 * 24);
	    //小时数
	    var hours = Math.floor(modulo / (60 * 60));
	    modulo = modulo % (60 * 60);
	    //分钟
	    var minutes = Math.floor(modulo / 60);
	    //秒
	    var seconds = modulo % 60;
	    //输出到页面
	  	var dateStr= "还剩:" + days + "天" + hours + "小时" + minutes + "分钟" + seconds + "秒";
	  	return dateStr
	},
	appTitleArr:{
		"grab":"抢满减券",
		"sent":"发满减券",
		"hasSent":"已发满减券"
	},
	successDialogCreateFn:function(){
		var self=this;
		successDialog = new Dialog({
	        contentText : "恭喜成功抢到10个满减券",
	        isPromptbtn:true,
	        conisPromptText:["去发满减券","继续抢满减券"],
	        conisPromptClick:["appToSendRed('"+self.redPacketStoreId+"','"+self.redPacketTemplateId+"','"+self.remainingNum+"')","appToGrabRedEnvelope()"],
	        callback: function () {
	            var self = this;
	        }
	   });
	}

}
var successDialog;
var erroDialog;
window.onload=function(){
/*	xhReqDataHandleFn();*/

	/*var postDataStr=JSON.stringify({"redPacketStoreId":3035270,"repeatTimeId":35});
	xhReqDataHandleFn(postDataStr);*/
	
	var detailBox=document.querySelector(".js_detail");		//详情 box
	var bottomBox=document.querySelector(".js_mainBottom");		//详情 box
	redEnvelopeDetails.init(detailBox,bottomBox);
	
   /* var result={"data":{"count":60},"code":"1","msg":""};
    var sucWordStr="恭喜成功抢到"+result.data.count+"个满减券";
    successDialog.setContent(sucWordStr);
    successDialog.open();*/
    
    erroDialog = new Dialog({
        contentText : "很遗憾，您没有抢到满减券",
        isPromptbtn:true,
        conisPromptText:["知道了"],
        conisPromptClick:["appToGrabRedEnvelope()"],
        callback: function () {
            var self = this;
        }
    });
    /*erroDialog.open();*/
	
	/*var result={data:{"redPacketTemplateId":"4444","repeatStartTime1":"201X-01-01 至 201X-01-01 每日上午10:00开抢","repeatStartTime":"2018-07-24 10:00:00","grabStatus":1,"redCount":10,"putCount":1,"canGetCount":12,"status":1,fullCutAmount:"100","redAmount":"10","effectiveEndTimeStr":"2018-XX-XX","productNames":"适用产品1、适用产品2、适用产品2、适用产品4、适用产品5、适用产品6",activityExplain:"活动说明活动说明活动说明活动说明活动说明活动说明活动说明活动说明活动说明"}}
	redEnvelopeDetails.detailsHtml(result.data);*/
	
	/*appTitle*/
	var appTitle;
    if(getQueryString("btnState")!="noBtn") {	//满减券使用列表 跳转
        appTitle=redEnvelopeDetails.appTitleArr[redEnvelopeDetails.types];
    }else{
        appTitle=redEnvelopeDetails.appTitleArr['hasSent'];
	}
	appSetWebTitle(appTitle);

	/*Loading.show();
	
	setTimeout(function(){
		Loading.animationHide();
	},1900);
	*/
	
	
}
