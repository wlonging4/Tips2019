;(function(){
    var submitFlag = true,
        form = $("#sesame-secret-form"),
        url = form.attr("action"),
        protocolType = form.find("input[name='protocolType']"),
        token = form.find("input[name='token']"),
        sesameSource = form.find("input[name='sesameSource']"),
        goToSesameMaterialUrl = form.find("input[name='goToSesameMaterialUrl']");
    $("#sesame-secret-agree-btn").on("click",function(){
        var self = $(this);
        if(submitFlag){
            $.ajax({
                url:url,
                type:"POST",
                data:{
                    protocolType: protocolType.val(),
                    token: token.val()
                },
                success:function(data){
                    if(data.code == 1){
                        var k = sesameSource.val();
                        toast("您已同意保密及不扩散承诺", function(){
                            if(k == 0 && k.length > 0){
                                $(".interimMain").show()
                                    .find(".puzeImgBox").show().end()
                                    .find(".hainanImgBox").hide();
                                showtime(2);
                            }else if(k == 1){
                                $(".interimMain").show()
                                    .find(".puzeImgBox").hide().end()
                                    .find(".hainanImgBox").show();
                                showtime(2);
                            }else{
                                location.href = goToSesameMaterialUrl.val()
                            };
                        })
                    }else{
                        var mymodal = new Modal({
                            wrapperClass:'dialog1',
                            contentText : data.msg,
                            isTipConfirm: true
                        });
                        mymodal.open();
                    };

                }
            })
        }

    });
    function showtime(t){
        var mask = document.querySelector(".overlay"), body = document.querySelector("body"), w, h;
        h = window.innerHeight > body.offsetHeight ? window.innerHeight : body.offsetHeight;
        if(!mask){
            mask = document.createElement("div");
            mask.style.cssText = "width:100%;height:" + h + "px;background:white;position:absolute;top:0;left:0;";
            mask.className = "ovrly";
            body.appendChild(mask)
        };

        var interimTime = $("#interimTime"), timer = null;
        timer = setInterval(function(){
            t--;
            if(t == 0){
                clearInterval(timer);
                location.href = goToSesameMaterialUrl.val();
            }else{
                interimTime.html(t)
            };
        }, 1000);

    };
    function creatToast(){
        var tips = document.querySelector(".tipsBox"), body = document.querySelector("body");
        if(!tips){
            tips = document.createElement("div");
            tips.style.cssText = "display:block;";
            tips.className = "tipsBox";
            body.appendChild(tips)
        };
        return tips;
    };
    function showToast(){
        var toast = creatToast();
        toast.style.display = "block";
    }
    function hideToast(){
        var toast = creatToast();
        toast.style.display = "none";
    }
    function toast(content, callback){
        var toast = creatToast();
        toast.innerHTML  = content;
        showToast();
        var timer = setTimeout(function(){
            hideToast();
            if(callback && typeof callback == "function"){
                callback()
            };
            clearTimeout(timer);
        }, 2000)
    }
})();