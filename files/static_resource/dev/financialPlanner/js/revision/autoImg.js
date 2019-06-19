/**
 * Created by yugu10 on 2017/7/26.
 */
$(document).ready(function(){
    var w = $(".li-img").width(), h = $(".li-img").height(), img = $(".li-img").find("img");
    if(h/w > 341/750){
        img.height(h)
    }else{
        img.width(w)
    }
});