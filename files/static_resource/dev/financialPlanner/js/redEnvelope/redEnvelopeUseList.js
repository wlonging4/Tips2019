//appSmallBellBtn();  //右上角小铃铛
apphasHeader();  //app有头，方便处理

Tips.init();
Loading.init();

var useList={
	pageNo:1,
	pageSize:20,
	init:function(headerBox,listBox){
		this.headerBox=headerBox;
		this.listBox=listBox;
		
		/*详情*/
		this.headData();
		/*list 首次加载*/
		this.listData();
		
		
		
	/*	this.bodyScrollBind();*/
	},
	headData:function(){
		var self=this;
		var ajaxData={};
		var redPacketStoreId=self.redPacketStoreId;
		var postDataStr=JSON.stringify({"redPacketStoreId":redPacketStoreId});
		xhReqDataHandleFn(postDataStr,useList,"loadData");
	},
	/*redPacketTemplateId:getQueryString("redPacketTemplateId")?getQueryString("redPacketTemplateId"):"",*/
	redPacketStoreId:getQueryString("redPacketId")?getQueryString("redPacketId"):getQueryString("redPacketStoreId"), /*redPacketId 安卓  redPacketStoreId ios*/
	redPacketId:getQueryString("redPacketTemplateId")?getQueryString("redPacketTemplateId"):"",
	loadData:function(ajaxData){
		var self=this;
		/*var ajaxData={"appReqData":{"redPacketStoreId":3035270,"repeatTimeId":35},"sign":"33D382E308096AEF639F592685CCAB4E","appid":"8aead9a64cc04c8b014cc04c8b1e0000","appVersion":"2.8.7","token":"5714ff24824f5e6b520c0e86c7edc2eb","version":"2.0.0"};*/
		/*var ajaxData={"appReqData":{"redPacketStoreId":2989723,"repeatTimeId":157},"sign":"1299DEB20DC0C0EB5901CE7803085316","appid":"8aead9a64cc04c8b014cc04c8b1e0000","appVersion":"2.8.7","token":"5714ff24824f5e6b520c0e86c7edc2eb","version":"2.0.0"};*/
		/*ajaxData=JSON.stringify(ajaxData);*/
		ajaxData={"data":ajaxData};
		$.ajax({
	        url: '/webapi/capp/redpacket/store/get.ason',
	        type: 'POST',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	        data:ajaxData,
	        success: function (result) {
	        	/*loan.loadingHidden();*/
	            if (result.code== "1"){
	            	
	            	result.data.redPacketStoreId=self.redPacketStoreId;
	            	useList.headerHtml(result.data);
	            	
	            	/*appSetWebTitle(result.data.redName);*/	//标题红包名称
	            	var appTitle=result.data.redName;
	            	appSetWebTitle(appTitle);
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
	listData:function(){
		var self=this;
		var ajaxData={};
		var redPacketStoreId =self.redPacketStoreId ;
		var redPacketId=self.redPacketId;
		var postDataStr=JSON.stringify({"redPacketStoreId":redPacketStoreId,"redPacketId":redPacketId,"pageNo":self.pageNo,"pageSize":self.pageSize});
		xhReqDataHandleFn(postDataStr,useList,"loadList");
	},
	loadList:function(ajaxData){
		/*alert(ajaxData);*/
		var self=this;
		/*var ajaxData={"appReqData":{},"sign":"2F752BE1907CB3E0226214E8CAE098F0","appid":"8aead9a64cc04c8b014cc04c8b1e0000","appVersion":"2.8.7","token":"5714ff24824f5e6b520c0e86c7edc2eb","version":"2.0.0"};*/
		/*var ajaxData={"appReqData":{"redPacketStoreId":2989723,"redPacketId":157,"pageNo":1,"pageSize":20},"sign":"CB54C9BEBF08C5B0DFACF8C4F04F7B1B","appid":"8aead9a64cc04c8b014cc04c8b1e0000","appVersion":"2.8.7","token":"5714ff24824f5e6b520c0e86c7edc2eb","version":"2.0.0"};*/
		/*var ajaxData={"appReqData":{"redPacketId":157,"pageNo":1,"pageSize":20},"sign":"CB54C9BEBF08C5B0DFACF8C4F04F7B1B","appid":"8aead9a64cc04c8b014cc04c8b1e0000","appVersion":"2.8.7","token":"d3dc5c3342b1e11c12e21a4ca5412a4f","version":"2.0.0"};*/
		/*var ajaxData={"appReqData":{"redPacketStoreId":2989723,"redPacketId":157,"pageNo":1,"pageSize":20},"sign":"1299DEB20DC0C0EB5901CE7803085316","appid":"8aead9a64cc04c8b014cc04c8b1e0000","appVersion":"2.8.7","token":"5714ff24824f5e6b520c0e86c7edc2eb","version":"2.0.0"};*/
		
		/*ajaxData=JSON.stringify(ajaxData);*/
		ajaxData={"data":ajaxData};
		this.bodyScrollUnBind();
		$.ajax({
	        url: '/webapi/capp/redpacket/store/redPacketUse.ason',
	        type: 'POST',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	        data:ajaxData,
	        success: function (result) {
	        	/*loan.loadingHidden();*/
	            if (result.code== "1"){
	            	if(result.data.list.length==0){
	            		return;
	            	}
	            	useList.listHtml(result.data.list);
	            	
	            	if(self.pageNo==result.data.totalPage || self.pageNo>result.totalPage){
	            		self.bottomLoadHide();
	            	}else{
	            		self.bodyScrollBind();
	            		self.pageNo=self.pageNo+1;
	            	}
	            	
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
	headerHtml:function(data){
		this.headerBox.innerHTML= (tmpl("js_headerTmpl", {item:data} )) ;
	},
	listHtml:function(lists){
		for(var i=0; i<lists.length; i++){
			lists[i].lastGetTime=this.getDateYYMMDD(lists[i].lastGetTime);
		}
		
		
		this.listBox.innerHTML+= (tmpl("js_listTmpl", {items:lists} )) ;
	},
	dataProcess:function(data){
		
	},
	bottomLoadShow:function(){	//加载更多显示
		$(".loadingBox").removeClass("hide");
		$(".loadingBox").addClass("show");
	},
	bottomLoadHide:function(){	//加载更多隐藏
		$(".loadingBox").removeClass("show");
		$(".loadingBox").addClass("hide");
	},
	bodyScroll:function(){
		var self=this;
		self.bottomLoadShow();
		var scrollTop =document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop; //滚动条高度
		var htmlHeight=document.documentElement.scrollHeight;		//页面总高度
		var clientHeight=document.documentElement.clientHeight; //页面可视高度
		
		if(scrollTop+clientHeight>htmlHeight-60){  //滚动到底部
			self.listData();
		}
	},
	bodyScrollBind:function(){
		document.addEventListener('scroll',bodyScroll,false);
	},
	bodyScrollUnBind:function(){
		document.removeEventListener('scroll',bodyScroll,false);
	},
	getDateYYMMDD:function(dateTime){
		dateObj=new Date(dateTime);
		dateYear=dateObj.getFullYear();
		dateMon=dateObj.getMonth()+1;
		dateMon=dateMon<10?"0"+dateMon:dateMon;
		dateDay=dateObj.getDate();
		dateDay=dateDay<10?"0"+dateDay:dateDay;
		
		dateStr=dateYear+"-"+dateMon+"-"+dateDay;
		return dateStr;
	}
}
function bodyScroll(){
	useList.bodyScroll();
}

window.onload=function(){	
	var headerBox=document.querySelector(".js_header");		//详情 box
	var listBox=document.querySelector(".js_list");		//详情 box
	
	var result={data:{list:[{"realName":"aaa","getCount":1,"useCount":11,"lastGetTime":"yyyy-MM-dd"},{"realName":"bbb","getCount":2,"useCount":22,"lastGetTime":"yyyy-MM-dd"},{"realName":"ccc","getCount":3,"useCount":33,"lastGetTime":"yyyy-MM-dd"},{"realName":"ddd","getCount":4,"useCount":44,"lastGetTime":"yyyy-MM-dd"}]}};
	
	useList.init(headerBox,listBox);
	/*useList.listHtml(result.data.list);*/
	
/*	var result={data:{"redPacketTemplateId":"4444","useCount":11,"repeatStartTime1":"201X-01-01 至 201X-01-01 每日上午10:00开抢","repeatStartTime":"2018-07-24 10:00:00","grabStatus":1,"redCount":10,"putCount":1,"canGetCount":12,"status":1,fullCutAmount:"100","redAmount":"10","effectiveEndTimeStr":"2018-XX-XX","productNames":"适用产品1、适用产品2、适用产品2、适用产品4、适用产品5、适用产品6",activityExplain:"活动说明活动说明活动说明活动说明活动说明活动说明活动说明活动说明活动说明"}}
	useList.headerHtml(result.data);*/
}
