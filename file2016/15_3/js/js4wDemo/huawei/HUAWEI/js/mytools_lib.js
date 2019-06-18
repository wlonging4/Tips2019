/**
 * Created by Andy on 2015/6/28
 */

 /*DOM库*/
var Dlibs = function () {
    this.flag = "getElementsByClassName" in document;
};
Dlibs.prototype = {
    construcor: Dlibs,
    //获取指定元素下的指定元素子节点，当第二个参数不传的时候，获取的是所有子元素节点；
    getChildren: function () {
        var parent = arguments[0],
            tagName = arguments[1],
            allNode = parent.childNodes,
            ary = [],
            reg = new RegExp("^" + tagName + "$", "i");
        for (var i = 0; i < allNode.length; i++) {
            var cur = allNode[i];
            if (cur.nodeType === 1) {
                if (tagName) {
                    if (reg.test(cur.nodeName)) {
                        ary.push(cur);
                    }
                    continue;
                }
                ary.push(cur);
            }
        }
        return ary;
    },
    //获得指定元素下一个兄弟元素节点
    getNextEle: function () {
        var ele = arguments[0]
        var next = ele.nextSibling;
        while (next) {
            if (next.nodeType === 1) {
                return next;
            }
            next = next.nextSibling;
        }
        return null;
    },
    //获得元素的指定标签名的弟弟元素节点，如果不指定弟弟的标签名的话，返回所有标签弟弟元素节点;
    getNextAll: function () {
        var ele = arguments[0];
        var tagName = arguments[1];
        var a = [];
        var next = this.getNextEle(ele);
        if (tagName && typeof tagName == "string") {
            while (next) {
                if (next.tagName.toLowerCase() == tagName.toLowerCase()) {
                    a.push(next);
                }
                next = this.getNextEle(next);
            }
        } else {
            while (next) {
                a.push(next);
                next = this.getNextEle(next);
            }
        }
        return a;
    },
    //获取指定元素的上一个兄弟元素节点
    getPreEle: function () {
        var ele = arguments[0];
        var preNode = ele.previousSibling;
        if (preNode) {
            if (preNode.nodeType === 1) {
                return preNode;
            } else {
                return arguments.callee(preNode);
            }
        } else {
            return null;
        }
    },
    //获取元素指定标签名的哥哥元素节点，如果没有指定，返回所有的标签名哥哥元素节点;
    getPreAll: function () {
        var ele = arguments[0];
        var tagName = arguments[1];
        var a = [];
        var pre = this.getPreEle(ele);
        if (typeof tagName == "string") {
            while (pre) {
                if (pre.tagName.toLowerCase() == tagName.toLowerCase()) {
                    a.push(pre);
                }
                pre = this.getPreEle(pre);
            }
        } else {
            while (pre) {
                a.push(pre);
                pre = this.getPreEle(pre);
            }
        }
        return a;
    },
    //获取指定元素的所有兄弟节点
    getSiblings: function () {
        var ele = arguments[0];
        var a = [];
        var sib = ele.parentNode.children;
        for (var i = 0; i < sib.length; i++) {
            if (sib[i] != ele && sib[i].nodeType == 1) {
                a.push(sib[i]);
            }
        }
        return a;
    },
    //获得元素下指定标签名的的子元素，如果没有传第二个参数，就返回所有的子元素;
    getEleChildren: function () {
        var ele = arguments[0];
        var tagName = arguments[1];
        if (ele.nodeType && ele.nodeType === 1) {
            if (typeof tagName == "string") {
                tagName = tagName.toUpperCase();
                var a = [];
                var ch = ele.childNodes;
                for (var i = 0; i < ch.length; i++) {
                    if (ch[i].nodeType === 1 && ch[i].tagName == tagName) {
                        a.push(ch[i]);
                    }
                }
                return a;
            } else {
                var a = [];
                var ch = ele.childNodes;
                for (var i = 0; i < ch.length; i++) {
                    if (ch[i].nodeType === 1) {
                        a.push(ch[i]);
                    }
                }
                return a;
            }

        } else {
            alert("参数错误")
        }
    },
    //获得目标元素的第一个子元素;
    getFirstEle: function () {
        var ele = arguments[0],
            children = this.getChildren(ele);
        return children.length > 0 ? children[0] : null;
    },
    //获得目标元素的最后一个子元素;
    getLastEle: function () {
        var ele = arguments[0],
            children = this.getChildren(ele);
        return children.length > 0 ? children[children.length - 1] : null;
    },
    //把要插入的元素追加在目标元素的后面(同辈关系);
    insertAfter: function () {
        var newEle = arguments[0];
        var oldEle = arguments[1];
        if (oldEle.nodeType === 1 && newEle.nodeType === 1) {
            if (oldEle.nextSibling) {
                oldEle.parentNode.insertBefore(newEle, oldEle.nextSibling);

            } else {
                oldEle.parentNode.appendChild(newEle);
            }
        } else {
            throw new Errow("参数错误");
        }
    },
    //把参数元素插入到目标元素的第一子元素位置;
    prepend: function () {
        var tarNode = arguments[0];
        var ele = arguments[1];
        var child = tarNode.firstChild;
        if (child) {
            tarNode.insertBefore(ele, tarNode.firstChild);
        } else {
            tarNode.appendChild(ele);
        }
    },
    //获得或设置指定元素文本值兼容性方法（没有传入第二个参数的时候就是获得）;
    getText: function () {
        var ele = arguments[0];
        var str = arguments[1];
        if (ele.nodeType === 1) {
            if (str === undefined) {
                if (typeof ele.textContent === "string") {
                    return ele.textContent;
                } else {
                    return ele.innerText;
                }
            } else {
                if (typeof ele.textContent == "string") {
                    ele.textContent = str;
                } else {
                    ele.innerText = str;
                }
            }
        } else {
            alert("参数错误");

        }


    },
    //获得参数元素的索引
    getIndex: function () {
        var ele = arguments[0];
        var n = 0;
        var pre = ele.previousSibling;
        while (pre) {
            if (pre.nodeType == 1) {
                n++;
            }
            pre = pre.previousSibling;
        }
        return n;
    },
    //将字符串转换成jsonSON格式的对象
    toJsonObj: function () {
        var jsonObj = null;
        jsonStr = arguments[0];
        try {
            jsonObj = jsonStr.parse(jsonStr);
        } catch (e) {
            jsonObj = eval("(" + jsonStr + ")");
        }
        return jsonObj;
    },
    //检测数据类型
    isType: function () {
        var value = arguments[0];
        var type = arguments[1] || "object";
        var reg = new RegExp("\\[object," + type + "\\]", "i");
        return reg.test({}.toString.call(value));
    },
    //类数组转化成数组
    listToArray: function () {
        var ary = [], likeAry = arguments[0];
        if (this.flag) {
            ary = [].slice.call(likeAry, 0);
        } else {
            for (var i = 0; i < likeAry.length; i++) {
                ary.push(likeAry[i]);
            }
        }
        return ary;

    },
    //通过ID名获得元素
    getEleById:function(){return document.getElementById(arguments[0])},
    //通过类名获得元素，且返回的是数组型结果；
    getElesByClass: function () {
        var cName = arguments[0], context = arguments[1] || document, ary = [];
        if (this.flag) {
            return this.listToArray(context.getElementsByClassName(cName));
        }
        var allNode = context.getElementsByTagName("*"), reg = new RegExp("(?:^| +)" + cName + "(?: +|$)");
        for (var i = 0; i < allNode.length; i++) {
            var cur = allNode[i];
            if (reg.test(cur.className)) {
                ary.push(cur);
            }
        }
        return ary;
    },
    //获得偏移量;
    getOffset: function () {
        var curEle = arguments[0],
            left = curEle.offsetLeft,
            top = curEle.offsetTop,
            par = curEle.offsetParent;
        while (par) {
            left += par.offsetLeft, top += par.offsetTop;
            if (navigator.userAgent.indexOf("MSIE 8.0") <= -1) { //不是IE8
                left += par.clientLeft, top += par.clientTop;
            }
            par = par.offsetParent;
        }
        return {left: left, top: top};
    },
    //设置或者读取元素单个Css属性，处理兼容性与容错性问题；
    setAndgetcss:function(ele,attr,value){
        if(typeof value=="undefined"){
            try{return parseFloat(getComputedStyle(ele,null)[attr])
            }catch(e){
                if(attr="opacity"){
                    var reg=/alpha\(opacity=(\d+(?:\.\d+)?)\)/;
                    if(reg.test(ele.currentStyle.filter)){
                        return RegExp.$1;
                    }else{return 1}
                }else {
                    return parseFloat(ele.currentStyle[attr]);
                }
            }
        }else if(arguments.length==3){

            if (attr == "opacity") {
                ele.style[attr] = value;
                ele.style.filter = "alpha(opacity=" +value*100+")";
            } else {
                ele.style[attr] = value + "px";
            }
        }
    },
    //元素的多个CSS属性值同时设置(也可以多个元素同时设置样式)
    setGroupCss: function () {
        /*单个元素时*/
        var curele = arguments[0];
        var styleObj = arguments[1];
        for (var att in styleObj) {
            this.setAndgetcss(curele, att, styleObj[att])
        }
        /*当输入的是一组元素时*/
        if (curele && curele.length > 0) {
            for (var i = 0; i < curele.length; i++) {
                for (var att in styleObj) {
                    this.setCss(curele[i], att, styleObj[att]);
                }
            }
        }
    },
    //增加类样式的方法
    addCss: function () {
        var ele = arguments[0];
        var strClass = arguments[1];
        if (ele && ele.nodeType === 1 && typeof strClass == "string") {
            var reg = new RegExp("(?:^| +)" + strClass + "(?: +|$)");
            if (!reg.test(ele.className)) {
                ele.className += " " + strClass;
            }
        }
    },
    //移除类样式
    removeClass: function () {
        var cName = arguments[0],
            curEle = arguments[1],
            reg = new RegExp("(?:^| +)" + cName + "(?: +|$)", "g");
        if (this.hasClass(cName, curEle)) {
            curEle.className = curEle.className.replace(reg, " ");
        }
    },
    //检测是否有那个样式
    hasClass: function () {
        var ele = arguments[0];
        var strClass = arguments[1];
        if (ele && ele.nodeType === 1 && (typeof strClass == "string")) {
            var reg = new RegExp("(?:^| +)" + strClass + "(?: +|$)");
            if (reg.test(ele.className)) {
                return true;
            } else {
                return false;
            }

        }
    }
}
/*事件库*/
var Elibs = {
    /*获得事件对象*/
    getEvent: function (event) {
        return event ? event : window.event;
    },
    /*获得事件源*/
    getTarget: function (event) {
        return event.target || event.srcElement;
    },
    /*阻止默认行为*/
    preventDefault: function (event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },
    /*阻止冒泡*/
    stopPropagation: function (event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },
    /*获得pageX,pageY*/
    pageXAY: function (event) {
        if (typeof event.pageX=="undefined") {
            event.pageX = (document.documentElement.scrollLeft || document.body.scrollLeft) + event.clientX;
            event.pageY = (document.documentElement.scrollTop || document.body.scrollTop) + event.clientY;
        }
        return {pagex: pageX, pagey: event.pageY};
    },
    /*改变this指向*/
    guideThis: function (obj, fn) {
        return function (event) {
            fn.call(obj, event);
        }
    },
    /*元素注册某一类型的方法*/
    on: function (ele, type, handler) {
        if (ele.addEventListener) {
            ele.addEventListener(type, handler, false);
        } else if (ele.attachEvent) {
            if (!ele["iEvent" + type]) {
                ele["iEvent" + type] = [];
            }
            var a = ele["iEvent" + type];
            for (var i = 0; i < a.lenght; i++) {
                if (a[i] == handler) {
                    return;
                }
            }
            a.push(handler);
            if (!ele["atta" + type]) {
                ele["atta" + type] = Dlibs.guideThis(ele, Elibs.run);
                ele.attachEvent("on" + type, ele["atta" + type]);
            }
        }
    },
     /*IE下的执行*/
    run: function () {
        var e = window.event;
        var type = e.type;
        var a = this["iEvent" + type];
        if (!a) return;
        e.target = e.scrElement;
        e.preventDefault = function () {
            e.returnValue = false;
        }
        e.stopPropagation = function () {
            e.cancelBubble = true;
        }
        e.pageX = (document.documentElement.scrollLeft || document.body.scrollLeft) + e.clientX;
        e.pageY = (document.documentElement.scrollTop || document.body.scrollTop) + e.clientY;
        for (var i = 0; i < a.length;) {
            if (a[i] === null) {
                a.splice(i, i)
            } else {
                a[i].call(this, e);
                i++;
            }
        }
    },
    /*元素解除某一类型的方法*/
    off: function (ele, type, handler) {
        if (ele.removeEventListener) {
            ele.removeEventListener(type, handler, false);
        } else if (ele.detachEvent) {
            var a = this['iEvent' + type];
            if (a) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i] === handler) {
                        a[i] = null;
                    }
                }
            }
        }
    },
    createXHR: function () {
        if (typeof XMLHttpRequest != "undefined") {
            Elibs.createXHR = function () {
                return new XMLHttpRequest();
            }
        } else if (typeof ActiveXObject != "undefined") {
            Elibs.createXHR = function () {
                if (typeof arguments.callee.activeXString != "string") {
                    var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"];
                    for (var i = 0, len = versions.length; i < len; i++) {
                        try {
                            var xhr = new ActiveXObject(versions[i]);
                            arguments.callee.activeXString = versions[i];
                            return xhr;
                        } catch (ex) {
                            //跳过
                        }
                    }
                }
                return new ActiveXObject(arguments.callee.activeXString);
            }
        } else {
            Elibs.createXHR = function () {
                throw new Error("No XHR object available.");
            };
        }
        return Elibs.createXHR();
    }
};
/*扩展方法*/
~(function () {
    var arrPro = Array.prototype;
    var strPro = String.prototype;
    var objPro = Object.prototype;
    arrPro.myDistinct = function () {
        var obj = {};
        for (var i = 0; i < this.length; i++) {
            var cur = this[i];
            if (obj[cur] == cur) {
                this.splice(i, 1);
                i--;
                continue;
            }
            obj[cur] = cur;
        }
        obj = null;
        return this;
    };
    arrPro.myForEach = function () {
        var fn = arguments[0], context = arguments[1] || window;
        if (this.forEach) {
            this.forEach(fn, context);
            return this;
        }
        for (var i = 0; i < this.length; i++) {
            fn.call(context, this[i], i, this);
        }
        return this;
    };//解决IE8以下不兼容的问题
    strPro.myTrim = function () {
        return this.replace(/(^\s*|\s*$)/g, "");
    };
    strPro.mySub = function () {
        var len = arguments[0] || 10,
            isD = arguments[1] || false,
            str = "",
            n = 0;
        for (var i = 0; i < this.length; i++) {
            var s = this.charAt(i);
            /[\u4e00-\u9fa5]/.test(s) ? n += 2 : n++;
            if (n > len) {
                isD ? str += "..." : void 0;
                break;
            }
            str += s;
        }
        return str;
    };
    strPro.urlToJason = function () {
        var temp = null;
        var reg = /([^?=&]+)=([^?=&]+)/g;
        var obj = {};
        while (temp = reg.exec(this)) {
            obj[temp[1]] = temp[2];
        }
        return obj;

    };
    objPro.isPubPropoty = function () {
        var attr = arguments[0];
        return (attr in this) && !this.hasOwnProperty(attr);
    };
    strPro.forMatTime = function () {
        var arry = [];
        var reg1 = /[-:/\s]+/;
        arry = this.split(reg1);

        var format = arguments[0] || "{1}年{2}月{3}日{4}时{5}分{6}秒";
        var reg2 = /{(\d+)}/g;
        format.replace(reg2, function () {
            var val = arry[arguments[1]];
            return val.length === 1 ? "0" + val : val;
        })
    }
})();



