/**
 * Created by Administrator on 2015/11/23.
 */
//热门销售
var saleChg=document.getElementsByClassName("sale_h_p2")[0];
var saleU1=document.getElementsByClassName("sale_ul1")[0];
var saleU2=document.getElementsByClassName("sale_ul2")[0];

saleChg.onclick= function () {
    if(saleU1.style.display=="block"){
        saleU1.style.display="none";
        saleU2.style.display="block";
    }else{
        saleU1.style.display="block";
        saleU2.style.display="none";
    }
};

//机酒自由行选项卡
var jjUl=document.getElementsByClassName("jj_h_ul")[0];
var jjLis=jjUl.getElementsByTagName("li");
var jjC=document.getElementsByClassName("jj_c")[0];
var jjUl2=jjC.getElementsByTagName("ul");

for(var i=0;i<jjLis.length;i++){
    jjLis[i].x=i;
    jjLis[i].onmouseover = function () {
        for(var j=0;j<jjLis.length;j++) {
            jjLis[j].className = "";
            jjUl2[j].className = "jj_c_ul";
        }
        var index=this.x;
        jjLis[index].className = "jj_li_active";
        jjUl2[index].className = "jj_c_ul_active";
    }
}
