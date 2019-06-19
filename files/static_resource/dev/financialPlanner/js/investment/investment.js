setCookie("swiperActiveIndex",0); //项目详情页  tabs回显
bottomLoading.init();	//加载更多init
var investmentList={
	//投资移民 列表
	channel:investment.getQueryString("appType")=="finance"?"2":"3",
	pageNo:1,
	pageSize:10,
	domBody:document.querySelector("body"),
	listEmpty:"listEmpty",
	immigrationData:function(){
		var self=this;
		return {"proTypeId":"5","channel":self.channel,"pageSize":self.pageSize,"pageNo":self.pageNo};
	},
	overseasData:function(){
		var self=this;
		return {"proTypeId":"6","channel":self.channel,"pageSize":self.pageSize,"pageNo":self.pageNo};
	},
	pageNoProcessing:function(){
		var self=this;
		self.pageNo=self.pageNo+1;
	},
	immigrationList:function(){
		var self=this;
		bottomLoading.bodyScrollUnBind();
		this.ajaxData({"ajaxUrl":self.immigrationAjaxUrl,"data":self.immigrationData()}).then(function(data){	
			if(data.code=="1"){
		   		self.listHtml(data.data.items);
		   		self.pageTotal=data.data.totalPage;
		   		self.totalRecord=data.data.totalRecord;
		   		if(self.totalRecord<=9){	
		   			return;
		   		}else if(self.pageNo<self.pageTotal){
		   			self.pageNoProcessing();
		   			bottomLoading.bottomLoadShow();
		   			bottomLoading.bodyScrollBind(immigrationBodyScroll);
		   		} else{
		   			bottomLoading.bottomLoadHide();
		   		}
		    }
		},function(data){
			/*列表为空*/
			if(self.pageNo==1){
				self.ajaxError();
			}
			
		});
	},
	//海外配置 列表
	overseasList:function(){
		var self=this;
		bottomLoading.bodyScrollUnBind();
		this.ajaxData({"ajaxUrl":self.overseasAjaxUrl,"data":self.overseasData()}).then(function(data){
			/*self.ajaxError();*/
			if(data.code=="1"){
		   		self.listHtml(data.data.items);
		   		self.pageTotal=data.data.totalPage;
		   		self.totalRecord=data.data.totalRecord;
		   		if(self.totalRecord<=9){	
		   			return;
		   		}else if(self.pageNo<self.pageTotal){
		   			self.pageNoProcessing();
		   			bottomLoading.bottomLoadShow();
		   			bottomLoading.bodyScrollBind(overseasBodyScroll);
		   		} else{
		   			bottomLoading.bottomLoadHide();
		   		}
		   	}/*else if(){
		   		self.ajaxError();
		   	}*/
		},function(data){
			/*列表为空*/
			if(self.pageNo==1){
				self.ajaxError();
			}
		});
	},
	//app 类型
	ajaxError:function(){
		var self=this;
		self.domBody.classList.add(self.listEmpty);
	},
	detailsPageType:investment.getQueryString("appType")=="finance"?"finance":"lend", //appType=finance 理财师端；appType=lend 出借人端
	immigrationAjaxUrl:"/webapi/goodhopesubject/getList",//投资移民 列表 url
	overseasAjaxUrl:"/webapi/goodhopesubject/getList",//海外配置 列表 url
	appendBoxClass:".js_list_item",
	listHtml:function(data){
		var self=this;
		var htmlArr=[];
		if(data.length==0 && self.pageNo==1){
			self.ajaxError();
		}
		/*data=self.dataProcessing(data);*/
		for(var i=0; i<data.length; i++){
			countryList=data[i];
			
			/*国家html*/
			var countryStr=countryList.country;//国家名
			
			if(self.lastCountry!=countryStr){
				self.lastCountry=countryStr;
				var countryHtml=self.countryHtml(countryStr);
				htmlArr.push(countryHtml);  //国家dom
			}
			/*国家对应items 列表*/
			var items=countryList.res;
			var itemsHtml=self.itemsHtml(items);
			htmlArr.push(itemsHtml);
		
			
		}

		var appendBox=document.createElement("div");
		appendBox.innerHTML=htmlArr.join("");
		document.querySelector(self.appendBoxClass).appendChild(appendBox);
	},
	countryHtml:function(countryStr){
		var countryHtml=[ 
				'<div class="country">',
				'	<span>'+countryStr+'</span>',
				'</div>'
			];
			
		return countryHtml.join("");
	},
	newWebView:function(options){
		newWebview(options);
	},
	itemsHtml:function(data){
		var self=this;
		var items=[];
		for(var i=0; i<data.length; i++){
			var item=data[i];
			var appNemWebUrl="/h5static/financialPlanner/investment/investmentDetails.html?appType="+self.detailsPageType+"&id="+item.id;

			var htmlItem=[
				'<div class="item">',
				/*'		<a href="./investmentDetails.html?appType='+self.detailsPageType+'&id='+item.id+'">',*/  //详情页
				'		<a onclick="investmentList.newWebView({url:\''+appNemWebUrl+'\'})">',
				'			<div class="itemCon">',
				'				<div class="imgBox">',
				'					<img src="'+item.subimage+'" onload="investmentList.loadImage(this);"/>', /*src="../../financialPlanner/images/investment/defaultImg.jpg" data-*/
				'				</div>',
				'				<div class="infoBox">',
				'					<div class="infoWord">',
				'						<span>'+item.subtitle+'</span>',
				'					</div>',
				'				</div>',
				'			</div>',
				'		</a>',
				'	</div>'
			];
			items.push(htmlItem.join(""));
		}
		return items.join("");
	},
	loadImage:function(thisObj){
		thisObj.classList.add("show");
	},
	ajaxData:function(options){
		
		var self=this;

		return $.ajax({
	        url: options.ajaxUrl,
	        type: 'get',
	        async: true,
	        cache:false,
	        timeout : 20000,	
	        dataType: 'JSON',
	        data:options.data
	    })
	}
	
	
}

function immigrationBodyScroll(){
	investmentList.immigrationList();
}

function overseasBodyScroll(){
	investmentList.overseasList();
}
