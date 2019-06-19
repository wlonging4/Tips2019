function ModalAppointment(e){var e=e||{};return this.title=e.title||"提示",this.tips=e.tips||"随后工作人员会联系您",this.name=e.name||"",this.phonenum=e.phonenum||"",this.openBtn=e.openBtn,this.openfn="function"==typeof e.openfn?e.openfn:null,this.callback="function"==typeof e.callback?e.callback:null,this._createMask(),this._createPopup(),this._createTips(),this._addEvent(),this}var ModalHelper=function(e){var t;return{afterOpen:function(){document.body&&document.body.scrollTop&&(t=document.body.scrollTop),document.documentElement&&document.documentElement.scrollTop&&(t=document.documentElement.scrollTop),document.body.classList.add(e),document.body.style.top=-t+"px"},beforeClose:function(){document.body.classList.remove(e),document.body.style.top=0,document.body&&document.body.scrollTop&&(document.body.scrollTop=t),document.documentElement&&document.documentElement.scrollTop&&(document.documentElement.scrollTop=t),$("body").scrollTop(t)}}}("modal-open");ModalAppointment.prototype._createMask=function(){var e,t=document.querySelector(".ovrly"),o=document.querySelector("body");return e=window.innerHeight>o.offsetHeight?window.innerHeight:o.offsetHeight,t||(t=document.createElement("div"),t.style.cssText="width:100%;height:"+e+"px;background:rgba(0, 0, 0, 0.3);position:fixed;top:0;left:0;display:none;z-index:10001",t.className="ovrly",o.appendChild(t)),t},ModalAppointment.prototype._createPopup=function(){var e=document.querySelector(".dialogBox"),t=document.querySelector("body"),o="";return e||(e=document.createElement("div"),e.style.cssText="display:none;width: 270px;z-index:10002;  position: fixed;  background: #FFFFFF; border-radius: 5px; left: 50%; top:48%; transform: translate(-50%,-50%);-webkit-transform: translate(-50%,-50%);",e.className="dialogBox",o+='<div class="dialog">',o+='<div class="dialogTitle bottomBorder">',o+='<div class="titWord">'+this.title+"</div>",o+='<a href="javascript:void(0);" class="closeBtn dialogCloseBtn"></a>',o+="</div>",o+='<div class="dialogConBox bottomBorder ">',o+='<div class="dialogCon">',o+='<div class="formBox">',o+='<div class="inputBox bottomBorder">',o+='<span class="inputIcon icon1">&nbsp;</span>',o+='<input type="text" id="dialog-applyName" value="'+this.name+'" placeholder="请输入您的姓名" />',o+="</div>",o+='<div class="inputBox">',o+='<span class="inputIcon icon2">&nbsp;</span>',o+='<input type="tel" id="dialog-applyMobile" maxlength="11" value="'+this.phonenum+'" placeholder="请输入您的手机号" />',o+="</div>",o+="</div>",o+="</div>",o+="</div>",o+='<div class="errorInfo"></div>',o+='<div class="bottomBtn">',o+='<a href="javascript:void(0);" class="closeBtn btn dialogConfirmBtn">确&emsp;定</a>',o+="</div>",o+='<div class="dialogInfo">'+this.tips+"</div>",o+="</div>",e.innerHTML=o,t.appendChild(e)),e},ModalAppointment.prototype._createTips=function(){var e=document.querySelector(".tips"),t=document.querySelector("body");return e||(e=document.createElement("div"),e.className="tips",t.appendChild(e)),e},ModalAppointment.prototype._addEvent=function(){function e(e){var n=e.target;return t(n,"dialogConfirmBtn")&&o.callback&&o.callback(),t(n,"dialogCloseBtn")&&(o.close(),o.closeTips()),e.stopPropagation(),!1}function t(e,t){var o=new RegExp("\\b"+t+"\\b");return o.test(e.className)}{var o=this;this._createMask(),this._createPopup(),document.getElementById("dialog-applyName"),document.getElementById("dialog-applyMobile")}if(o.openBtn){var n=document.getElementById(o.openBtn);n&&n.addEventListener("touchstart",function(e){return o.open(),o.openfn&&o.openfn(),e.stopPropagation(),!1},!1)}document.removeEventListener("touchstart",e,!1),document.addEventListener("touchstart",e,!1)},ModalAppointment.prototype.open=function(){var e=this._createMask(),t=this._createPopup();e.style.display="block",t.style.display="block",ModalHelper.afterOpen()},ModalAppointment.prototype.close=function(){var e=this._createMask(),t=this._createPopup();ModalHelper.beforeClose(),e.style.display="none",t.style.display="none",document.activeElement.blur()},ModalAppointment.prototype.openTips=function(e){var t=this._createMask(),o=this._createTips();o.innerHTML=e,t.style.display="block",o.style.display="block",ModalHelper.afterOpen()},ModalAppointment.prototype.closeTips=function(){var e=this._createMask(),t=this._createTips();ModalHelper.beforeClose(),e.style.display="none",t.style.display="none",document.activeElement.blur()};