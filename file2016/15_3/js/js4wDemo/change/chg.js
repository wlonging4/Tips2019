/**
 * Created by Administrator on 2015/12/29.
 */
var l=document.querySelector(".l");
var r=document.querySelector(".r");
var rp=r.querySelectorAll("p");
var rd=r.querySelectorAll("div");
for(var i=0;i<rp.length;i++){
    rp[i].index=i;
    rp[i].onmouseover= function () {
        var a=this.index;
        rd[a].style.display="block";
    };
    rp[i].onmouseout= function () {
        var a=this.index;
        rd[a].style.display="none";
    }

}