/**
 * Created by yugu10 on 2017/7/21. 浮层跳转
 */

    function showtime(t){
        var mask = document.querySelector(".overlay"), body = document.querySelector("body"), h;
        h = window.innerHeight > body.offsetHeight ? window.innerHeight : body.offsetHeight;
        if(!mask){
            mask = document.createElement("div");
            mask.style.cssText = "width:100%;height:" + h + "px;background:white;position:absolute;top:0;left:0;";
            mask.className = "ovrly";
            body.appendChild(mask)
        };

        var interimTime = document.getElementById("interimTime"), timer = null, redirectInput = document.getElementById("sesame-materialinfo-input");
        timer = setInterval(function(){
            t--;
            if(t == 0){
                clearInterval(timer);
                location.href = redirectInput.value;
            }else{
                interimTime.innerHTML = t;
            };
        }, 1000);

    };


window.onload = function(){
    showtime(2);
}

