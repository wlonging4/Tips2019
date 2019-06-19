setNoHasAppBtn();		//app中没有定制规则
setWebTitle("定制预览");	//安卓必给
var dialogBox;
window.onload=function(){
	Loading.init();
	Tips.init();
	submitCustomInfo.init();
	var stepBtnApply=new stepButton({
		btnClass:".js_endOk",
		clickFn:function(){
			submitCustomInfo.load(function(){
				clearArrCookie(applyClearCookie);
				dialogBox.show();
				callBackBtnGoBackWebUrl();	//app返回按钮 返回 personalTailor.html页
			});			
		}
	})
	stepBtnApply.bindClickFn();
	var dialogDom=document.querySelector(".dialogBox");
	dialogBox=new Dialog({"dialogBox":dialogDom,"closeFn":function(){
		toAppCustomize();	//跳转我的工作室
	}});
	var previewData1=[
		{"name":"lenderName","tit":"定制用户","unit":""},
		{"name":"customName","tit":"产品名称 ","unit":""},
		{"name":"customRate","tit":"推荐服务费","unit":"%","class":"longShort"},
		{"name":"customAnnaulRate","tit":"用户参考年回报率","unit":"%","class":"longShort"}
	]
	var previewData2=[
		{"name":"customPeriodAndUnit","tit":"定制期限","unit":""},
		{"name":"customAmount","tit":"定制金额","unit":"万元"},
		{"name":"multipleRate","tit":"定制产品进阶打包回报率\<br\>（参考年回报率+推荐服务费）","unit":"%","class":"longShort"}
	]
	var preview1=new preview({
		"wrapperClass":".preview1",
		"previewData":previewData1
	});
	var preview2=new preview({
		"wrapperClass":".preview2",
		"previewData":previewData2
	});
	 btnShow();
}
function btnShow(){
	document.querySelector(".js_endOk").style.display="block";
}

function arrayToJson(postDataArr){
	var jsonObj={};
	for(var i=0; i<postDataArr.length; i++){
		var item=postDataArr[i];
		jsonObj[item]=getCookie(item);
	}
	
}
var preview=function(options){
	this.wrapperClass=options.wrapperClass;
	this.wrapperBox=document.querySelector(this.wrapperClass);
	this.previewData=options.previewData||[];
	this.init();
}
preview.prototype.init=function(){
	var dom=document.createElement("div");
	dom.classList.add("itemList");
	dom.classList.add("preview");
	dom.innerHTML=this.previewHtml();
	this.dom=this.wrapperBox.appendChild(dom);
}
preview.prototype.previewHtml=function(){
	var list=this.previewData;
	var htmlArr=[];
	for(var i=0; i<list.length; i++){
		var listItem=list[i];
		var itemClass=listItem.class?listItem.class:"";
		var itemTit=listItem.tit;
		var itemValue=getCookie(listItem.name);
		var itemUnit=listItem.unit
		if(listItem.name=="customAmount" && !!itemValue){
			itemValue=parseInt(itemValue)/10000;
		}
		var html=['<div class="item '+itemClass+'">',
					'<div class="tit">',
						'<label>'+itemTit+'</label>',
					'</div>',
					'<div class="infoWord">',
						itemValue+itemUnit,
					'</div>',
				'</div>'].join("");
		htmlArr.push(html);
	}
	return htmlArr.join("");
	
		
}

var submitCustomInfo={
	token:"aaaa",
	init:function(){
		var self=this;
		self.token=getCookie("token")?getCookie("token"):"";
	/*	self.load();*/
	},
	load:function(callBack){
		/*location.href="personalTailorEdit1.html";*/
		var self=this;
		var ajaxSucc=false;
		Loading.show();
		
		var postData=self.getPostData();
		postData={"appReqData":postData,"token":self.token}
		self.postData=postData;
		self.postData=JSON.stringify(self.postData);

		//03.提交定制申请
		$.ajax({
		    url: '/webapi/custom/submitCustomInfo.ason',		//接口wiki:http://wiki.creditease.corp/pages/viewpage.action?pageId=15339463
		    type: 'post',
		    async: true,
		    data:{
		    	data:self.postData
		    },
		    dataType: 'JSON',
		    timeout:15000,
		    cache:false, 
		    success: function (result) {
		    	Loading.hide();
		        if (result.code== "1"){
		        	callBack();
		        }else{
		        	Tips.show(result.msg);
		        }
		    },
		    error: function(e) {
		    	Loading.hide();
		    },
		    complete: function (XMLHttpRequest,status) {
		    	Loading.hide();
		    	if(status=="success"){
		    		return;
		    	}
		 
                if(status == 'timeout' || (XMLHttpRequest.readyState==4&&status=="error") || XMLHttpRequest.readyState==0 || XMLHttpRequest.readyState==1) {
                  Tips.show("网络出现异常,请稍后重试");
                }else{
                	Tips.show("服务器异常");
                }
            }
		})
		
	},
	getPostData:function(){
		var self=this;
		var postDataArr=["token","lenderId","customName","customRate","customAnnaulRate","customPeriod","customPeriodUnit","customAmount","multipleRate","productCode"];
		postData=self.arrayToJson(postDataArr);
		return postData;
	},
	arrayToJson:function(postDataArr){
		var jsonObj={};
		for(var i=0; i<postDataArr.length; i++){
			var item=postDataArr[i];
			jsonObj[item]=getCookie(item);
			
		}
		return  jsonObj;
	}

}
