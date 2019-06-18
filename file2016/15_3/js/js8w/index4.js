/**
 * Created by Administrator on 2015/12/20.
 */
function getEle(ele){
    return document.querySelector(ele)
}
var main = getEle('#main');
var bell = getEle('#bell');
var say = getEle('#say');
var music = getEle('#music');
var loading = getEle('#loading');
var progress = getEle('.progress');
var pSpan = getEle('.pSpan');
var phone = getEle('.phone');
var phoneName = getEle('.phoneName');
var phoneText = getEle('.phoneText');
var answerOne = getEle('.answerOne');
var oneTouch = getEle('oneTouch');
var answerOther = getEle('.answerOther');
var otherTouch = getEle('.otherTOuch');
var touchClick = getEle('.touchClick');
var message = getEle('.message');
var msgList = getEle('.msgList');
var msgLis = document.querySelectorAll('.message li');
var cube = getEle('.cube');
var cubeBox = getEle('.cubeBox');
var cubeLis = cubeBox.querySelectorAll('li');
var winW = window.innerWidth;
var winH = window.innerHeight;
var desW = 640;
var desH = 1008;
if(desW/desH<winW/winH){
    main.style.webkitTransform = 'scale('+winW/desW+')';
}else{
    main.style.webkitTransform = 'scale('+winH/desH+')';
}
~(function(){
    var arr= ['phoneBg.jpg', 'cubeBg.jpg', 'cubeImg1.png', 'cubeImg2.png', 'cubeImg3.png', 'cubeImg4.png', 'cubeImg5.png', 'cubeImg6.png','phoneBtn.png', 'phoneKey.png', 'messageHead1.png', 'messageHead2.png', 'messageText.png', 'phoneHeadName.png'];
    var num = 0;
    fnLoad();
    function fnLoad(){
        for(var i = 0;i<arr.length;i++){
            var oImg = new Image();
            oImg.src = "img4/"+arr[num];
            oImg.onload = function(){
                //一张图片加载完
                num++;
                pSpan.style.width = num/(arr.length)*100+"%";
            };
            pSpan.addEventListener('webkitTransitionEnd',function(){
                loading.remove();
                fnPhone.init();
            },false)
        }
    }
})();
/*var arr= ['phoneBg.jpg', 'cubeBg.jpg', 'cubeImg1.png', 'cubeImg2.png', 'cubeImg3.png', 'cubeImg4.png', 'cubeImg5.png', 'cubeImg6.png','phoneBtn.png', 'phoneKey.png', 'messageHead1.png', 'messageHead2.png', 'messageText.png', 'phoneHeadName.png'];
var num = 0;
fnLoad();
function fnLoad(){
    arr.forEach(function () {
        var oImg=new Image();
        oImg.src="img4/"+arguments[0];
        oImg.onload= function () {
            num++;
            pSpan.style.width=num/arr.length*100+"%";
        }
    });
    pSpan.addEventListener("webkitTransitionEnd", function () {
        this.parentNode.parentNode.remove();
    },false);
    fnPhone.init();
}*/
var fnPhone = {
    init : function(){
        bell.play();
        phone.addEventListener('touchstart',this.touch,false);
    },
    touch: function(e){
        if(e.target.className =="touchClick"){
            bell.pause();
            e.target.parentNode.style.display='none';
            answerOther.style.webkitTransform='translate(0,0)';
        }else{
            if(e.target.className = "otherTouch"){
                fnPhone.closePhone();
            }
        }
        phone.removeEventListener('touchstart',this.touch,false);
    },
    closePhone:function(){
        phone.style.webkitTransform='translate(0,'+desH+'px)';
        window.setTimeout(function(){
            phone.remove();
            fnMessage();
        },1000)
    }
};
function fnMessage(){
    var n = 0;
    var h = 0;
    var timer = window.setInterval(function(){
        h+=msgLis[n].offsetHeight-20;
        msgLis[n].style.opacity = 1;
        msgLis[n].style.webkitTransform ='translate(0,0)';
        if(n>=3){
            msgList.style.transform='translate(0,'+(-h)+'px)' ;
        }
        if(n==msgLis.length-1){
            window.clearInterval(timer);
            message.remove();
            fnCube();
        }else{
            n++;
        }
    },1000)
}
function fnCube(){
    var TouchStart = {x:0,y:0};
    var startX = -45;
    var startY = -45;
    var x = 0;
    var y = 0;
    var flag = true;
    cubeBox.style.opacity = 1;
    cubeBox.style.webkitTransform ='scale(0.7) rotateX(-45deg) rotateY(-45deg)';
    cubeBox.addEventListener('webkitTransitionEnd',function(){
        this.style.webkitTransition="";
    },false);
    document.addEventListener('touchestart',cStart,false);
    document.addEventListener('touchmove',cMove,false);
    document.addEventListener('touchend',cEnd,false);
    function cStart(e){
        TouchStart.x = e.changedTouches[0].pageX;
        TouchStart.y = e.changedTouches[0].pageY;
    }
    function cMove(e){
        flag = false;
        var touchMoveX = e.changedTouches[0].pageX;
        var toucheMoveY = e.changedTouches[0].pageY;
        var x = touchMoveX - TouchStart.x;
        var y = toucheMoveY - TouchStart.y;
        if (startX + x > 70) {
            x = -startX + 70;
        }
        else if (startX + x < -70) {
            x = -startX - 70;
        }
        cubeBox.style.webkitTransform = 'scale(0.7) rotateX('+(startY+y)+'deg) rotateY('+(startX+x)+'deg)';
    }
    function cEnd(e){
        if(!flag){
            startX+=x;
            startY+=y;
        }
        document.removeEventListener('touchstart',cStart,false);
        document.removeEventListener('touchemove',cMove,false);
        document.removeEventListener('touchend',cEnd,false)
    }
}








