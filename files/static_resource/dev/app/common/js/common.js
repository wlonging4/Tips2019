import "../css/common.less";
let $ = require("jquery");
require("./flexible");
const G = {
    base:'/webapi'
};

/**
 * 浮点计算calculatorjs
 * calc.add(0.1, 0.2) // 0.3
 * calc.sub(0.1, 0.2) // -0.1
 * calc.mul(0.1, 0.2) // 0.02
 * calc.div(0.1, 0.2) // 0.5
 * calc.round(0.555, 2) // 0.56
 *
 * **/
const CALC = require('calculatorjs');

/**
 * 弹窗控件 http://aui.github.io/artDialog/doc/index.html#module
 * **/
let Dialog = require('art-dialog');

/**
 * bridge 是和app交互的方法
 * **/

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

/**
 * Tools是常用的工具函数
 * **/
let Tools = {
    /**
     * 修改ajax
     * **/
    AJAX:function (options) {
        options = $.extend({
            dataType:"json"
        }, options);
        return $.ajax(options)
    },
    XHAJAX:function (options) {
        options = $.extend({
            type:"post",
            dataType:"json"
        }, options);
        options.data = {
            data:JSON.stringify({
                appReqData:options.data
            })
        };
        return $.ajax(options)
    },
    /**
     * 获取 数据 签名 ，token等信息
     * data 是要封装的数据
     * isEncrypt 数据是否要加密
     *
     * 返回的是 promise
     * **/
    signData:function (data, isEncrypt) {
        if(Object.prototype.toString.call(data) !== "[object Object]"){
            return Promise.resolve({});
        }
        let isAes = isEncrypt ? "1" : "0";
        return Tools.BRIDGE("xhReqDataHandle",{
            "reqDataJson":JSON.stringify(data),
            "isAes":isAes
        });
    },
    /**
     * 请求/capp 开头接口
     * **/
    AJAXTOKEN:function (options) {
        let self = this;
        options = $.extend({
            type:"post",
            dataType:"json",
            data:{}
        }, options);
        return this.signData(options.data).then(function (resStr) {
            options.data = {
                data:resStr
            };
            return self.AJAX(options);
        })
    },
    /**
     * 跟APP交互的bridge代码 callHandler
     * CMD    是跟APP约定好的命令名称
     * params 是传给APP的参数
     * **/
    BRIDGE:function (CMD, params) {
        return new Promise(function (resolve, reject) {
            setupWebViewJavascriptBridge(function(bridge) {
                bridge.callHandler(CMD, params, function(resStr) {
                    if(Object.prototype.toString.call(resStr) !== '[object String]'){
                        resStr = JSON.stringify(resStr)
                    }
                    //res 是个字符串
                    resolve(resStr)
                })
            })
        })
    },
    /**
     * 跟APP交互的bridge代码 registerHandler
     * CMD    是跟APP约定好的命令名称
     * **/
    REGISTERBRIDGE:function (CMD) {
        return new Promise(function (resolve, reject) {
            setupWebViewJavascriptBridge(function(bridge) {
                bridge.registerHandler(CMD, function(resStr) {
                    if(Object.prototype.toString.call(resStr) !== '[object String]'){
                        resStr = JSON.stringify(resStr)
                    }
                    //res 是个字符串
                    resolve(resStr)
                })
            })
        })
    },
    /**
     * 获取用户信息 token  userId managerId
     * **/
    getUserInfo:function () {
      return this.REGISTERBRIDGE("xhUserInfoToWeb").then(function (data) {
          data = JSON.parse(data);
          return Promise.resolve(data);
      })
    },
    /**
     * 分享功能
     * {
     *   "shareType": "",
     *   "shareTitle": "",
     *   "shareContent": "",
     *  "shareImageUrl": "",
     *   "shareUrl": ""
     * }
     *
     * **/
    SHARE:function (params) {
        params = $.extend({}, params);
        return this.BRIDGE('xhShareSocialPlatform', params)
    },
    shareHeaderBtn:function (params){
		params = $.extend({}, params);
        return this.BRIDGE('xhShowButton', params);
	},
    /**
     * 下载图片
     * **/
    DownloadImg:function (params) {
        params = $.extend({}, params);
        return this.BRIDGE('xhDownload', params);
    },
    /**
     * 设置页面title
     * **/
    setTitle:function (titleStr) {
        return this.BRIDGE("xhWebTitle", titleStr)
    },
    /**
     * h5通过app跳转到别的h5,  参数复制 要深复制
     * **/
    bridgeRedirect:function (url, params) {
        params = $.extend(true, {
            "page":"webview",
            "pageParams":{
                "url":url,
                login:"1"
            }
        }, params);
        return this.BRIDGE("xhH5GoAppPages", params)
    },
    /**
     * h5跳转app
     * **/
    redirectApp:function (appPage,params) {
        let options = {
            'page': appPage,
            pageParams: params
        }
        return this.BRIDGE("xhH5GoAppPages", options)
    },
    /**
     * 序列化URL的参数
     * **/
    queryUrl:function(url){
        var result = {}, arr, str, key, key_arr, len;
        if(url.indexOf('?') != -1){
            arr = url.split('?');
            str = arr[1];
            arr = str.split('&');
            len = arr.length;
            if(len > 0){
                for(var i = 0;i < len; i++){
                    key = arr[i];
                    key_arr = key.split('=');
                    result[key_arr[0]] = key_arr[1];
                };
            };
        };
        return result;
    },
    /**
     * 数字千分位 格式化
     * **/
    formatNumber: function(num){
        if (isNaN(num)) {
            throw new TypeError("num is not a number");
        }
        return ("" + num).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
    },
    /**
     * toast
     * msg  消息内容
     * cb 关闭之后的 回调函数
     * during 延时多久toast 关闭 默认是2秒
     * **/
    toast:(function () {
        let timer, dialog = null, delayShowTimer = null;
        function isIOS() {
            var u = navigator.userAgent;
            return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
        }
        return function (msg, during, cb) {
            if(!dialog){
                dialog = Dialog({
                    id:'totast',
                    fixed: true,
                    skin:"xhModal",
                    width: 210,
                    content:msg
                });
                clearTimeout(delayShowTimer);
                /**异步去显示，主要是怕页面软键盘影响页面视窗，影响toast定位**/
                $("input").blur();
                delayShowTimer = setTimeout(()=>{
                    dialog.showModal();
                }, 300);
                clearTimeout(timer);
                during = during || 2000;
                timer = setTimeout(()=>{
                    dialog.close().remove();
                    if(cb && typeof cb === "function"){
                        cb();
                    }
                    dialog = null;
                    timer = null;
                }, during)
            }
            return true;
        }
    })(),
    /**
     * 弹窗
     * skin: 样式 ，默认是xhModal
     * title 标题
     * content 内容
     * cancel 取消按钮 文案
     * confirm 确定按钮 文案
     * confirmCB 确定按钮 回调，回调函数 return false,可以阻止弹窗关闭
     * **/
    dialogConfirm:function (options) {
        options = $.extend({
            id:"confirm",
            skin:"xhModal",
            title:"",
            content:"内容",
            cancel: "取消",
            confirm:"确定",
            confirmCB:function () {

            }

        },options);
        let dialog = Dialog({
            id:options.id,
            skin:"xhModal",
            title: options.title,
            content: options.content,
            // quickClose: true,
            button:[{
                id:"button-close",
                value: options.cancel
            },{
                id:"button-confirm",
                value: options.confirm,
                callback:options.confirmCB
            }],
            cancel: false
        });
        dialog.showModal();
        return dialog;
    },
    /**
     *
     * **/
    dialogAlert:function (options) {
        options = $.extend({
            id:"dialogAlert",
            skin:"xhModal",
            title:"",
            content:"内容",
            confirm:"确定",
            quickClose: true,
            confirmCB:function () {

            }

        },options);
        let dialog = Dialog({
            id:options.id,
            skin:"xhModal",
            title: options.title,
            content: options.content,
            quickClose: options.quickClose,
            button:[{
                id:"button-confirm",
                value: options.confirm,
                callback:options.confirmCB
            }],
            onshow:function () {

            },
            cancel: false
        });
        dialog.showModal();
        return dialog;
    }

};




export {CALC, Tools, G, Dialog}
