function getCustomizeCallBack(){steploadFn()}function steploadFn(){var e=document.querySelector(".js_appUser");e.innerHTML=getCookie("lenderName")?getCookie("lenderName"):"请选择";var t=getCookie("lenderId")?getCookie("lenderId"):"";if(e.setAttribute("lenderId",t),getCookie("lenderName")){var a="未实名"==getCookie("lenderName")?"":getCookie("lenderName")+"的",n=a+"定制产品-"+getCookie("customPeriodAndUnit");inputObj1.setValue(n),stepBtn2.isAvailable()}if(getCookie("customNameNoVIP")){var n=getCookie("customNameNoVIP");n=n.replace(/(\d{1,2}个月|\d{1,2}周|\d{1,}天)/g,getCookie("customPeriodAndUnit")),inputObj1.setValue(n),stepBtn2.isAvailable()}}setAppBtn(),callBackBtnGoBackWeb(),setWebTitle("填写定制信息");var commrateRange={token:"aaaa",maxNum:"3.0",minNum:"1.0",init:function(){var e=this;e.token=getCookie("token")?getCookie("token"):"",e.load()},load:function(){var e=this;Loading.show(),e.getData={appReqData:{},token:e.token},e.getData=JSON.stringify(e.getData),$.ajax({url:"/webapi/custom/commrateRange",type:"get",async:!0,dataType:"JSON",data:{data:e.getData},cache:!1,success:function(t){if(Loading.hide(),"1"==t.code){var a=t.data.commRange;e.maxNum=a.maxCommrate,e.minNum=a.minCommrate}e.dataBind()},error:function(t){Loading.hide(),e.dataBind()}})},dataBind:function(){var e=getCookie("multipleRate")?getCookie("multipleRate"):12,t=parseFloat(commrateRange.maxNum).toFixed(1),a=parseFloat(commrateRange.minNum).toFixed(1),n=getCookie("customRate")?getCookie("customRate"):a;heartRuler=new Ruler("heart-contain",{maxNum:t,minNum:a,initNum:n,totalNum:e,decimalWei:"1",cellNum:"1",scaleWidth:"800",name:"推荐服务费",rateName:"参考年回报率",unit:"%",callBackStart:function(){stepBtn2.disabled(),stepBtn2.unbindClickFn()},callback:function(){stepBtn2.isAvailable()}}),setTimeout(function(){heartRuler.canvasObj.style.display="block"},100)}},heartRuler,inputObj1,stepBtn2;window.onload=function(){inputObj1=new inputObj({inputClass:".js_inputBox input",focusFn:function(){var e=document.querySelector(".js_appUser"),t=e.getAttribute("lenderId");return t?!0:(Tips.show("请先选择定制用户"),!1)},blurFn:function(){stepBtn2.isAvailable()}}),stepBtn2=new stepButton({btnClass:".js_btnApply",isAvailableFn:function(){var e=inputObj1.getValue(),t=""!==e&&e.length>=4?!0:!1;return t?!0:!1},clickFn:function(){var e=new cookieFn({});e.cookieList=[{key:"lenderId",val:getCookie("lenderId")},{key:"lenderName",val:getCookie("lenderName")},{key:"customName",val:"VIP-"+inputObj1.getValue()},{key:"customNameNoVIP",val:inputObj1.getValue()},{key:"customRate",val:heartRuler.getNowData()},{key:"customAnnaulRate",val:(heartRuler.getTotalNum()-heartRuler.getNowData()).toFixed(2)}],e.setCookieList(),location.href="personalTailorPreview.html"}}),steploadFn(),Loading.init(),Tips.init(),commrateRange.init(),getCustomize(getCustomizeCallBack)};