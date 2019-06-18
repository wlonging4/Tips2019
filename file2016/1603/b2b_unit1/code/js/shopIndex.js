(function(){

     $('.focus').bxSlider({
        mode:'fade',
        auto: true,
        captions: true,
        prevText:'',
        nextText:'',
        speed:1000,
    });



    $(function () {
        var bra_title_li=$('#bra-title-ul li');
        var bra_content_div=$('#bra-container>div');
        bra_title_li.on('mouseenter',function (){
            bra_title_li.eq($(this).index()).addClass("li-hover").siblings().removeClass('li-hover');
            bra_content_div.eq($(this).index()).addClass("bra-content-block").siblings().removeClass('bra-content-block');
        });


    });


    $(function (){
        var aTr=$('.bra-content-list tbody tr');

        for(var i=0;i<aTr.length;i++){

            if(i%2==1){
                aTr[i].style.background='#f7f7f7';
            }
        }
    });


    

})(window.$ || window.jQuery)
