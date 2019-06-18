/**
 * Created by Administrator on 2015/11/15.
 */
var DOM={};
//①getEleChildren()
//获取元素下的所有指定元素节点,当第二参数不传的时候则返回obj下的所有元素子节点
//获取所有的节点,判断是否有元素节点,标签名是否为指定标签名
DOM.getEleChildren=function getEleChildren(obj,node){
    var a=[];
    var oChild=obj.childNodes;
    if(node&&node.tagName==1){
        for(var i=0;i<oChild.length;i++){
            if(oChild[i].nodeType==1&&oChild[i].tagName==node.toUpperCase()){
                a.push(oChild[i]);
            }
        }
        return a;
    }else{
        //如果第二个参数没传递,则将obj下的所有元素节点获取并且返回
        for(var i=0;i<oChild.length;i++){
            if(oChild.nodeType==1){
                a.push(oChild[i]);
            }
        }
        return a;
    }
};
//②getNextEle()
//获取指定元素下的另一个兄弟节点
//利用递归思想，循环调用方法本身，直到查找到下一个兄弟节点
DOM.getNextEle=function getNextEle(node){
    var node=node.nextSibling;
    if(node.nodeType==1){
        return node;
    }
    if(node.nextSibling){
        return arguments.callee(node);
        //递归一下,就是再调用自己的运算,不要忘记return
    }
    return null;
    //如果一个方法应该有返回值,但是又无法计算出结果,则应该返回null
};
//③getNextOne()
//获取指定元素的下一个兄弟元素节点
//功能同上一个方法思路不相同;利用循环的方法,直到查找到下一个兄弟元素节点
DOM.getNextOne=function getNextOne(ele){
    var next=ele.nextSibling;
    while(next){
        if(next.nodeType==1){
            return next;
        }
        next=next.nextSibling;
    }
    return null;
};
//④getNextAll()
//获取指定标签名ele下的所有标签名为tagName的弟弟子节点;
DOM.getNextAll=function getNextAll(ele,tagName){
    var a=[];
    var next=getNextOne(ele);
    if(tagName&&typeof tagName=="string"){
        while(next){
            if(next.tagName.toLowerCase()==tagName.toLowerCase()){
                a.push(next);
            }
            next=getNextOne(next);
        }
    }else{
        while(next){
            a.push(next);
            next=getNextOne(ele);
        }
    }
    return a;
};
//⑤getPreEle()
//获取指定元素的上一个兄弟元素节点
//利用递归思想，循环调用方法本身，直到查找到上一个兄弟元素节点
DOM.getPreEle=function getPreEle(preNode){
    preNode=preNode.previousSibling;
    if(preNode){
        if(preNode.nodeType===1){
            return preNode;
        }else{
            return arguments.callee(preNode);
        }
    }else{
        return null;
    }
};
//⑥getPreAll()
//获取指定标签名ele下面的所有标签名为tagName的哥哥元素节点
DOM.getPreAll=function getPreAll(){
    var a=[];
    var pre=getPreEle(ele);
    if(tagName&&tagName.nodeType=="string"){
        while(pre){
            if(pre.tagName.toLowerCase()==tagName.toLowerCase()){
                a.push(pre);
            }
            pre=getPreEle();
        }
    }else{
        while(pre){
            a.push(pre);
            pre.getPreEle(pre);
        }
    }
    return a;
};
//⑦sibling();
//获取指定元素的所有兄弟节点
//思路:先获取哥哥元素节点,存进数组然后反转,保证顺序正常,再获取所有的弟弟元素节点,拼接
DOM.siblings=function siblings(ele){
    var a=[];
    var previous=ele.previousSibling;
    while(previous){
        if(previous.nodeType===1){
            a.unshift(previous);
        }
        previous=previous.previousSibling;
    }
    a.reverse();

    var next=ele.nextSibling;
    while(next){
        if(next.nodeType===1){
            a.push(next);
        }
        next=next.nextSibling;
    }
    return a;
};
//⑧siblings()
//获取指定呀U尿素的所有兄弟节点
//效果同上,思路不同:先获取指点元素节点的父节点,再往下获取该元素除本元素外的所有子节点
DOM.siblings=function siblings(objName){
    var a=[];
    var sib=objName.parentNode.children;
    for(var i=0;i<sib.length;i++){
        if(sib[i]!=objName&&sib[i].nodeType==1){
            a.push(sib[i]);
        }
    }
    return a;
}
//⑨getEleChildren
//获取元素ele下指定标记名为tagName的所有子元素,第一个参数可选,表示的是指定标签名的子元素
DOM.getEleChildren=function getEleChildren(ele,tagName) {
    if (ele && ele.nodeType && ele.nodeType === 1) {
        if (tagName && typeof tagName === "string") {
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
            //如果第二个参数没传
            var a = [];
            var ch = ele.childNodes;
            for (var i=0;i < ch.length;i++)
            {
                if (ch[i].nodeType === 1) {
                    a.push(ch[i]);
                }
            }
            return a;
        }
    } else {
        alert("Arguments Error!");
        //判断第一个参数
    }
}
//⑩getLastEle()
//在所有的元素节点集合eles中找出最后元素节点,在引用此方法时注意获取的数组第一个值
//调用判断最后元素的方法,循环判断后将最后一个元素放进组中返回
DOM.getLastEles=function getLastEle(){
    if(eles&eles.length&&eles.length>0){
        var a=[];
        for(var i=0;i<eles.length;i++){
            if(eles[i]&&eles[i].nodeType&&eles[i].nodeType===1){
                var ele=getNextOne(eles[i]);
                if(ele=null){
                    a.push(eles[i]);
                }
            }else{
                alert("参数中的第"+i+"个元素不符合条件！");
                throw new Error("参数中的第"+i+"个对象，不符合条件！");
            }
        }
        return a;
    }
}
//⑪getFirstEle()
//在所有的元素节点集eles中找出第一个元素节点,在此基础上注意获取的第数组的第一个值；
//判断元素的哥哥节点是否存在，如果不存在，即是第一个元素节点
DOM.getFirstEle=function getFirstEle(eles){
    if(eles&&eles.length&&eles.length>0){
        var a=[];
        for(var i=0;i<eles.length;i++){
            if(eles[i]&&eles[i].nodeType&&eles[i].nodeType===1){
                var ele=getPreEle()(eles[i]);
                if(ele==null){
                    a.push(eles[i]);
                }
            }else{
                alert("参数中的第"+i+"个对象，不符合条件！");
                throw new Error("参数中的第"+i+"个对象，不符合条件！");
            }
        }
        return a;
    }
}
//⑫insertAfter()
//此方法和appendChild方法对应，把要插入的对象追加到目标对象的后面，oldEle会被移除
DOM.insertAfter=function insertAfter(oldEle,newEle){
    if(oldEle&&oldEle.nodeType&&oldEle.nodeType===1&&newEle&&newEle.nodeType&&newEle.nodeType===1){
        if(oldEle.nextSibling){
            oldEle.parentNode.insertBefore(newEle,oldEle.nextSibling);
        }else{
            oldEle.parentNode.appendChild(newEle);
        }
    }else{
        throw new Error("参数错误");
    }
}
//⑬prepend
//此方法和insertBefore功能对应,把newNode这个节点插入到parentEle元素前面;
DOM.prepend=function prepend(newNode,oldEle){
    var child=oldEle.firstChild;
    if(child){
        oldEle.insertBefore(newNode,oldEle.firstChild);
    }else{
        oldEle.appendChild(newNode);
    }
}
//⑭text()
//获取或者设置网页元素节点文本值的方法，只传ele参数是获取ele元素中的文本值;传str是设置ele中的文本值;
//主要处理火狐不支持innerText这个属性的问题
DOM.text=function text(ele,str){
    if(ele&&ele.nodeType&&ele.nodeType===1){
        //如果第一个参数是元素类型的
        if(str===undefined){
            //如果第二个参数没有传递进来
            if(typeof ele.textContent=="string"){
                //判断浏览器是否支持textcontend属性,如果支持则该属性的类型是string否则为undefined
                return ele.textContent;
            }else{
                return ele.innerText;
                //火狐不支持
            }
        }
        else if(typeof str==="string"){
            if(typeof ele.textContent==="string"){
                ele.textContent=str;
            }else{
                ele.innerText=str;
            }
        }else{
            alert("第二个参数str有错误！");
            throw new Error("第二个参数str有错误！");
        }
    }else{
        alert("第一个参数ele有错误！");
        throw new Error("第二个参数str有错误");
    }
}
//⑮getElesByClass()
//解决IE6/7下不支持document.getElementsByClassName，通过该方法可以获取指定元素ele下具有多个类名的目标元素;
//此方法运用正则匹配类名,再获取对应元素。这是用两个方法来实现的,是为了降低难度
DOM.gerElesByClass=function getElesByClass(strClass,ele){
    var reg1=/^\s+|\s+$/g;
    //找出首位空格去除掉多余的空格,以免下面的循环有空操作;
    strClass=strClass.replace(reg1,"");
    ele=ele||document;
    if(ele.getElementsByClassName){
        return ele.getElementsByClassName(strClass);
    }else{
        var aClass=strClass.split(/\s+/);
        //以空格把字符串拆分成数组
        var eles=eles.getElementsByTagName("*");
        var a=[];
        for(var i=0;i<aClass.length;i++){
            eles=getEle(aClass[i],eles);
            //调用getEle方法循环筛选满足条件的元素,其实就是找到类名的交集，这个方法在下面定义的
        }
        return eles;
    }
}
//⑯getEle
//这个方法只是供上面的getEleByClass使用,是独立出来的核心模块
//在一组DOM对象集合（参数 eles）里通过单一类名（参数strClass）获取元素
//注意获取后的目标元素是放在一个数组里,使用时应该注意
DOM.getEle=function getEle(strClass,eles){
    var a=[];
    for(var i= 0,len=eles.length;i<len;i++){
        var reg=new RegExp("(?:^|$)"+strClass+"(?:^|$)");
        if(reg.test(eles[i].className)){
            //满足这个正则验证的说明此元素中类名中肯定有strClass这个变量指定的类名，则放在数组中
            a.push(eles[i]);
        }
    }
    return a;
}
//⑰addClass()
//增加类样式的方法
//每次新增加的类名都是一个字符串,用空格将其和前名的类名隔开就好
DOM.addClass=function addClass(ele,className){
    if(ele&&ele.nodeType&&ele.nodeType===1&&className&&typeof className=="string"){
        var reg=new RegExp("(?:^|$)"+strClass+"(?:^|$)");
        if(!reg.test(ele.eleName)){
            ele.className+=" "+className;
        }
    }
}
//⑱removeClass()
//移除类的方法
//定义一个正则表达式,将正则匹配到的单词,用空字符串替换掉
DOM.removeClass=function removeClass(ele,className){
    if(ele&&ele.nodeType&&ele.nodeType===1&&className&&typeof className=="string"){
        var reg=new RegExp("(?:^|$)"+strClass+"(?:^|$)","g");
        ele.className=ele.className.replace(reg,"");
        //???
    }
};
//⑲hasClass()
//判断某个元素上是不是有某个类
//用某正则表达式匹配类型，判断元素的类名和传入的字符串是否一致即可判断
DOM.hasClass=function hasClass(ele,strClass){
    if(ele&&ele.nodeType===1&&(typeof strClass=="string")){
        var reg=new RegExp("(?:^|$)"+strClass+"(?:^|$)");
        if(reg.test(ele,className)){
            return true;
        }else{
            return false;
        }
    }
}
//⑳getIndex()第一种思路
//获取元素的索引值的方法
//先得到这个元素父元素的所有元素节点,逐一比较并让计数器加1,如果有和自己相同的元素,则返回当前的计数
DOM.getIndex=function getIndex(ele){
    if(ele&&ele.nodeType&&ele.nodeType===1){
        var parent=ele.parentNode;
        //获取此元素的父亲节点
        var eles=getEleChildren(parent);
        //获得包含自己在内的所有兄弟节点
        for(var i=0;i<eles.length;i++){
            //逐个对比如果发现自己和某个节点是一样的,那么当前的i就是自己的索引值
            if(ele==ele[i]){
                return i;
            }
        }
    }else{
        alert("arguments error!");
    }
}
//21.getIndexNum()
//获取元素的索引值的方法
//通过获取哥哥元素节点的方法来获取当前元素索引值
DOM.getIndexNum=function getIndexNum(ele){
    var n=0;
    var pre=ele.previousSibling;
    while(pre){
        if(pre.nodeType==1){
            //如果哥哥是个元素
            n++;//
        }
        pre=pre.previousSibling;
    }
    return n;
}
//22.listToArray
//将nodeList类型转化为数组
DOM.listToArray=function listToArray(eles){
    try{
        return Array.prototype.slice.call(eles,0);
    }catch(e){
        //在IE6/7下不能使用上述操作会报异常
        var a=[];
        for(var i=0;i<eles.length;i++){
            a.push(eles[i]);
        }
        return a;
    }
}
//23.getPos()
//获取元素相对于屏幕的距离
DOM.getPos=function getPos(ele){
    var x=ele.offsetLeft;
    var y=ele.offsetTop;
    var p=ele.offsetParent;
    while(p&&p!=document.body){
        if(window.navigator.userAgent.indexOf("MSIE 8")>-1){
            x+= p.offsetLeft;
            y+= p.offsetTop;
        }else{
            x+= p.offsetLeft+ p.clientLeft;//加个左边框的宽,偏移量不包括边框的宽,所以要加
            y+= p.offsetTop+ p.clientTop;
        }
        p= p.parentNode;
    }
    var obj={};
    obj.x=x;
    obj.y=y;
    return obj;
    //或者写return {x:x,y:y};
}
//24.getCss()
//获取网页元素的css属性值的兼容性写法,可以获取行内样式，内嵌样式还有外链样式
//currentStyle属于IE，而getComputedStyle是属于标准浏览器的,用过判断就能解决兼容性
DOM.getCss=function getCss(ele,attr){
    if(ele&&ele.nodeType&&ele.nodeType===1&&attr&&typeof attr=="string"){
        return window.getComputedStyle?getComputedStyle(ele,null)[attr]:ele.currentStyle[attr];
    }else{
        throw new Error("参数错误！");
    }
};
//25.setCss()
//给元素设置css属性的方法
//处理各种属性的兼容性问题,值域问题及容错性问题
//26.setGroupCss()