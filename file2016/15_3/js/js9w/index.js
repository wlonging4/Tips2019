/**
 * Created by Administrator on 2015/12/24.
 */
//JSONP跨域
//形成私有作用域,
var $urlHost="http://matchweb.sports.qq.com";
$(function () {
    var bind= function (ary) {
        /*var frg=document.createDocumentFragment();*/
        var str="";
        for(var i=0;i<ary.length;i++){
            str+="<li class='cursor left"
        }
    };
    var callback= function (data) {
        //接口中只有接口code===0才是正常返回需要的数据
        if(data.code!==0)return;
        data=data["data"];
        var today=data["today"];
        var ary=data["data"];
        bind(ary);
    };
    $ajax({
        url:"/kbs/calendar?callback=calendar&columnId=8&_="+Math.random(),
        type:"get",
        dataType:"jsonp",
        jsonpCallback:"calendar",
        success:callback
    })
});