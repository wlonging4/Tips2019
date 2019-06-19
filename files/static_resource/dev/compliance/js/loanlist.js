var loanlist={
	init:function(listBoxObj){
		this.listBoxObj=listBoxObj;
		this.pageNum=1;
		this.totalPage;
		this.borrowLoansList(1); //加载首页
		
	},
	dataProcessing:function(data){
		var detailTitle=[
			{"borrowerTypeCode":"借款人类型","type":""},
			{"borrowerName":"借款人","type":""},/*借款人姓名*/
		/*	{"corpFullName":"借款人","type":"1"},*//*corpFullName 企业全称*/
			{"loanPurpose":"借款用途","type":""},
			{"loanAmount":"借款金额","type":""}
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
		var jsonStr={}
		for(var i=0; i<detailTitle.length; i++){
			$.each( detailTitle[i],function(index,value){ 
				if(index=="type"){
					return;
				}
				
				var detailTitleObj=detailTitle[i];
				var tit=detailTitleObj[index];
				var dataStr=data[index]==null?"保密":data[index];
				if(index=="loanAmount"  && !isNaN(dataStr)){
					dataStr=parseFloat(dataStr).toFixed(2);
				}
				if(index=="loanAmount"  && !isNaN(dataStr)){
					dataStr=dataStr+"元";
				}
				
				showArray.push({"title":tit,"word":dataStr});	
			})
		}
		jsonStr={"id":data.id,"data":showArray};
		return jsonStr;
		
	},
	borrowLoansListHtml:function(data){
		var self=this;
		var showArray=[];
		$.each(data,function(index,value){  		
            showArray.push(self.dataProcessing(data[index]));
        });  
		var html="";
		for(var i=0; i<data.length; i++){
			var id=showArray[i].id;
			var typeStr=loan.getQueryString("type")?loan.getQueryString("type"):'';
			var storeCode=loan.getQueryString("storeCode")?loan.getQueryString("storeCode"):'';
			html+='<a href="/h5static/compliance/page/loanDetails.html?borrowerid='+id+'&type='+typeStr+'&storeCode='+storeCode+'">';
			html+='<div class="item">';
			html+='			<ul>';
			$.each(showArray[i].data,function(index,value){  		 	
	            html+='<li>';
				html+='	<span class="tit">'+value.title+':&nbsp;</span>';
			    html+='	<span class="word">'+value.word+'</span>';
				html+='</li>';
				
	        });  
			html+='				</ul>';
			html+='				<div class="arrowIcon"></div>';
			html+='			</div>';
			html+='		</a>';
		}
	
		return  html;
	},
	borrowLoansList:function(pageNum){
		var self=this;
		var ajaxData = {pageNo: self.pageNum,pageSize:20};
		if(self.pageNum==self.totalPage){
			return
		}
		self.bodyScrollUnBind();
		loan.loadingShow();
		$.ajax({
	        url: '/webapi/borrowLoans/borrowLoansList',
	        type: 'POST',
	        async: true,
	        cache:false,
	        dataType: 'JSON',
	        data:ajaxData,
	        success: function (result) {
	        	loan.loadingHidden();
	            if (result.code== "1"){
	            	result=result.data;
	                var appendHtml=self.borrowLoansListHtml(result.results);
	                self.pageNum=parseInt(result.pageNo)+1;
	                /*self.totalPage=result.totalPage;*/
	                self.listBoxObj.append(appendHtml);
	      
	                if(result.pageNo==result.totalPage){
	               		self.bottomLoadHide();
	                }else{
	                	loanlist.bodyScrollBind();
	                }
	              
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
	bottomLoadShow:function(){
		$(".loadingBox").removeClass("hide");
		$(".loadingBox").addClass("show");
	},
	bottomLoadHide:function(){
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
			self.borrowLoansList(self.pageNum);
		}
	},
	bodyScrollBind:function(){
		document.addEventListener('scroll',bodyScroll,false);
	},
	bodyScrollUnBind:function(){
		document.removeEventListener('scroll',bodyScroll,false);
	}
	
}
function bodyScroll(){
	loanlist.bodyScroll();
}
$(document).ready(function(){
	loanlist.init($(".loanList"));  //判断是否为wap页面，显示头部
})