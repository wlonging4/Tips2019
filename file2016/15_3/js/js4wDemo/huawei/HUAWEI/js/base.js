window.t= new Dlibs();
window.onload = function () {
    var cube = new Carousel();
    cube.count = 3;
    cube.int("lunbo");
    backToTop.init();
    movenews.init();
};
/* 回到顶部 */
var backToTop = {
    isTop: true,
    time: null,
    init: function () {
        var btn = document.getElementById("btn");
        var ksh = document.documentElement.clientHeight;
        btn.style.top = ksh - btn.offsetHeight - 60 + "px";
        window.onscroll = function () {
            var pp = document.documentElement.scrollTop || document.body.scrollTop;
            if (pp >= ksh) {
                btn.style.display = "block";
            } else {
                btn.style.display = "none";
            }
            if (!backToTop.isTop) {

                clearInterval(backToTop.time);
            }
            backToTop.isTop = false;
        };
        btn.onclick = function () {
            backToTop.time = setInterval(function () {
                backToTop.isTop = true;
                var sTp = document.documentElement.scrollTop || document.body.scrollTop;
                var speed = Math.floor(-sTp / 8);
                document.documentElement.scrollTop = document.body.scrollTop = sTp + speed;
                if (sTp == 0) {
                    clearInterval(backToTop.time);
                    backToTop.time = null;
                }
            }, 50);
        }
    }
};
/* 下拉菜单 */
var slider = (function () {
    start("navlist");
    function start(aru) {//入口,初始化
        var as = t.getChildren(t.getElesByClass(aru)[0], "a");
        var state = {show: false, hidden: false, showObj: false};//定义变量
        var divs = t.getChildren(t.getEleById("secondLayer"), "DIV");
        for (var j = 0; j < divs.length - 1; j++) {
            divs[j].onmouseover = function () {
                this.style.display = "block";
            };
            divs[j].ommouseout = function () {
                this.style.display = "none";
            }
        }
        for (var i = 0; i < as.length - 1; i++) {
            var tmp = new rolinItem(as[i], state, i, divs);
            /*if (i == 0) tmp.pShow();*/
        }
    }

    function rolinItem(aru, state, i, divs) { //辅助工具1：创建实例对象；传入操作的参数
        var index = i;//保留与否
        var speed = 0.058;
        var range = 1;
        var interval;
        var tarH;
        var obj = divs[index];
        var tar = this;              //显示引用当前实例
        var isOpen = false;
        this.pHidden = function () {   //给实例注册一个通过判断执行的隐藏函数；
            if (isOpen) hidden();
        };
        this.pShow = show;
        var baseH = obj.offsetHeight;
        obj.style.display = "none";
        var isOpen = false;
        aru.onmouseenter = function () {
            if (!state.show && !state.hidden) { //这个state是从最外层引用的；
                if (!isOpen) {
                    show();
                } else {
                    hidden();
                }
            }
        };
        aru.onmouseleave = function () {
            if (isOpen) {
                hidden();
            }
        };
        function show() {
            state.show = true;
            if (state.openObj && state.openObj != tar) {
                state.openObj.pHidden();
            }
            obj.style.height = "0px";
            obj.style.display = "block";
            obj.style.overflow = "hidden";
            state.openObj = tar;
            tarH = baseH;
            interval = setInterval(move, 10);
        }

        function showS() {
            isOpen = true;
            state.show = false;
        }

        function hidden() { //隐藏函数入口
            state.hidden = true;
            tarH = 0;
            interval = setInterval(move, 10);
        }

        function hiddenS() {
            aru.style.borderBottom = "none";
            obj.style.display = "none";
            isOpen = false;
            state.hidden = false;
        }

        function move() {  //输入目标值执行隐藏或者显示的动画
            var dist = (tarH - obj.style.height.pxToNum()) * speed;
            if (Math.abs(dist) < 1) dist = dist > 0 ? 1 : -1;
            obj.style.height = (obj.style.height.pxToNum() + dist) + "px";
            if (Math.abs(obj.style.height.pxToNum() - tarH) <= range) {
                clearInterval(interval);
                obj.style.height = tarH + "px";
                if (tarH != 0) {
                    showS()
                } else {
                    hiddenS();
                }
            }
        }
    }

    String.prototype.pxToNum = function () {
        return Number(this.replace("px", ""))
    }
})();
/* 轮播效果 */
function Carousel() {
}
Carousel.prototype = {
    box: null,
    uls: null,
    imags: null,
    items: null,
    count: 0,
    preIndex: 0,
    curIndex: 0,
    timer: null,
    play: null,
    layouts: null,
    btns: null,
    //初始化
    int: function () {
        this.box = t.getEleById("lunbo");
        this.layouts = t.getElesByClass("v");
        this.btns = t.getElesByClass("btn");
        this.uls = this.box.getElementsByTagName("ul");
        this.imags = this.uls[0].getElementsByTagName("li");
        this.items = this.uls[1].getElementsByTagName("li");
        for (var i = 0; i < this.imags.length; i++) {
            var ele = this.imags[i];
            var lay = this.layouts[i];
            this.sAgcss(ele, "opacity", 0);
            this.sAgcss(lay, "opacity", 0);
            this.sAgcss(lay, "top", 0);
        }
        this.sAgcss(this.imags[0], 'opacity', 1);
        this.sAgcss(this.layouts[0], "opacity", 1);
        this.sAgcss(this.layouts[0], "top", 100);
        for (var j = 0; i < this.items.length; j++) {
            this.items[i].className = "";
        }
        this.items[0].className = "on";
        this.btnEv();
        this.action();
    },
    sAgcss: function (ele, attr, value) {
        if (typeof value == "undefined") {
            try {
                return parseFloat(getComputedStyle(ele, null)[attr])
            } catch (e) {
                if (attr = "opacity") {
                    var reg = /alpha\(opacity=(\d+(?:\.\d+)?)\)/;
                    if (reg.test(ele.currentStyle.filter)) {
                        return RegExp.$1;
                    } else {
                        return 1
                    }
                } else {
                    return parseFloat(ele.currentStyle[attr]);
                }
            }
        } else if (arguments.length == 3) {
            if (attr == "opacity") {
                ele.style[attr] = value;
                ele.style.filter = "alpha(opacity=" + value * 100 + ")";
            } else {
                ele.style[attr] = value + "px";
            }
        }
    },
    //激活入口
    action: function () {
        this.autoplay();
        this.mousething(this.box, this.items);
    },
    //自动播放程序
    autoplay: function () {
        var that = this;
        this.play = setInterval(function () {
            that.preIndex = that.curIndex;
            that.curIndex++;
            that.curIndex = that.curIndex > that.imags.length - 1 ? 0 : that.curIndex++;
            that.animate(that.imags[that.preIndex], {opacity: 0}, 1000, 1);
            that.animate(that.imags[that.curIndex], {opacity: 1}, 1000, 1, that.layout(that.preIndex, that.curIndex));
            that.items[that.preIndex].className = "";
            that.items[that.curIndex].className = "on";
        }, 4000)
    },
    layout: function (preindex, curindex) {
        this.animate(this.layouts[preindex], {opacity: 0, top: 0}, 10, 1);
        this.animate(this.layouts[curindex], {opacity: 1, top: 100}, 1500, 2);
    },
    mousething: function (box, items) {
        var that = this;
        box.onmouseenter = function () {
            clearInterval(that.play);
        };
        box.onmouseleave = function () {
            that.autoplay();
        };
        for (var m = 0; m < this.items.length; m++) {
            items[m].number = m;
            items[m].onclick = function () {
                if (that.timer)return;
                that.preIndex = that.curIndex;
                that.curIndex = this.number;
                that.animate(that.imags[that.preIndex], {opacity: 0}, 1000, 1);
                that.animate(that.imags[that.curIndex], {opacity: 1}, 1000, 1, that.layout(that.preIndex, that.curIndex));
                that.items[that.preIndex].className = "";
                that.items[that.curIndex].className = "on";
            }
        }
    },
    btnEv: function () {
        var that = this;
        this.btns[0].onclick = function () {
            if (that.timer)return;
            that.preIndex = that.curIndex;
            that.curIndex--;
            that.curIndex = that.curIndex < 0 ? that.imags.length - 1 : that.curIndex--;
            that.animate(that.imags[that.preIndex], {opacity: 0}, 1000, 1);
            that.animate(that.imags[that.curIndex], {opacity: 1}, 1000, 1, that.layout(that.preIndex, that.curIndex));
            that.items[that.preIndex].className = "";
            that.items[that.curIndex].className = "on";
        };
        this.btns[1].onclick = function () {
            if (that.timer)return;
            that.preIndex = that.curIndex;
            that.curIndex++;
            that.curIndex = that.curIndex > that.imags.length - 1 ? 0 : that.curIndex++;
            that.animate(that.imags[that.preIndex], {opacity: 0}, 1000, 1);
            that.animate(that.imags[that.curIndex], {opacity: 1}, 1000, 1, that.layout(that.preIndex, that.curIndex));
            that.items[that.preIndex].className = "";
            that.items[that.curIndex].className = "on";
        }
    },
    animate: function (ele, obj, duration, number, callback) {
        var myEff1 = function (t, b, c, d) {
            return c * t / d + b;
        };
        var myEff2 = function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        };
        if (number == 1) {
            var myEff = myEff1;
        } else {
            var myEff = myEff2;
        }
        var oBegin = {};
        var oChange = {};
        var flag = 0;
        for (var attr in obj) {
            var begin = this.sAgcss(ele, attr);
            var change = obj[attr] - begin;
            if (change) {
                oBegin[attr] = begin;
                oChange[attr] = change;
                flag++;
            }
        }
        if (flag === 0) return;
        var times = 0;
        var interval = 15;
        window.clearInterval(ele.timer);
        var that = this;

        function _step() {
            times += interval;
            if (times < duration) {
                for (var attr in oChange) {
                    var n = myEff(times, oBegin[attr], oChange[attr], duration);
                    that.sAgcss(ele, attr, n);
                }
            } else {
                for (var attr in oChange) {
                    that.sAgcss(ele, attr, obj[attr]);
                }
                window.clearInterval(ele.timer);
                that.timer = null;
                if (typeof callback == "function") {
                    callback.call(that);
                }
            }
        }

        ele.timer = window.setInterval(_step, interval);
    }
};
/*滚动新闻*/
/*var movenews={
 timerw:null,
 timerw1:null,
 timest:null,
 fn2:function(odiv,num,heightHalf) {
     if (movenews.timerw || movenews.timerw1)return;
     clearTimeout(movenews.timest);
     _fn2();
     function _fn2() {
         if (odiv.scrollTop < heightHalf) {
             odiv.scrollTop += 3;
             num -= 3;
         }
         else {
             odiv.scrollTop = 0;
         }
         if (num <= 0) {
             clearTimeout(movenews.timerw);
             movenews.timerw = null;
             num = 60;
             return;
         }
         movenews.timerw = setTimeout(_fn2, 30);
     }
 },
 fn3:function(odiv,num,heightHalf ){
     if (movenews.timerw || movenews.timerw1)return;
     clearTimeout(movenews.timest);
     _fn3();
     function _fn3() {

         if (odiv.scrollTop > 0) {
             odiv.scrollTop -= 3;
             num -= 3;
         }
         else {
             odiv.scrollTop =heightHalf;
         }
         if (num <= 0) {
             clearTimeout(movenews.timerw1);
             movenews.timerw1 = null;
             num = 60;
             return;
         }
         movenews.timerw1 = setTimeout(_fn3, 30);
     }
 },
 mouse:function(outer){
 outer.onmouseenter=function(){
 if(movenews.timest){
 clearTimeout(movenews.timest);
     movenews.timest=null;
 }
 }
 outer.onmousemove=function(){
 if(movenews.timest){
 clearTimeout(movenews.timest);
     movenews.timest=null;
 }
 }
 outer.onmouseleave=function( ){
     movenews.timest=setTimeout(movenews._start,1000);
 }
 },
    _start:function(){
        var newbtn = t.getElesByClass("newcl");
        newbtn[1].onclick();
        movenews.timest = window.setTimeout(movenews._start, 2000);
    },
    start:function(){
        var newbtn = t.getElesByClass("newcl");
        var outer = t.getElesByClass("snew_inbox")[0];
        this._start();
    },
 init:function(){
 var that=this;
 var outer= t.getElesByClass("snew_inbox")[0];
 var odiv=t.getElesByClass("snew_center")[0];
 var heightAll=0;
 var  num=60;
 var oul= t.getElesByClass("snew_list")[0];
 var lis=oul.getElementsByTagName("li");
 var newbtn=t.getElesByClass("newcl");
 oul.innerHTML+=oul.innerHTML;
 for(var i=0;i<lis.length;i++) {
 heightAll += lis[i].offsetHeight;
 }
 var heightHalf=parseInt(heightAll/2);
 newbtn[0].onclick=function(){that.fn3(odiv,num,heightHalf)};
 newbtn[1].onclick=function(){that.fn2(odiv,num,heightHalf)};
     that.mouse(outer);
     that.start();
          }
 }*/

 var movenews={
 timerw:null,
 timerw1:null,
 timest:null,
 fn2:function(odiv,num,heightHalf) {
 if (movenews.timerw || movenews.timerw1)return;
 clearTimeout(movenews.timest);
 _fn2();
 function _fn2() {
 if (odiv.scrollTop < heightHalf) {
 odiv.scrollTop += 3;
 num -= 3;
 }
 else {
 odiv.scrollTop = 0;
 }
 if (num <= 0) {
 clearTimeout(movenews.timerw);
 movenews.timerw = null;
 num = 60;
 return;
 }
 movenews.timerw = setTimeout(_fn2, 30);
 }
 },
 fn3:function(odiv,num,heightHalf ){
 if (movenews.timerw || movenews.timerw1)return;
 clearTimeout(movenews.timest);
 _fn3();
 function _fn3() {

 if (odiv.scrollTop > 0) {
 odiv.scrollTop -= 3;
 num -= 3;
 }
 else {
 odiv.scrollTop =heightHalf;
 }
 if (num <= 0) {
 clearTimeout(movenews.timerw1);
 movenews.timerw1 = null;
 num = 60;
 return;
 }
 movenews.timerw1 = setTimeout(_fn3, 30);
 }
 },
 mouse:function(outer){
 outer.onmouseenter=function(){
 if(movenews.timest){
 clearTimeout(movenews.timest);
 movenews.timest=null;
 }
 }
 outer.onmousemove=function(){
 if(movenews.timest){
 clearTimeout(movenews.timest);
 movenews.timest=null;
 }
 }
 outer.onmouseleave=function( ){
 movenews.timest=setTimeout(movenews._start,1000);
 }
 },
 _start:function(){
 var newbtn = t.getElesByClass("newcl");
 newbtn[1].onclick();
 movenews.timest = window.setTimeout(movenews._start, 2000);
 },
 start:function(){
 var newbtn = t.getElesByClass("newcl");
 var outer = t.getElesByClass("snew_inbox")[0];
 this._start();
 },
 init:function(){
 var that=this;
 var outer= t.getElesByClass("snew_inbox")[0];
 var odiv=t.getElesByClass("snew_center")[0];
 var heightAll=0;
 var num=60;
 var oul= t.getElesByClass("snew_list")[0];
 var frg=document.createDocumentFragment();
     if(jsonData){
         for(var i=0;i<jsonData.length;i++){
             var cur=jsonData[i];
             var oli=document.createElement("li");
                 oli.className="listg";
                 oli.innerHTML=getHTML(cur);
                 frg.appendChild(oli);
          }
         oul.appendChild(frg);
     }
 function getHTML(cur){
       var str="";
       str+="<a href='"+cur.id+"'>";
       str+=cur.content;
       str+="</a>";
       return str;
 }

 var lis=oul.getElementsByTagName("li");
 var newbtn=t.getElesByClass("newcl");
 oul.innerHTML+=oul.innerHTML;
 for(var i=0;i<lis.length;i++) {
 heightAll += lis[i].offsetHeight;
 }
 var heightHalf=parseInt(heightAll/2);
 newbtn[0].onclick=function(){that.fn3(odiv,num,heightHalf)};
 newbtn[1].onclick=function(){that.fn2(odiv,num,heightHalf)};
 that.mouse(outer);
 that.start();
 }
 }

