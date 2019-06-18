(function(){

     $('.focus').bxSlider({
        mode:'fade',
        auto: true,
        captions: true,
        prevText:'',
        nextText:'',
        speed:1000,
    });

    //图片移入变化
    function mouseEnter(idName){
        var phones=document.getElementById(idName).getElementsByTagName("ul")[0].getElementsByTagName("li");
        for(var i=0;i<phones.length;i++){
            phones[i].onmouseover= function () {
                this.style.borderColor="#f0f0f0";
            };
            phones[i].onmouseout= function () {
                this.style.borderColor="#fff";
            }
        }
    };
    mouseEnter("phone");
    mouseEnter("computer");
    mouseEnter("digital");


    //今日推荐

    $(function (){
        var aLi=$('#introduce li');

        aLi.on('mouseenter',function (){
            $(this).addClass('current');
        })

        aLi.on('mouseleave',function (){
            $(this).removeClass('current');
        })
    })



    //今日出货排名
    $(function (){
        var aRankingType=document.getElementById('ranking').getElementsByTagName('li');
        var aRankingList=document.getElementById('rankingList').getElementsByTagName('ul');
        for(var i=0;i<aRankingType.length;i++){

            (function (index){
                aRankingType[i].onmouseover=function (){

                    for(var i=0;i<aRankingType.length;i++){

                        aRankingType[i].className='';
                        aRankingList[i].className='';
                    };
                    this.className='current';
                    aRankingList[index].className='current'
                };
            })(i);
        };
    });



})(window.$ || window.jQuery)
