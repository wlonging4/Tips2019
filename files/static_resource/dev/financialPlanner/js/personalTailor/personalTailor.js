/*select*/
var selectBox=function(options){
	this.wrapperClass=options.wrapperClass;
	this.wrapperBox=document.querySelector(this.wrapperClass);
	this.dataList=options.dataList;
	this.trigger = document.querySelector(options.trigger);
	this.endCallBack=options.endCallBack;
	this.dialogBox=options.dialogBox?options.dialogBox:"";
	this.dialogCon=document.querySelector(options.dialogCon);
	this.changeFn=options.changeFn;
	this.optionsProductRangeList=[];		//参考回报率 list 对应activeIndex 
	this.initValueFn=options.initValueFn || function(){};
	this.scollObj="";
	this.activeIndex=0;
	
	this.init();
	
}
selectBox.prototype.init=function(){
	var self=this;
	this.selectObj=this.createSelect(); //返回创建select object
	this.activeIndex=this.selectObj.selectedIndex;
	this.bindChange();//绑定change事件
	this.trigger.innerHTML=this.selectObj.options[this.selectObj.selectedIndex].text;
	
	this.selectDialog=this.createSelectDialog();
	this.dialogCon.appendChild(this.selectDialog);
	this.wrapperBox.appendChild(this.selectObj);
	this.selectli=document.querySelectorAll(".selectUL li");
	
	this.bindTriggerClick();
	this.bindRadioChange();
	
}
selectBox.prototype.createSelect=function(){
	var selectDom=document.createElement("select");
	var selectOptions=[];
	for(var i=0; i<this.dataList.length; i++){
		
		var productPeriodUintWord={"1":"个月","2":"周","3":"天"};
		var selectOptionItem=this.dataList[i]
		
		var productCode=selectOptionItem.productCode;
		this.productCode=productCode;
		var productPeriodUint=selectOptionItem.productPeriodUint;
		this.productPeriodUint=productPeriodUint;
		var maxRange=selectOptionItem.maxRange;
		var minRange=selectOptionItem.minRange;
		var multipleRate=selectOptionItem.multipleRate;
		var productPeriod=selectOptionItem.productPeriod;
		var showValue=productPeriod+ (productPeriodUintWord[productPeriodUint]?productPeriodUintWord[productPeriodUint]:"");
		var optionsHtml='<option value="'+productCode+'" dataUnit="'+productPeriodUint+'" maxRange="'+maxRange+'" minRange="'+minRange+'"  multipleRate="'+multipleRate+'" customPeriod="'+productPeriod+'">'+showValue+'</option>'
		selectOptions.push(optionsHtml);
		this.optionsProductRangeList.push(selectOptionItem.productRangeList);
	}
	selectDom.innerHTML=selectOptions.join("");
	return selectDom;
}
selectBox.prototype.createSelectDialog=function(){
	var ulDom=document.createElement("ul");
	ulDom.className="selectUL"
	var mobileSelectData=[]
	var filerSelect=this.selectObj;
	selectDataLenght=filerSelect.options.length
	for(var i=0; i<selectDataLenght;i++){
		var optionId=filerSelect.options[i].value;
		var optionText=filerSelect.options[i].text;
		var liHtml='<li data-id="'+optionId+'"><input type="radio" name="radioName" class="radioClass" value="'+optionId+'" id="optionId'+i+'" '+(i==this.activeIndex?"checked=checked":"")+' /><label for="optionId'+i+'">'+optionText+'</label></li>';
		mobileSelectData.push(liHtml);
	}
	ulDom.innerHTML=mobileSelectData.join("");
	return ulDom;
}
selectBox.prototype.bindChange=function(){
	var self=this;
	self.selectObj.addEventListener("change",function(event){
		self.change.call(self,event);
	},false);
}
selectBox.prototype.bindTriggerClick=function(){
	var self=this;
	self.trigger.addEventListener("click",function(event){
		self.triggerClick();
	},false);
}
selectBox.prototype.bindRadioChange=function(){
	var self=this;
	for(var i=0; i<this.selectli.length; i++){
		this.selectli[i].addEventListener("click",function(){
			self.setValue(this.getAttribute("data-id"));
			self.trigger.innerHTML=self.selectObj.options[self.selectObj.selectedIndex].text;
			self.dialogBox.hide();
			self.change();
		},false);
	}
	
}
selectBox.prototype.radioChange=function(e){
	
}
selectBox.prototype.triggerClick=function(){
	this.dialogBox.show();
	//定制期限大于6条时，显示滚动条
	if(this.selectli.length>7 && window.addEventListener && this.scollObj==""){
		this.dialogCon.classList.add("heightFixed");
		this.scollObj=simpScroller(this.dialogCon);	
	}
}
selectBox.prototype.change=function(){
	this.activeIndex=this.selectObj.selectedIndex;
	this.activeOption=this.selectObj.options[this.activeIndex];
	this.changeFn();
}
selectBox.prototype.setValue=function(setVal){
	this.selectObj.value=setVal;
}
selectBox.prototype.initValue=function(setVal){
	var self=this;
	this.selectObj.value=setVal;
	self.trigger.innerHTML=self.selectObj.options[self.selectObj.selectedIndex].text;
	this.activeIndex=this.selectObj.selectedIndex;
	this.activeOption=this.selectObj.options[this.activeIndex];
	var radioList=document.querySelectorAll(".radioClass");
	radioList[this.activeIndex].setAttribute("checked","checked");
	self.initValueFn();
	

}
selectBox.prototype.initchange=function(){
	
}
selectBox.prototype.getValue=function(){
	return this.selectObj.value;
}
selectBox.prototype.getText=function(){
	return this.activeOption.innerHTML;
}
selectBox.prototype.getMaxRange=function(){
	var num=this.activeOption.getAttribute("maxrange");
	num=this.numToTenThousand(num);
	return num;
}
selectBox.prototype.getMinRange=function(){
	var num=this.activeOption.getAttribute("minrange");
	num=this.numToTenThousand(num);
	return num;
}
selectBox.prototype.getMultipleRate=function(value){
	/*var num=this.activeOption.getAttribute("multiplerate")?this.activeOption.getAttribute("multiplerate"):"";*/
	var multipNumArr=this.optionsProductRangeList[this.activeIndex];
	for(var i=0; i<multipNumArr.length; i++){
		var item=multipNumArr[i];
		if(value>=item.minRange && value<=item.maxRange){
			/*num=this.numToRate(item.multipleRate);*/
			num=item.multipleRate;
			return num;
		}
	}
	
}

selectBox.prototype.getValueUnit=function(){
	return this.activeOption.getAttribute("dataunit");
}
selectBox.prototype.getCustomPeriod=function(){
	return this.activeOption.getAttribute("customPeriod");
}

selectBox.prototype.numToTenThousand=function(num){
	return num/10000;
}
selectBox.prototype.numToRate=function(num){
	return num*100;
}




/*input*/
var inputBox=function(options){
	this.wrapperClass=options.wrapperClass;
	this.wrapperBox=document.querySelector(this.wrapperClass);
	this.min=options.min;
	this.max=options.max;
	this.placeholder=options.placeholder?options.placeholder:"";
	this.blurFn=options.blurFn;
	this.focusFn=options.focusFn;
	this.clearFn=options.clearFn;
	this.blurValidation=true;
	this.init();
}
inputBox.prototype.init=function(){
	var self=this;
	this.inputObj=this.createInput(); //返回创建select object
	this.bindFocus(); 	//绑定焦点获得事件
	this.bindBlur();	//绑定焦点失去事件
	this.wrapperBox.appendChild(this.inputObj);
	
	this.inputObj.setAttribute("onkeypress","javascript:if(this.value.length > 15)event.returnValue=false;")
}

inputBox.prototype.setMin=function(minVal){
	this.min=minVal;
	this.max=Math.ceil(this.min);	//向上取整
}
inputBox.prototype.setMax=function(maxVal){
	this.max=maxVal;
	this.max=Math.floor(this.max);	//向下取整
}
inputBox.prototype.createInput=function(){
	var inputdom=document.createElement("input");
	this.placeholder="可定制区间"+this.min+"-"+this.max;
	inputdom.placeholder=this.placeholder;
	/*inputdom.type="number";*/
	inputdom.type="number";
	inputdom.pattern="[0-9]*";	//输入正整数 只出现数字键盘 兼容
	return inputdom;
}
inputBox.prototype.bindFocus=function(){
	var self=this;
	self.inputObj.addEventListener("focus",function(event){
		self.blurValidation=self.focusFn.call(self,event);
		if(!self.blurValidation){
			self.inputObj.blur();
		}
	},false);
}
inputBox.prototype.bindBlur=function(){
	var self=this;
	self.inputObj.addEventListener("blur",function(event){
		
		if(self.blurValidation){  //获得焦点验证通过 验证失去焦点
			self.blur.call(self,event);
		}
	},false);
}
inputBox.prototype.focus=function(){
	/*var self=this;
	Tips.show("请先选择定制期限");
	this.inputObj.blur();*/
	
	
}
inputBox.prototype.blur=function(){
	var val=this.getValue();
	if(val==""){
		this.tips("noNull");
		this.blurFn();
		this.valueChange();	
		return;
	}
	if(this.minMaxbool()){	//为数字 向下取整
		this.setValue(Math.floor(val));
	
	}else if(val<this.min){		//小于最小取最小
		this.setValue(this.min);
		this.tips("min");
		
	}else if(val>this.max){		//大于最大取最大
		this.setValue(this.max);
		this.tips("max");
	}else{
		this.clear();
		this.tips("error");
		this.blurFn();
		this.valueChange();	
		return;
	}
	this.blurFn();
	this.valueChange();	
	
}
inputBox.prototype.valueChange=function(){
	var val=this.getValue();
	if(val==""){
		this.clear();
	}
}
inputBox.prototype.minMaxbool=function(){
	var val=this.getValue();
	if(this.inNumBool() && val>=this.min && val<=this.max){
		return true;
	}
	return false;
}
inputBox.prototype.inNumBool=function(){
	var val=this.getValue();
	var reg = /^[0-9]+.?[0-9]*$/;
	if (reg.test(val)) {
	   return true;
	}
	return false;
}
inputBox.prototype.tips=function(typeObj){
	switch(typeObj)
	{
		case "max":
			Tips.show("定制上限金额"+this.max+"万元");
			break;
		case "min":
			Tips.show("定制最低金额"+this.min+"万元");
			break;
		case "error":
			Tips.show("输入格式错误只能输入正整数");
			break;
		case "noNull":
			Tips.show("定制金额不能为空");
			break;
	}
	
}
inputBox.prototype.setValue=function(setVal){
	this.inputObj.value=setVal;
}
inputBox.prototype.getValue=function(){
	return this.inputObj.value;
}
inputBox.prototype.clear=function(){
	this.inputObj.value="";
	this.inputObj.placeholder="可定制区间"+this.min+"-"+this.max;
	this.clearFn();
}

var inputObj=function(options){
	this.inputClass=options.inputClass?options.inputClass:"";
	this.inputObj=document.querySelector(this.inputClass);
	this.vipIcon=document.querySelector(".vipClass")?document.querySelector(".vipClass"):(new Object());
	this.blurValidation=true;
	this.clearFn=options.clearFn || function(){};
	this.blurFn=options.blurFn;
	this.focusFn=options.focusFn;
	this.init();
}
inputObj.prototype.init=function(){
	this.bindFocus();
	this.bindKeydown();
	/*this.bindKeyup();*/
	/*this.bindBlur();*/
}
inputObj.prototype.bindFocus=function(){
	var self=this;
	self.inputObj.addEventListener("focus",function(event){
		self.blurValidation=self.focusFn.call(self,event);
		if(!self.blurValidation){
			self.inputObj.blur();
		}
	},false);
}
inputObj.prototype.bindKeyup=function(){
	var self=this;
	self.inputObj.addEventListener("keyup",function(event){
		self.keyup.call(self,event);
	},false);
}
inputObj.prototype.bindKeydown=function(){
	var self=this;
	self.inputObj.addEventListener("keydown",function(event){
		self.keydown.call(self,event);
	},false);
	self.inputObj.addEventListener('input',function(event){
		self.keyInput.call(self,event);
	},false);
}
inputObj.prototype.bindBlur=function(){
	var self=this;
	self.inputObj.addEventListener("blur",function(event){
		if(self.blurValidation){  //获得焦点验证通过 验证失去焦点*/
			self.blur.call(self,event);
		}
	},false);
}
inputObj.prototype.keydown=function(){
	var val=this.getValue();
	this.valLenght=val.length;
	varlen=getByteLen(val);
	varlen=varlen*0.5+1;
	if(varlen<7){
		varlen=7;
	}
	if(val.length>20){
		return;
	}
	this.inputObj.style.width=varlen+"em";
	this.validation();
	this.blurFn();
	this.oldlen=this.valLenght;
	
}
inputObj.prototype.keyInput=function(){
	var val=this.getValue();
	this.valLenght=val.length;
	varlen=getByteLen(val);
	varlen=varlen*0.5+1;
	if(varlen<7){
		varlen=7;
	}
	if(val.length>20){
		return;
	}
	this.inputObj.style.width=varlen+"em";
	var val=this.getValue();
	if(val.length >= 20){
		this.tips("maxSize");
		
	}
	this.blurFn();
	
}

inputObj.prototype.validation=function(){
	var val=this.getValue();
	var boolVal=(this.oldlen > this.valLenght);
	var vallen=val.length;
	if(val.length >= 20){
		this.tips("maxSize");
	}else if(boolVal && vallen==4){
		this.tips("minSize");
	}
	
}
inputObj.prototype.blur=function(){
	/*this.validation();*/
	this.blurFn();
}
inputObj.prototype.keyup=function(){
	/*this.validation();*/
	this.blurFn();
}
inputObj.prototype.tips=function(typeObj){
	switch(typeObj)
	{
		case "maxSize":
			Tips.show("产品名称最多20个字 ");
			break;
		case "noNull":
			Tips.show("产品名称不能为空");
			break;
		case "minSize":
			Tips.show("产品名称需要大于4个字");
			break;
	}
	
}
inputObj.prototype.setValue=function(setVal){
	this.inputObj.value=setVal;
	var varlen=this.inputWidth();
	this.inputObj.style.width=varlen+"em";
}
inputObj.prototype.inputWidth=function(){
	var val=this.getValue();
	var varlen=getByteLen(val);
	varlen=varlen*0.5+1;
	if(varlen<7){
		varlen=7;
	}
	return varlen;
}
inputObj.prototype.getValue=function(){
	return this.inputObj.value;
}
inputObj.prototype.clear=function(){
	this.inputObj.value="";
	this.clearFn();
}
inputObj.prototype.vipShow=function(){
	this.vipIcon.classList.add("show");
}
inputObj.prototype.vipHide=function(){
	this.vipIcon.classList.remove("show");
}

var wordBox=function(options){
	this.wrapperClass=options.wrapperClass;
	this.wrapperBox=document.querySelector(this.wrapperClass);
	this.clickFn=options.clickFn||function(){};
	this.bindClick();
}
wordBox.prototype.bindClick=function(){
	var self=this;
	self.wrapperBox.addEventListener("click",function(event){
		self.clickFn();
	},false);
}
wordBox.prototype.setValue=function(setVal){
	this.value=setVal;
	this.wrapperBox.innerHTML=setVal/*+"%"*/;
	
}
wordBox.prototype.getValue=function(){
	return this.value;
}
wordBox.prototype.clear=function(){
	this.wrapperBox.innerHTML="";
}

/*按钮*/
var stepButton=function(options){
	this.btnClass=options.btnClass;
	this.btn=document.querySelector(this.btnClass)
	/*this.*/
	this.clickFn=options.clickFn||function(){};
	this.isAvailableFn=options.isAvailableFn||function(){return true};
	this.init();
	this.isAvailable();
}
stepButton.prototype.init=function(){
	
	/*this.bindClickFn();
	this.unbindClickFn();*/
}

stepButton.prototype.isAvailable=function(){
	if(this.isAvailableFn()){
		this.enable();
		this.bindClickFn();
	}else{
		this.disabled();
		this.unbindClickFn();
	}
	
}
stepButton.prototype.disabled=function(){
	this.btn.classList.add("disabled");
}
stepButton.prototype.enable=function(){
	this.btn.classList.remove("disabled");
}
/*stepButton.prototype.click=function(){
	console.log("click");
	this.clickFn();
}*/
stepButton.prototype.bindClickFn=function(){
	var self=this;
	this.btn.addEventListener("click",self.clickFn,false);
}

stepButton.prototype.unbindClickFn=function(){
	var self=this;
	this.btn.removeEventListener("click",self.clickFn,false);
}
var Dialog=function(options){
	this.dom=options.dialogBox;
	this.closeFn=options.closeFn || function(){}
	this.init();
};
Dialog.prototype.init=function(){
	this.bindClose();
}
Dialog.prototype.bindClose=function(){
	var self=this;
	var closebtn=self.dom.querySelector(".close");
	closebtn.addEventListener("click",function(){
		self.hide();
		self.closeFn();
	})
	
}
Dialog.prototype.show=function(){
	this.dom.classList.add("show");
}
Dialog.prototype.hide=function(){
	this.dom.classList.remove("show");
}

var cookieFn=function(options){
	this.cookieList=options.cookieList?options.cookieList:[];
	
}
cookieFn.prototype.setCookieList=function(){
	var self=this;
	list=this.cookieList;
	
	for(var i=0; i<this.cookieList.length; i++){
		var listItem=list[i];
		self.setCookie(listItem.key,listItem.val);
	}
}
cookieFn.prototype.setCookie=function(name,value)
{
	document.cookie = name + "="+ escape (value);
}
cookieFn.prototype.getCookie=function(name)
{
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
	return unescape(arr[2]);
	else
	return null;
}

/*弱提示*/
var Tips={
	init:function(){
		this.dom=document.createElement("div");		//最外层遮罩
		this.dom.className="tipsOvrly";			
		this.ovrlyWordBox=document.createElement("div");	//消息框
		this.ovrlyWordBox.className="ovrlyWordBox";
	    this.ovrlyWord=document.createElement("div");	//显示内容，
	    this.ovrlyWord.className="ovrlyWord";
	    
	    this.ovrlyWordBox.appendChild(this.ovrlyWord);
		this.dom.appendChild(this.ovrlyWordBox);
		document.body.appendChild(this.dom);
	},
	show:function(msgString){
		var self=this;
		if(!msgString){
			return;
		}
		this.setContent(msgString);
		
		self.dom.classList.add("tipsOvrlyShow");
		setTimeout(function(){
			self.hide();
		},1900);
	},
	hide:function(){
		this.dom.classList.remove("tipsOvrlyShow");
	},
	setContent:function(msgString){
		this.ovrlyWord.innerHTML=msgString;
	}
}
/*弱提示：end*/

/*loading显示隐藏*/
var Loading={
	init:function(){
		this.dom=document.createElement("div");
		this.dom.className="loadingDiv hidden";
		document.body.appendChild(this.dom);
	},
	show:function(){
		this.dom.classList.add("show");
		this.dom.classList.remove("hidden");
	},
	hide:function(){
		this.dom.classList.add("hidden");
		this.dom.classList.remove("show");
	}
}
/*loading:end*/

/*与app，Bridge交互*/
function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
    	
       return callback(window.WebViewJavascriptBridge)
    } else {
        document.addEventListener(
            'WebViewJavascriptBridgeReady'
            , function() {
              return  callback(window.WebViewJavascriptBridge)
            },
            false
        );
    }

    if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
}
function setAppBtn(){
	var host=window.location.host;
	var ruleUrl="http://"+host+"/h5static/financialPlanner/personalTailor/customRules.html";
	/*var ruleUrl="http://10.10.56.97:8080/dev/financialPlanner/personalTailor/customRules.html";*/
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowButton', {"titleBack": "1","titleClose": "0","titleWeb": {"titleContent": "定制规则","url":ruleUrl}}, function(response) {
			/*alert("定制规则 按钮");*/
		})
	})
}
//没有右上角按钮
function setNoHasAppBtn(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowButton', {"smallBell": "0","titleBack": "1","titleClose": "0","titleWeb": {"titleContent": "","url":""}}, function(response) {
		})
	})
}

function callBackBtnCloseWeb(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhNaviGoBack', "nativeCloseWeb", function(response) {
		})
	})
	
}

function callBackBtnGoBackWeb(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhNaviGoBack', "nativeGoBackWeb", function(response) {
		})
	})
	
}

function callBackBtnGoBackWeb(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhNaviGoBack', "nativeGoBackWeb", function(response) {
		})
	})
	
}
function callBackBtnGoBackWebUrl(){
	var host=window.location.host;
	/*var ruleUrl="http://"+host+"/h5static/financialPlanner/personalTailor/customRules.html";*/
	/*var urlStr="http://"+host+"/dev/financialPlanner/personalTailor/personalTailor.html?type=1";*/
	var urlStr="http://"+host+"/h5static/financialPlanner/personalTailor/personalTailor.html?type=1";
	var goUrlStr="webOpenUrl-"+urlStr;
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhNaviGoBack', goUrlStr, function(response) {
		})
	})
	
}
function callBackBtnGoBackWebEmpty(){
	var host=window.location.host;
	/*var ruleUrl="http://"+host+"/h5static/financialPlanner/personalTailor/customRules.html";*/
	/*var urlStr="http://"+host+"/dev/financialPlanner/personalTailor/personalTailor.html?type=1";*/
	var urlStr="http://"+host+"/h5static/financialPlanner/personalTailor/personalTailor.html?type=2";
	var goUrlStr="webOpenUrl-"+urlStr;
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhNaviGoBack', goUrlStr, function(response) {
		})
	})
	
}
function callBackBtnGoBackWebStep1(){
	var host=window.location.host;
	/*var ruleUrl="http://"+host+"/h5static/financialPlanner/personalTailor/customRules.html";*/
	/*var urlStr="http://"+host+"/dev/financialPlanner/personalTailor/personalTailorEdit1.html?type=1";*/
	var goUrlStr="webOpenUrl-"+urlStr;
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhNaviGoBack', goUrlStr, function(response) {
		})
	})
	
}

function callBackBtnGoBackWebStep2(){
	var host=window.location.host;
	/*var ruleUrl="http://"+host+"/h5static/financialPlanner/personalTailor/customRules.html";*/
	var urlStr="http://"+host+"/dev/financialPlanner/personalTailor/personalTailorEdit2.html?type=1";
	var goUrlStr="webOpenUrl-"+urlStr;
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhNaviGoBack', goUrlStr, function(response) {
		})
	})
	
}

//注册用户列表
function toAppUserManage(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowAppUserManage',  function(response) {
		})
	})
	
}
//我的工作室
function toAppCustomize(){
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('xhShowAppCustomize',  function(response) {
		})
	})
	
}


function getCustomize(callBackFn){
	/*alert("appxhGoH5Customize")*/
	var dataJSON="";
	/*document.querySelector(".js_appUser").innerHTML=data;*/
			
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.registerHandler('xhGoH5Customize', function(data, responseCallback) {
				
				clearArrCookie(step2ClearCookie); //选择用户名  cookie
				
	           	var dataString=data;
	            dataJSON=JSON.parse(dataString); 
	           
	            lenderId=dataJSON.userId?dataJSON.userId:dataJSON.userid;
	           	lenderName=dataJSON.userName?dataJSON.userName:"未实名";

	            setCookie('lenderId', lenderId); 
	            setCookie('lenderName', lenderName); 

	            callBackFn();
	            
	           	return dataJSON;
	           
	           
	     })	
	    
	})	 

	
}
/*给title 安卓*/
function setWebTitle(titleStr){
	setupWebViewJavascriptBridge(function(bridge) {
	     bridge.callHandler('xhWebTitle', titleStr, function(response) {
		 })
	})
}

function setCookie(name,value)
{
	document.cookie = name + "="+ escape (value);
}
function getCookie(name)
{
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
	return unescape(arr[2]);
	else
	return null;
}
var applyClearCookie=["lenderId","lenderName","customName","customNameNoVIP","customRate","customAnnaulRate","customPeriod","customPeriodUnit","customPeriodAndUnit","customAmount","multipleRate","productCode"];
//步骤2需清除cookie
var step2ClearCookie=["lenderId","lenderName","lenderName","customName","customNameNoVIP"/*,"customRate"*/];
function clearArrCookie(postDataArr){
	for(var i=0; i<postDataArr.length; i++){
		var item=postDataArr[i];
		setCookie(item,"");
	}
}
function getQueryString(name){
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) return unescape(r[2]); 
    return null; 
}
 function getByteLen(val) {
    var len = 0;
    for (var i = 0; i < val.length; i++) {
        var a = val.charAt(i);
        if (a.match(/[^\x00-\xff]/ig) != null) {
            len += 2;
        }
        else {
            len += 1;
        }
    }
    return len;
}
//兼容
;(function(){
	var agent = navigator.userAgent.toLowerCase();
	var iLastTouch = null; //缓存上一次tap的时间
	if (agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0) //检测是否是ios
	{
		document.body.addEventListener('touchend', function(event){
			var iNow = new Date().getTime(); 
			iLastTouch = iLastTouch || iNow + 1 /** 第一次时将iLastTouch设为当前时间+1 */ ;
			var delta = iNow - iLastTouch;
			if (delta < 500 && delta > 0)
			{
				event.preventDefault();
				return false;
			}
			iLastTouch = iNow; 
		}, false);
	}
 
})();
//兼容：end

