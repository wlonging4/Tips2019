
(function (){

    //产品下拉

    $(function (){
        var oSelectBtn=$('.head-product-search');
        var aSelect=$('.head-product-search .select li');
        var oSelectCon=$('.head-product-search-con');

        oSelectBtn.on('click',function (){

            oSelectBtn.addClass('current');

        });

        aSelect.on('click',function (){

            var word=$(this).text();
            oSelectCon.text(word);
            oSelectBtn.removeClass('current');
            return false;
        });

        aSelect.on('mouseenter',function (){
            $(this).addClass('current');
        });

        aSelect.on('mouseleave',function (){
            $(this).removeClass('current');
        });

    });



    //导航

    $(function (){

        var aNav=$('.nav a');

        aNav.on('click',function (){

            aNav.removeClass('current');

            $(this).addClass('current');
        })


    });



    //全部产品导航
    $(function (){
        $('.nav-whole-container').mouseover (function (){

            $('.nav-product-content-box').css('display','block')
        }).mouseout (function (){
            $('.nav-product-content-box').css('display','none')
        })


        var aLi=$('.nav-product-content li');
        aLi.mouseover(function (){

            $(this).addClass('current');
        })
        aLi.mouseout(function (){

            $(this).removeClass('current');
        })

    })



    //购物车

    //购物车滚动
    $('#carScroll').tinyscrollbar();
    var carScrollBar = $('#carScroll').data("plugin_tinyscrollbar");

    $(function (){

        var shoppingCar=$('.nav-shopping-car')
        var shoppingContent=$('.nav-shopping-box')

        shoppingCar.on ('mouseenter', function (){
            shoppingCar.addClass('current');
            shoppingContent.show();
            carScrollBar.update();
        });

        shoppingCar.on ('mouseleave', function (){
            shoppingCar.removeClass('current');
            shoppingContent.hide()
        });

    });

    

})(window.$ || window.jQuery);




















