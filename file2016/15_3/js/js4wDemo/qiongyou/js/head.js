/**
 * Created by wlg on 2015/10/23.
 */
var sheQu=document.getElementsByClassName("header_nav_li").item(3);
var sheQu1=sheQu.getElementsByClassName("nav_shQ_1")[0];
var sheQu11=sheQu.getElementsByClassName("nav_shQ_1_li")[0];
var sheQu2=sheQu.getElementsByClassName("nav_shQ_2")[0];
var yuD=document.getElementsByClassName("header_nav_li").item(6);
var yuD1=yuD.getElementsByClassName("nav_yuD")[0];
//操作社区一级二级菜单
sheQu.onmouseover=function(){
    sheQu1.style.display="block";
    sheQu11.onmouseover=function(){
        sheQu2.style.display="block";
        window.clearTimeout(timer);
    };
    sheQu11.onmouseout=function(){
        if(sheQu2.style.display=="none"){
            sheQu1.style.display="none";
        }
        timer=window.setTimeout(function () {
            sheQu2.style.display="none";
        },3000);
        //sheQu2.style.display="none";
    };
};
sheQu.onmouseout=function(){
    sheQu1.style.display="none";
    sheQu2.style.display="none";
};
sheQu2.onmouseover= function () {
    sheQu1.style.display="block";
    sheQu2.style.display="block";
    clearTimeout(timer);
};
sheQu2.onmouseout= function () {
    sheQu2.style.display="none";
};


//操作预定菜单
yuD.onmouseover= function () {
    yuD1.style.display="block";
};
yuD.onmouseout= function () {
    yuD1.style.display="none";
};


//搜索框实现DOM2级
var headDefault=document.getElementsByClassName("syHead1_default")[0];
var oInput=document.getElementsByClassName("syHead1_f1")[0];
var oLis=headDefault.getElementsByTagName('span');
document.body.onclick = function (e) {
    e = e || window.event;
    var curEle = e.target || e.srcElement;
    if (curEle=== oInput) {
        headDefault.style.display='block';
    } else if (curEle.tagName.toLowerCase() === "span") {
        oInput.value = curEle.innerHTML;
        headDefault.style.display = "none";
    } else {
        headDefault.style.display = "none";
    }
};
var oInner = document.getElementsByClassName('syScreen_ul')[0];
var num = 0;
var clientW=(document.documentElement.clientWidth||document.body.clientWidth)+(document.documentElement.scrollLeft||document.body.scrollLeft);
var screenLi=document.getElementsByClassName("syScreen_li");
for(var i=0;i<screenLi.length;i++){
    screenLi[i].style.width=clientW;
}
var dotLis=document.getElementsByClassName("lun_dot");
var timer = window.setInterval(function(){
    num++;
    if(num>=3){
        num=0;
//            window.clearInterval(timer);
    }
    oInner.style.webkitTransform = "translate(-"+num*clientW+"px,0)";
},3000);

//实现选项卡
var xxkLi=document.getElementsByClassName('xxk_li');
var xxkDi=document.getElementsByClassName('xxk_d1');
/*xxkUl.onmouseover= function () {
    xxkDiv.style.display='block';
};*/
for(var i=0;i<xxkLi.length;i++){
    xxkLi[i].x=i;
    xxkDi[i].x=i;
    xxkLi[i].onmouseover = function (index) {
        clearTimeout(timer);
        var index=this.x;
        var xxkH2=xxkLi[index].querySelector(".xxk_li_h2");
        xxkH2.style.color = "black";
        xxkLi[index].style.backgroundColor = "white";
        xxkDi[index].style.display = "block";

    };
    xxkLi[i].onmouseout = function (index) {
        var index=this.x;
        var xxkH2=xxkLi[index].querySelector(".xxk_li_h2");

        timer=window.setTimeout(function () {
            xxkH2.style.color = "white";
            xxkLi[index].style.backgroundColor = "";
            xxkDi[index].style.display = "none";
        },100);
        xxkH2.style.color = "white";
        xxkLi[index].style.backgroundColor = "";
        xxkDi[index].style.display = "none";
    };
    xxkDi[i].onmouseover= function (index) {
        var index=this.x;
        var xxkH2=xxkLi[index].querySelector(".xxk_li_h2");
        xxkH2.style.color = "black";
        xxkLi[index].style.backgroundColor = "white";
        xxkDi[index].style.display = "block";
        clearTimeout(timer);
    };
    xxkDi[i].onmouseout=function(index){
        var index=this.x;
        var xxkH2=xxkLi[index].querySelector(".xxk_li_h2");
        xxkH2.style.color = "white";
        xxkLi[index].style.backgroundColor = "";
        xxkDi[index].style.display = "none";
    }
}