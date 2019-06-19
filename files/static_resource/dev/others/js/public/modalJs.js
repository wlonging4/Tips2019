/**
 * Created by yugu10 on 2017/6/26.弹层
 */
/**
 * title                //标题内容
 * contentText          //文案内容
 * isClosebtn           //是否显示关闭按钮
 * isTipConfirm         //内容bottom按钮是否展示
 * tipText              //内容bottom按钮文案
 * isConfirmbtn         //是否显示确认按钮
 * confirmText          //确认按钮的文案
 * isPromptbtn          //是否是 Promp类弹窗
 * conisPromptText      //Promp类弹窗两按钮文字
 * conisPromptLink      //Promp类两个按钮link
 * wrapperClass         //弹层样式
 * callback             //回调函数
 * maskNoClickClose       //点击背景
 *
 *
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
            }
            document.body.classList.add(bodyCls);
            document.body.style.top = -scrollTop + 'px';
        },
        beforeClose: function() {
            document.body.classList.remove(bodyCls);
            document.body.style = "";
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
function Modal(options){
    var options = options || {};
    this.wrapperClass = options.wrapperClass || "";
    this.title = options.title || "温馨提示";
    this.contentText = options.contentText || "";
    this.isClosebtn = (typeof options.isClosebtn == "boolean" ? options.isClosebtn : false) || false;
    this.isTipConfirm = (typeof options.isTipConfirm == "boolean" ? options.isTipConfirm : false) || false;
    this.tipText = options.tipText || "知道了";
    this.isConfirmbtn = (typeof options.isConfirmbtn == "boolean" ? options.isConfirmbtn : false) || false;
    this.confirmText = options.confirmText || "确定";
    this.isPromptbtn = (typeof options.isPromptbtn == "boolean" ? options.isPromptbtn : false) || false;
    this.conisPromptText = options.conisPromptText || ["确定","取消"];
    this.conisPromptLink= options.conisPromptLink || ["javascript:void(0);","javascript:void(0);"];
    this.conisPromptClass=options.conisPromptClass || ["",""];
    this.callback = typeof options.callback == "function" ?  options.callback : null;
    this.maskNoClickClose=(typeof options.maskNoClickClose == "boolean" ? options.maskNoClickClose : false) || false;
    this._createMask();
    this._createPopup();
    this._addEvent();
    return this;
}
Modal.prototype._createMask = function(){
    var mask = document.querySelector(".ovrly"), body = document.querySelector("body"), w, h;
    w = window.innerWidth > body.offsetWidth ? window.innerWidth : body.offsetWidth;
    h = window.innerHeight > body.offsetHeight ? window.innerHeight : body.offsetHeight;
    if(!mask){
        mask = document.createElement("div");
        mask.style.cssText = "width:100%;height:" + h + "px;background:rgba(0, 0, 0, 0.7);position:fixed;top:0;left:0;display:none;";
        mask.className = "ovrly";
        body.appendChild(mask)
    };
    return mask;
};
Modal.prototype._createPopup = function(){
    var popup = document.querySelector(".dialogBox"), body = document.querySelector("body"), html = "";
    if(this.wrapperClass){
        popup = document.querySelector("." + this.wrapperClass)
    }
    if(!popup){
        popup = document.createElement("div");
        popup.style.cssText = "position:fixed;z-index:11;top:50%;width:100%;left:50%;transform:translate(-50%,-50%);-webkit-transform:translate(-50%,-50%);display:none;";
        popup.className = "dialogBox";
        if(this.wrapperClass){
            popup.className += " " + this.wrapperClass;
        };
        html += '<div class="dialog"><div class="dialogTitle bottomBorder"><div class="titWord">' + this.title + '</div>';
        if(this.isClosebtn){
            html += '<a href="javascript:void(0);" class="closeBtn dialogCloseBtn">&nbsp;</a>';
        };
        html += '</div><div class="dialogConBox"><div class="dialogCon">';
        html += this.contentText;
        html += '</div></div>';
        if(this.isTipConfirm){
            html += '<div class="bottomBtn topBorder"><a href="javascript:void(0);" class="closeBtn dialogCloseBtn">' + this.tipText + '</a></div>'
        }
        if(this.isPromptbtn){
            html += '<div class="bottomBtn topBorder"><a href="'+this.conisPromptLink[1]+'" class="twoBtn dialogCloseBtn '+this.conisPromptClass[1]+'">'+this.conisPromptText[1]+'</a><a href="'+this.conisPromptLink[0]+'" class="twoBtn '+this.conisPromptClass[0]+'">'+this.conisPromptText[0]+'</a></div>'
        }
        html +=    '</div>';
        if(this.isConfirmbtn){
            html += '<div class="outsideBtn"><a href="javascript:void(0);" class="btn dialogConfirmBtn">' + this.confirmText + '</a></div>';
        };
        html += '</div>';
        popup.innerHTML = html;

        body.appendChild(popup);
    };
    return popup;

};
Modal.prototype._createTips = function(){
    var tips = document.querySelector(".tips"), body = document.querySelector("body"), html = "";
    if(!tips){
        tips = document.createElement("div");
        //tips.style.cssText = "display:none;z-index:10003;transform: translate(-50%,-50%);-webkit-transform: translate(-50%,-50%); position: fixed; left: 50%; top:49%; padding: 15px 15px; line-height:30px ; color: #000; font-size: 16px; font-weight: bold; background: rgba(255,255,255,0.9); border-radius: 5px;";
        tips.className = "tips";
        body.appendChild(tips)
    };
    return tips;
};
Modal.prototype._addEvent = function(){
    var self = this, mask = this._createMask(), popup = this._createPopup();
    if(!this.maskNoClickClose){
    	mask.addEventListener("click",function(event){
	        self.close();
	    }, false);
    }

    
    document.addEventListener("click",function(event){
        var target = event.target;
        if(hasClass(target, "dialogConfirmBtn")){
            self.callback&&self.callback();
        };
        if(hasClass(target, "dialogCloseBtn")){
            self.close();
            self.closeTips();
            event.preventDefault()
            return false;
        };
    }, false);
    function hasClass(obj,classname){
        var reg = new RegExp("\\b" + classname + "\\b");
        return reg.test(obj.className);
    }

};
Modal.prototype.open = function(){
    var mask = this._createMask(), popup = this._createPopup();
    mask.style.display = "block";
    popup.style.display = "block";
    ModalHelper.afterOpen();
};
Modal.prototype.close = function(){
    var mask = this._createMask(), popup = this._createPopup();
    ModalHelper.beforeClose();
    mask.style.display = "none";
    popup.style.display = "none";
    document.activeElement.blur();
};
Modal.prototype.openTips = function(content){
    var mask = this._createMask(), tips = this._createTips();
    tips.innerHTML = content;
    mask.style.display = "block";
    tips.style.display = "block";
    ModalHelper.afterOpen();
};
Modal.prototype.closeTips = function(){
    var mask = this._createMask(), tips = this._createTips();
    ModalHelper.beforeClose();
    mask.style.display = "none";
    tips.style.display = "none";
    document.activeElement.blur();
};

