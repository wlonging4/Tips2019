/**
 * Created by zongzema on 2016/12/9.
 */
$(document).ready(function(){
    $.ajax({
        url: siteVar.serverUrl+'cubesso/checkLogin.shtml',
        method: 'get'
    }).then(function(data){
        if(typeof data == "object"){
            if(data.isLogin !== 1){
                location.href = siteVar.serverUrl+"cubesso/index.shtml";
                return ;
            }
        }else if(typeof data == "string"){
            try{
                data = JSON.parse(data);
                if(data.isLogin !== 1){
                    location.href = siteVar.serverUrl+"cubesso/index.shtml";
                    return ;
                }
            }catch(e){
                console.log(e);
            }
        }
    });
});