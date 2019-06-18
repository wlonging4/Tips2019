/**
 * Created by Administrator on 2015/10/18.
 */
function getStyle(obj,attr) {
    if (obj.currentStyle) {
        return obj.currentStyle[attr];
    } else {
        return getComputedStyle(obj, false)[attr];
    }
}//curren运动函数

function Move(obj,attr,iTarget){
    clearInterval(obj.timer);
    obj.timer=setInterval(function(){
        var iCur=0;//替代所有的obj.offsetLeft;
        if(attr="opacity"){
            iCur=parseInt(parseFloat(getStyle(obj,attr))*100);//把小数位去掉？？
        }else{
            iCur=parseInt(getStyle(obj,attr));
        }
        iSpeed=(iTarget-iCur)/8;
        iSpeed=iSpeed>0?Math.ceil(iSpeed):Math.floor(iSpeed);
        if(iCur==iTarget){
            clearInterval(obj.timer);
        }else{
            if(attr=="opacity"){
                obj.style.filter="alpha(opacity:"+(iCur+iSpeed)+")";
                obj.style.opacity=(iCur+iSpeed)/100;
            }else {
                obj.style[attr] = iCur + iSpeed + "px";
            }
        }
    },50);
}