/**
 * Created by yugu10 on 2017/6/26. 预约弹层
 */
/**
 * callback             //回调函数
 * title                //标题
 * tips                 //提示文字
 * name                 //名字
 * phonenum             //手机号
 * openBtn              //点击出现的按钮 id ,不带#
 * **/
var ModalHelper = (function(bodyCls) {
    var scrollTop;
    return {
        afterOpen: function() {
            if (document.body && document.body.scrollTop)
            {
                scrollTop = document.body.scrollTop;
            }
            if (document.documentElement && document.documentElement.scrollTop )
            {
                scrollTop = document.documentElement.scrollTop;
            };
            document.body.classList.add(bodyCls);
            document.body.style.top = -scrollTop + 'px';
        },
        beforeClose: function() {

            document.body.classList.remove(bodyCls);
            document.body.style.top = 0;
            // scrollTop lost after set position:fixed, restore it back.
            if (document.body && document.body.scrollTop)
            {
                document.body.scrollTop = scrollTop;
            }
            if (document.documentElement && document.documentElement.scrollTop )
            {
                document.documentElement.scrollTop = scrollTop;
            }
            $("body").scrollTop(scrollTop)
        }
    };
})('modal-open');

function ModalAppointment(options){
    var options = options || {};
    this.title = options.title || "提示";
    this.tips = options.tips || "随后工作人员会联系您";
    this.name = options.name || "";
    this.phonenum = options.phonenum || "";
    this.openBtn = options.openBtn;
    this.openfn = typeof options.openfn == "function" ?  options.openfn : null;
    this.callback = typeof options.callback == "function" ?  options.callback : null;
    this._createMask();
    this._createPopup();
    this._createTips();
    this._addEvent();
    return this;
}
ModalAppointment.prototype._createMask = function(){
    var mask = document.querySelector(".ovrly"), body = document.querySelector("body"), w, h;
    h = window.innerHeight > body.offsetHeight ? window.innerHeight : body.offsetHeight;
    if(!mask){
        mask = document.createElement("div");
        mask.style.cssText = "width:100%;height:" + h + "px;background:rgba(0, 0, 0, 0.3);position:fixed;top:0;left:0;display:none;z-index:10001";
        mask.className = "ovrly";
        body.appendChild(mask)
    };
    return mask;
};
ModalAppointment.prototype._createPopup = function(){
    var popup = document.querySelector(".dialogBox"), body = document.querySelector("body"), html = "";
    if(!popup){
        popup = document.createElement("div");
        popup.style.cssText = "display:none;width: 270px;z-index:10002;  position: fixed;  background: #FFFFFF; border-radius: 5px; left: 50%; top:48%; transform: translate(-50%,-50%);-webkit-transform: translate(-50%,-50%);";
        popup.className = "dialogBox";
        html +=     '<div class="dialog">';
        html +=         '<div class="dialogTitle bottomBorder">';
        html +=             '<div class="titWord">' + this.title + '</div>';
        html +=            '<a href="javascript:void(0);" class="closeBtn dialogCloseBtn"></a>';
        html +=         '</div>';
        html +=         '<div class="dialogConBox bottomBorder ">';
        html +=             '<div class="dialogCon">';
        html +=                 '<div class="formBox">';
        html +=                     '<div class="inputBox bottomBorder">';
        html +=                         '<span class="inputIcon icon1">&nbsp;</span>';
        html +=                         '<input type="text" id="dialog-applyName" value="' + this.name + '" placeholder="请输入您的姓名" />';
        html +=                     '</div>';
        html +=                     '<div class="inputBox">';
        html +=                         '<span class="inputIcon icon2">&nbsp;</span>';
        html +=                         '<input type="tel" id="dialog-applyMobile" maxlength="11" value="' + this.phonenum + '" placeholder="请输入您的手机号" />';
        html +=                     '</div>';
        html +=                 '</div>';
        html +=             '</div>';
        html +=         '</div>';
        html +=         '<div class="errorInfo"></div>';
        html +=         '<div class="bottomBtn">';
        html +=             '<a href="javascript:void(0);" class="closeBtn btn dialogConfirmBtn">确&emsp;定</a>';
        html +=         '</div>';
        html +=         '<div class="dialogInfo">' + this.tips + '</div>';
        html +=     '</div>';
        popup.innerHTML = html;

        body.appendChild(popup);
    };
    return popup;

};
ModalAppointment.prototype._createTips = function(){
    var tips = document.querySelector(".tips"), body = document.querySelector("body"), html = "";
    if(!tips){
        tips = document.createElement("div");
        //tips.style.cssText = "display:none;z-index:10003;transform: translate(-50%,-50%);-webkit-transform: translate(-50%,-50%); position: fixed; left: 50%; top:49%; padding: 15px 15px; line-height:30px ; color: #000; font-size: 16px; font-weight: bold; background: rgba(255,255,255,0.9); border-radius: 5px;";
        tips.className = "tips";
        body.appendChild(tips)
    };
    return tips;
};
ModalAppointment.prototype._addEvent = function(){
    var self = this, mask = this._createMask(), popup = this._createPopup(), applyName = document.getElementById("dialog-applyName"), applyMobile = document.getElementById("dialog-applyMobile");

    if(self.openBtn){
        var openBtn = document.getElementById(self.openBtn);
        if(openBtn){
            openBtn.addEventListener("touchstart", function(event){
                self.open();
                self.openfn&&self.openfn();
                event.stopPropagation();
                return false;
            }, false);
        }
    }
    document.removeEventListener("touchstart",touchEvent, false);
    document.addEventListener("touchstart",touchEvent, false);
    function touchEvent(event){
        var target = event.target;
        if(hasClass(target, "dialogConfirmBtn")){
            self.callback&&self.callback();
        };
        if(hasClass(target, "dialogCloseBtn")){
            self.close();
            self.closeTips();
        };
        event.stopPropagation();
        return false;
    }
    function hasClass(obj,classname){
        var reg = new RegExp("\\b" + classname + "\\b");
        return reg.test(obj.className);
    }
};
ModalAppointment.prototype.open = function(){
    var mask = this._createMask(), popup = this._createPopup();
    mask.style.display = "block";
    popup.style.display = "block";
    ModalHelper.afterOpen();
};
ModalAppointment.prototype.close = function(){
    var mask = this._createMask(), popup = this._createPopup();
    ModalHelper.beforeClose();
    mask.style.display = "none";
    popup.style.display = "none";
    document.activeElement.blur();
};
ModalAppointment.prototype.openTips = function(content){
    var mask = this._createMask(), tips = this._createTips();
    tips.innerHTML = content;
    mask.style.display = "block";
    tips.style.display = "block";
    ModalHelper.afterOpen();
};
ModalAppointment.prototype.closeTips = function(){
    var mask = this._createMask(), tips = this._createTips();
    ModalHelper.beforeClose();
    mask.style.display = "none";
    tips.style.display = "none";
    document.activeElement.blur();
};