setAppBtn(); 	//显示定制规则按钮
/*callBackBtnCloseWeb();*/	//返回按钮关闭webview
callBackBtnGoBackWeb();		//返回上一页
setWebTitle("填写定制信息");	//安卓必给
/*callBackBtnGoBackWebStep1()*/

var commrateRange={
	token:"aaaa",
	maxNum:"3.0",
	minNum:"1.0",
	init:function(){
		var self=this;
		self.token=getCookie("token")?getCookie("token"):"";
		self.load();
	},
	load:function(){
		/*location.href="personalTailorEdit1.html";*/
		var self=this;
		Loading.show();
		//测试数据
		/*var result={"data":{"commRange":{"maxCommrate":3.0,"minCommrate":1.2}},"code":"1","msg":""};
		//测试数据：end
		if (result.code== "1"){
			var item=result.data.commRange;
        	self.maxNum=item.maxCommrate;
        	self.minNum=item.minCommrate;
        }else{
        	Tips.show(result.msg);
        }*/
        self.getData={"appReqData":{},"token":self.token}
        self.getData=JSON.stringify(self.getData);
		//02.获取推荐服务费上下限
		$.ajax({
		    url: '/webapi/custom/commrateRange',		//接口wiki:http://wiki.creditease.corp/pages/viewpage.action?pageId=15339461
		    type: 'get',
		    async: true,
		    dataType: 'JSON',
		    data:{
		    	data:self.getData
		    },
		    cache:false, 
		    success: function (result) {
		    	Loading.hide();
		       	if (result.code== "1"){
					var item=result.data.commRange;
		        	self.maxNum=item.maxCommrate;
		        	self.minNum=item.minCommrate;
		        }else{
		        	/*Tips.show(result.msg);*/
		        }
		        self.dataBind();
		    },
		    error: function(e) {
		    	Loading.hide();
		    	self.dataBind();
		    	/*Tips.show(e);*/
		    }
		})
	},
	dataBind:function(){
		var totalNum=getCookie("multipleRate")?getCookie("multipleRate"):12;
		var rulerMax=parseFloat(commrateRange.maxNum).toFixed(1);
		var rulerMin=parseFloat(commrateRange.minNum).toFixed(1);
		var initNum=getCookie("customRate")?getCookie("customRate"):rulerMin;
		//调用此插件须输入两个参数，第一个为要注入标签的id名，第二个为他的参数对象，详情如下
		heartRuler=new Ruler("heart-contain",{
			maxNum:rulerMax,        	//最大数值
			minNum:rulerMin,			//最小数值
			initNum:initNum,     		//初始数值
			totalNum: totalNum,			//打包价
			decimalWei:"1",			//保留几位有效小数；默认为零
			cellNum:"1",			//两个大刻度的数值区间
			scaleWidth:"800",		//刻度宽 
			name:"推荐服务费",				//名称
			rateName: '参考年回报率',
			unit:"%",				//单位
			callBackStart:function(){
				stepBtn2.disabled();	//不可点击样式
				stepBtn2.unbindClickFn(); //解除点击事件
			},
			callback:function(){
				stepBtn2.isAvailable();	//判断按钮是否可用
			}
		});
		/*new Ruler兼容 vovo V3 安卓5.1.1 卡尺*/
		setTimeout(function(){
			heartRuler.canvasObj.style.display="block";
		},100)	
		/*new Ruler兼容 vovo V3 安卓5.1.1 卡尺：end*/
	}

}

function getCustomizeCallBack(){
	steploadFn();
}
function steploadFn(){
	var selectBox= document.querySelector(".js_appUser")
	selectBox.innerHTML=getCookie("lenderName")?getCookie("lenderName"):"请选择";
	var lenderId=getCookie("lenderId")?getCookie("lenderId"):"";
	selectBox.setAttribute("lenderId",lenderId);
	
	if(!!getCookie("lenderName")){
		var lenderNameWord=getCookie("lenderName")=="未实名"?"":(getCookie("lenderName")+"的");
		var inputValue=lenderNameWord+"定制产品-"+getCookie("customPeriodAndUnit");
		inputObj1.setValue(inputValue);
		stepBtn2.isAvailable();	//判断按钮是否可用
	}
	
	//回显产品名
	if(!!getCookie("customNameNoVIP") ){
		var inputValue=getCookie("customNameNoVIP");
		inputValue=inputValue.replace(/(\d{1,2}个月|\d{1,2}周|\d{1,}天)/g,getCookie("customPeriodAndUnit"))
		inputObj1.setValue(inputValue);
		stepBtn2.isAvailable();	//判断按钮是否可用
	}
}
var heartRuler;
var inputObj1;
var stepBtn2;
window.onload=function(){
	
	inputObj1=new inputObj({
		inputClass:".js_inputBox input",
		focusFn:function(){
			//输入框，定制用户
			var selectBox= document.querySelector(".js_appUser")
			var dateSelectVal=selectBox.getAttribute("lenderId");
			if(!dateSelectVal){
				Tips.show("请先选择定制用户");
				return false;
			}
			return true;
		},
		blurFn:function(){
			stepBtn2.isAvailable();	//下一步按钮是否可用
		}
	});
	stepBtn2=new stepButton({
		btnClass:".js_btnApply",
		isAvailableFn:function(){
			/*var selectHasVal= (dateSelect.getValue()!==0?true:false);*/  //定制期限不为空
			var inputVal=inputObj1.getValue();
			var inputHasVal= ((inputVal!==""&&inputVal.length>=4)?true:false);	//定制产品名不为空
			if(inputHasVal){
				return true;
			}else{
				return false
			}
		},
		clickFn:function(){
			//数据存cookie
			var applyCookie=new cookieFn({})
			//点击下一步需存入的cookie,key名称，val值
			applyCookie.cookieList=[
				{"key":"lenderId","val":getCookie("lenderId")},	//定制客户id
				{"key":"lenderName","val":getCookie("lenderName")},	//定制客户id
				{"key":"customName","val":"VIP-"+inputObj1.getValue()},	//定制产品名称
				{"key":"customNameNoVIP","val":inputObj1.getValue()},	//不带“VIP-”的定制产品名称
				{"key":"customRate","val":heartRuler.getNowData()}, //定制服务费
				{"key":"customAnnaulRate","val":(heartRuler.getTotalNum()-heartRuler.getNowData()).toFixed(2)}//定制产品收益率
			]
			
			applyCookie.setCookieList();
			location.href="personalTailorPreview.html";
		}
	})
	//测试数据
	/*setCookie('lenderId', "120428495768");   
	setCookie('lenderName', "曲曲"); */
	/*getCustomizeCallBack();*/
	//测试数据：end
	
	
	//加载判断 cookie是否有 lenderName ;
	
	
	
	steploadFn();
	
	
	Loading.init();
	Tips.init();
	commrateRange.init();
	
	getCustomize(getCustomizeCallBack);
	
	/*stepBtnApply.bindClickFn();*/

}