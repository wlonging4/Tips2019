/**
 * Created by Administrator on 2015/11/17.
 */
/*
 * utils 1.0
 * 建立一个命名空间
 * By Moker on 2015/11/17
 */
(function () {
var _u = {
    //将类数组转换为数组
    listToArray: function listToArray(likeAry) {
        var ary = [];
        try {
            ary = Array.prototype.slice.call(likeAry, 0);
        } catch (e) {
            for (var i = 0; i < likeAry.length; i++) {
                ary[ary.length] = likeAry[i];
            }
        }
        return ary;
    },
    //JSON转换为对象
    toJSON: function toJSON(str) {
        return "JSON" in window ? JSON.parse(str) : eval("(" + str + ")");
    }
};
    window.utils=_u;
/*
 DOM基本方法
 */
//通过样式类名获取我们的元素
_u.getElementsByClass = function getElementsByClass(strClass, context) {
    //这里的this都是表示utils
    //context表示指定上下文;可以document或者oDiv等;如果第二个参数不传为document
    //使用getElementByID/Name这两个方法的上下文是document;
    context = context || document;
    if ("getElementsByClassName" in document) {
        return this.listToArray(context.getElementsByClassName(strClass));
        //返回转化为一个数组
    }
    //去除首位空格并且拆分数组;
    strAry = strClass.replace(/(^\s+)|(\s+$)/g, "").split(/\s+/);
    var ary = [];
    var tagList = context.getElementsByTagName("*");
    for (var i = 0; i < tagList.length; i++) {
        var curTag = tagList[i];
        var flag = true;
        for (var k = 0; k < strAry.length; k++) {
            var reg = new RegExp("(^| +)" + strAry[k] + "( +|$)");
            if (!reg.test(curTag.className)) {
                flag = false;
                break;
            }
        }
        flag ? ary[ary.length] = curTag : null;
    }
    return ary;
    /*for(var i=0;i<strAry.length;i++){
     var curStr=strAry[i];
     var reg=new RegExp("(^| +)"+curStr+"( +|$)");
     for(var j=0;j<tagList.length;j++){
     if(reg.test(tagList[j].className)){
     //ary.push[tagList[j]];
     ary[ary.length]=tagList[j];
     }
     }
     }*/
};
//获取指定元素下的所有元素子节点(可以指定获取具体的标签)
_u.children = function children(curEle, tagName) {
    var nodeList = curEle.childNodes;
    var ary = [];
    for (var i = 0; i < nodeList.length; i++) {
        var curNode = nodeList[i];
        if (curNode.nodeType === 1) {
            if (typeof tagName === "string") {
                var curNodeLow = curNode.nodeName.toLowerCase();
                var tagNameLow = tagName.toLowerCase();
                if (curNodeLow === tagNameLow) {
                    ary[ary.length] = curNode;
                }
                continue;
                //如果传递了第二个参数不进行下面这一步;因为上面执行了continue;
            }
            ary[ary.length] = curNode;
        }
        return ary;
    }
};
//获取指定元素上一个哥哥元素节点
_u.prev= function prev(curEle) {
    if("previousElementSibling" in curEle){
        return curEle.previousElementSibling;
    }
    var pre=curEle.previousSibling;
    while(pre&&pre.nodeType!==1){
        pre=pre.previousSibling;
    }
    return pre;
};
//获取指定元素所有哥哥元素节点
_u.prevAll= function prevAll(curEle) {
    var pre=this.prev(curEle);
    var ary=[];
    while(pre){
        ary[ary.length]=pre;
        pre=this.prev(pre);
    }
    return ary;
};
//获取指定元素节点索引值
_u.getIndex= function getIndex(curEle) {
    return this.prevAll(curEle).length;
    //嵌套查找速度快
};
//获取指点元素的上一个弟弟元素节点
_u.next=function next(curEle){
    if("nextElementSibling" in curEle){
        return curEle.nextElementSibling;
    }
    var nex=curEle.nextSibling;
    while(nex&&nex.nodeType!==1){
        nex=nex.nextSibling;
    }
    return nex;
};
//获取指定元素的所有弟弟元素节点
_u.nextAll= function nextAll(curEle) {
    var nex=this.next(curEle);
    var ary=[];
    while(nex){
        ary[ary.length]=nex;
        nex=this.next(nex);
    }
    return ary;
};
//获取指定元素的相邻兄弟节点
_u.sibling= function sibling(curEle) {
    var pre=this.prev(curEle);
    var nex=this.next(curEle);
    var ary=[];
    pre?ary[ary.length]=pre:null;
    nex?ary[ary.length]=nex:null;
    return ary;

};
//获取指定元素的所有兄弟节点
_u.siblings= function siblings(curEle) {
    var preA=this.prevAll(curEle);
    var nexA=this.nextAll(curEle);
    return preA.concat(nexA)
};
//获取指定元素的第一个元素子节点
_u.first= function first(curEle,tagName) {
    return this.children(curEle,tagName)[0];
};
//获取指定元素的最后一个元素子节点
_u.last= function last(curEle,tagName) {
    var child=this.children(curEle,tagName);
    return child[child.length-1];
};
/*
DOM样式方法
*/
//获取和设置当前元素的样式;第三个参数传递为设置attr的value值
_u.css = function css(curEle, attr, value) {
    //get style
    var reg = /^[+-]?(\d|([1-9]\d+))(\.\d+)?(px|pt|em|rem)$/;
    if (typeof value === "undefined") {
        var val = "getComputedStyle" in window ? window.getComputedStyle(curEle, null)[attr] : curEle.currentStyle[attr];
        return reg.test(val) ? parseFloat(val) : val;
    }
    //set style
    reg = /^(width|height|top|left|right|bottom|((margin|padding)(Left|Top|Right|Bottom)?))$/;
    if (attr === "opacity") {
        if (value >= 0 && value <= 1) {
            curEle["style"]["opacity"] = value;
            curEle["style"]["filter"] = "alpha(opacity=" + value * 100 + ")";
        }
    } else if (attr === "float") {
        curEle["style"]["cssFloat"] = value;
        curEle["style"]["styleFloat"] = value;
    } else if (reg.test(attr)) {
        curEle["style"][attr] = isNaN(value) ? value : value + "px";
    } else {
        curEle["style"][attr] = value;
    }
};
//批量更改css样式
_u.setGroupCss= function setGroupCss(curEle,options) {
      //option是一个样式属性属性值集合
    for(var key in options){
        if(options.hasOwnProperty(key)){
            //加这个判断是判断在Object原型上扩展增加的公有方法Object.prototype.X..不被for in遍历出来；这样只会遍历出来私有的属性;以后在任何的for in遍历中都要加上：for(var x in obj)；
            this.css(curEle,key,options[key])
        }
    }
};
//获取当前元素距离body的偏移量
_u.offset=function offset(curEle){
    var p=curEle.offsetParent;
    var l=curEle.offsetLeft;
    var t=curEle.offsetTop;
    while(p){
        if(window.navigator.userAgent.indexOf("MSIS 8")>-1){
            l+= p.offsetLeft;
            t+= p.offsetTop;
        }else{
            l+= p.offsetLeft+ p.clientLeft;
            t+= p.offsetTop+ p.clientTop;
        }
        p= p.offsetParent;
    }
    return {l:l,t:t}
};
//兼容获取盒子模型值及更改
_u.win= function win(attr,value) {
    if(typeof value==="undefined"){
        return document.documentElement[attr]||document.bodyu[attr];
    }
    document.documentElement[attr]=value;
    document.body[attr]=value;
    //设置不需要返回值
};
//判断当前这个元素是否具有这个元素类名
_u.hasClass= function hasClass(curEle,strClass) {
    var reg=new RegExp("(^| +)"+strClass+"( +|$)");
    return reg.test(curEle.className);
};
//给当前元素增加样式名，若有不增加
_u.addClass= function addClass(curEle,strClass) {
    if(!this.hasClass(curEle.strClass)){
        curEle.className+=" "+strClass;
    }
};
//移除当前元素的样式名
_u.removeClass= function removeClass(curEle,strClass) {
    var reg=new RegExp("(^| +)"+strClass+"( +|$)");
    if(this.hasClass(curEle,strClass)){
        curEle.className=curEle.className.replace(reg," ");
    }
};
//判断元素间是否存在样式类名,若有则删除,没有则增加;
_u.tollageClass= function tollageClass(curEle,strClass) {
    this.hasClass(curEle,strClass)?this.removeClass(curEle,strClass):this.addClass(curEle,strClass);
};
/*
DOM增加删除
*/
//设置或者获取当前属性的属性值->解决setAttribute在IE678不能改class值
_u.attr= function attr(curEle,attr,value) {
    if(typeof value==="undefinded"){
        return attr==="class"?curEle.className:curEle.getAttribute(attr);
    }
    attr==="class"?curEle.className=value:curEle.setAttribute(attr,value);
};
//设置或者获取非表单元素里的内容
_u.html= function html(curEle,value) {
    if(typeof value==="undefinded"){
        return curEle.innerHTML;
    }
    curEle.innerHTML=value;
};
//向容器的开头添加元素，和appendChild相反
_u.prepend= function prepend(contain,newEle) {
    var fir=this.first(contain);
    if(fir){
        contain.insertBefore(newEle,fir);
    }
    contain.appendChild(newEle);
};
//向指定元素后添加新元素，和insertBefore恰好相反
_u.insertAfter= function insertAfter(oldEle,newEle) {
    var nex=this.next(oldEle);
    var par=oldEle.parentNode;
    nex?par.insertBefore(newEle,nex):par.appendChild(newEle);
};
//外接接口可以扩展类库
_u.extend= function extend(options) {
    for(var key in options){
        if(options.hasOwnProperty(key)){
            this[key]=options[key];
        }
    }
}
})();



//给utils扩展的方法->utils.isNum(val):检测数据类型
~function (utils) {
    var numObj = {
        isNum: "Number",
        isStr: "String",
        isBoo: "Boolean",
        isNul: "Null",
        isUnd: "Undefined",
        isObj: "Object",
        isAry: "Array",
        isFun: "Function",
        isReg: "RegExp",
        isDate: "Date"
    },
    isType = function () {
        var outerArg = arguments[0];
        return function () {
            var innerArg = arguments[0];
            var reg = new RegExp("^\\[object " + outerArg + "\\]$", "i");
            return reg.test(Object.prototype.toString.call(innerArg));
        }
    };
    for (var key in numObj) {
        if (numObj.hasOwnProperty(key)) {
            utils[key] = isType(numObj[key]);
        }
    }
}(utils);

//原型上内置类扩展的方法;使用步骤str.XX;reg.YY;ary.ZZ;
~function () {
    var aryPro = Array.prototype,strPro = String.prototype, regPro = RegExp.prototype;
    //unique：数组去重
    aryPro.unique = function unique() {
        var obj = {};
        for (var i = 0; i < this.length; i++) {
            var cur = this[i];
            obj[cur] == cur ? (this[i] = this[this.length - 1], this.length -= 1, i--) : obj[cur] = cur;
        }
        obj = null;
        return this;
    };

    //myForEach：forEach compatibility
    aryPro.myForEach = function myForEach(callBack, context) {
        if (Array.prototype.forEach) {
            return this.forEach(callBack, context);
        }
        for (var i = 0; i < this.length; i++) {
            callBack.call(context, this[i], i, this);
        }
    };

    //myMap：map compatibility
    aryPro.myMap = function myMap(callBack, context) {
        if (Array.prototype.map) {
            return this.map(callBack, context);
        }
        for (var i = 0; i < this.length; i++) {
            this[i] = callBack.call(context, this[i], i, this);
        }
        return this;
    };

    //myTrim：移除字符串首位空格
    strPro.myTrim = function myTrim() {
        return this.replace(/(^\s+|\s+$)/g, "");
    };

    //mySub：区别中英文的字符串截取
    strPro.mySub = function mySub() {
        var len = arguments[0] || 10, isD = arguments[1] || false, str = "", n = 0;
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

    //myFormatTime：标准时间格式
    strPro.myFormatTime = function myFormatTime() {
        var reg = /^(\d{4})(?:-|\/|\.|:)(\d{1,2})(?:-|\/|\.|:)(\d{1,2})(?:\s+)(\d{1,2})(?:-|\/|\.|:)(\d{1,2})(?:-|\/|\.|:)(\d{1,2})$/g, ary = [];
        this.replace(reg, function () {
            ary = ([].slice.call(arguments)).slice(1, 7);
        });
        var format = arguments[0] || "{0}年{1}月{2}日 {3}:{4}:{5}";
        return format.replace(/{(\d+)}/g, function () {
            var val = ary[arguments[1]];
            return val.length === 1 ? "0" + val : val;
        });
    };

    //queryURLParameter：获取URL地址栏的参数信息
    strPro.queryURLParameter = function queryURLParameter() {
        var reg = /([^?&=]+)=([^?&=]+)/g, obj = {};
        this.replace(reg, function () {
            obj[arguments[1]] = arguments[2];
        });
        return obj;
    };

    //myExecAll：一次捕获所有匹配正则的内容,实现类似str.match的功能
    regPro.myExecAll = function myExecAll(str) {
        var reg = !this.global ? eval(this.toString() + "g") : this;
        var ary = [], res = reg.exec(str);
        while (res) {
            ary[ary.length] = res[0];
            res = reg.exec(str);
        }
        return ary.length === 0 ? null : ary;
    };
}();

