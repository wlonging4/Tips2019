setAppBtn(); 	//显示定制规则按钮
callBackBtnCloseWeb();	//返回按钮关闭webview
setWebTitle("填写定制信息");
Tips.init();
Loading.init();


var personalTailorStep1={
	token:getCookie("token")?getCookie("token"):"",	//
	init:function(){
		var self=this;
		self.loadData();
	},
	loadData:function(){	
		var self=this;
		self.getData={"appReqData":{},"token":self.token};
		self.getData=JSON.stringify(self.getData);
		Loading.show(); 
		//01.可定制产品列表
		$.ajax({
		    url: '/webapi/custom/customUseProductList.ason',		//接口wiki:http://wiki.creditease.corp/pages/viewpage.action?pageId=15339456
		    type: 'get',
		    async: true,
		    dataType: 'JSON',
		    cache:false, 
		    data:{
		    	data:self.getData
		    },
		    success: function (result) {
		    	Loading.hide();
		        if (result.code== "1"){
		        	self.dataBind(result);
		        }else{
		        	/*Tips.show(result.msg);*/
		        }
		    },
		    error: function(e) {
		    	Loading.hide();
		    	/*Tips.show(e);*/
		    }
		})
	},
	dataBind:function(result){
		/*if(result.data.customProList.length==0){
			var urlStr="personalTailor.html?type=2";
			location.href=urlStr;
			return;
		}*/
		if(result.code=="1" /*&& result.data.customProList.length!=0*/){
			var  selectData=[{"productCode":"0","productPeriod":"请选择","productName":"","productPeriodUint":0,"maxRange":"10000000","minRange":"500000","productRangeList":"null"}];
			for(var i=0; i<result.data.customProList.length; i++){
				var item=result.data.customProList[i];
				var productRangeList=item.productRangeList;
				if(productRangeList.length==0){		//为[] break;
					break;
				}
				var maxRange=0;
				var minRange=productRangeList[0].minRange;
				//计算最大 最小
				for(var j=0; j<productRangeList.length; j++){
					maxRange=productRangeList[j].maxRange>maxRange?productRangeList[j].maxRange:maxRange;
					minRange=productRangeList[j].minRange<minRange?productRangeList[j].minRange:minRange;
					
				}
				selectData.push({"productCode":item.productCode,"productPeriod":item.productPeriod,"productName":item.productName,"productPeriodUint":item.productPeriodUint,"maxRange":maxRange,"minRange":minRange,"productRangeList":productRangeList});
				
			}
		}else{
			
		}
		
		var dialogDom=document.querySelector(".dialogBox");
		dialogBox=new Dialog({"dialogBox":dialogDom,"closeFn":function(){
			
		}});
		
		
		//定制期限 选择框
		var dateSelect=new selectBox({
			wrapperClass:".js_selectBox",
			trigger: '.js_selectVal',
			dialogBox:dialogBox,
			dialogCon:".dialogCon",
			dataList:selectData,
			endCallBack:function(){	
			},
			initValueFn:function(){
				inputBox1.setMin(dateSelect.getMinRange());
				inputBox1.setMax(dateSelect.getMaxRange());
			},
			changeFn:function(){
				
				inputBox1.setMin(dateSelect.getMinRange());
				inputBox1.setMax(dateSelect.getMaxRange());
				
				
				inputBox1.clear();	//输入框清空
				rateWord.clear();	//打包回报率清空
				stepBtn1.isAvailable();	//下一步按钮是否可用
				
				
			}
		})
		
		
		//定制金额 输入框
		var inputBox1=new inputBox({
			wrapperClass:".js_inputBox",
			min:20,
			max:2000,
			focusFn:function(){
				//输入框，定制期限
				var dateSelectVal=dateSelect.getValue();
				if(dateSelectVal==0){
					Tips.show("请先选择定制期限");
					return false;
				}
				return true;
			},
			clearFn:function(){
				//清空打包回报率
				rateWord.clear();
			},
			blurFn:function(){
				var inputValue=inputBox1.getValue()*10000;
				var multipleRate=dateSelect.getMultipleRate(inputValue);
				multipleRate=parseFloat(multipleRate);
				rateWord.setValue(multipleRate.toFixed(2));
				stepBtn1.isAvailable();	//下一步按钮是否可用
			}
		})
		
		//打包回报率
		var rateWord=new wordBox({
			wrapperClass:".js_rate_word"
		})
		
		
		//下一步按钮
		var stepBtn1=new stepButton({
			btnClass:".js_stepBtn",
			isAvailableFn:function(){
				var selectHasVal= (dateSelect.getValue()!==0?true:false);  //定制期限不为空
				var inputHasVal= (inputBox1.getValue()!==""?true:false);	//定制金额不为空
				if(selectHasVal && inputHasVal){
					return true;
				}else{
					return false
				}
			},
			clickFn:function(){
				//数据存cookie
				var nextCookie=new cookieFn({})
				//点击下一步需存入的cookie,key名称，val值
				nextCookie.cookieList=[
					{"key":"productCode","val":dateSelect.getValue()},	//原产品编码
					{"key":"customPeriod","val":dateSelect.getCustomPeriod()},	//定制期限
					{"key":"customPeriodUnit","val":dateSelect.getValueUnit()}, //定制期限单位
					{"key":"customPeriodAndUnit","val":dateSelect.getText()},
					{"key":"customAmount","val": parseInt(inputBox1.getValue())*10000},	//定制金额
					{"key":"multipleRate","val":rateWord.getValue()}	//打包回报率
				]
				
				nextCookie.setCookieList(); //数据存cookie;
				location.href="personalTailorEdit2.html";
			}
		})
		
		//返回 回显数据
		if(!!getCookie("productCode")){
			dateSelect.initValue(getCookie("productCode"));
			dateSelect.change();
			var cookiCustomAmount=getCookie("customAmount");
			cookiCustomAmount=cookiCustomAmount?(parseInt(cookiCustomAmount)/10000):"";
			inputBox1.setValue(cookiCustomAmount)
			/*inputBox1.initValue();*/
			rateWord.setValue(getCookie("multipleRate"));
			
			stepBtn1.isAvailable();	 //下一步按钮是否可用
		}

	
	}
	
}

window.onload=function(){
	personalTailorStep1.init()
}
