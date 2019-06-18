
(function (){


    //图片移入
    $(function (){
    	var pro_lists=$('#product-list li');
    	pro_lists.on('mouseenter',function (){
    		$(this).addClass('current');
    	});
    	pro_lists.on('mouseleave',function (){
    		$(this).removeClass('current');
    	});

    	var join=$('.product-list-sale');
    	join.on('mouseenter',function (){
    		$(this).addClass('hover');
    	});
    	join.on('mouseleave',function (){
    		$(this).removeClass('hover');
    	});
    });



    //价格排序
    $(function (){
    	var aLi=$('.product-title-l li');
    	aLi.on('mouseenter',function (){
    		$(this).addClass('hover');
    	});

    	aLi.on('mouseleave',function (){
    		$(this).removeClass('hover');
    	});

    	var priceSort=$('.product-title-price');
    	priceSort.on('click',function (){

    		if(priceSort.hasClass('top') || priceSort.hasClass('bottom')){
    			if(priceSort.hasClass('top')){
    				priceSort.removeClass('top');
    				priceSort.addClass('bottom');
    			}
    			else{
    				priceSort.removeClass('bottom');
    				priceSort.addClass('top');
    			}
    		}
    		else{
    			priceSort.addClass('top');
    		}
    	});
    });


    //添加筛选

    $(function (){
        var addScreen=$('.level-select');
        addScreen.on('mouseenter',function (){
            $(this).addClass('current');
        });
        addScreen.on('mouseleave',function (){
            $(this).removeClass('current');
        });


    });


    //品牌展示移入
    $(function (){
    	var aLi=$('.brand-inner li');
    	aLi.on('mouseenter',function (){
    		$(this).addClass('current');
    	});
    	aLi.on('mouseleave',function (){
    		$(this).removeClass('current');
    	});
    });




    //更多筛选展示
    $(function (){
        var showHideBtn=$('.more-or-return .option');
        var oBar=$('.more-or-return');
        var oShow=$('#showScreen');
        var oHide=$('#hideScreen');
        var aOtherScreen=$('.screen-other');

        showHideBtn.on('mouseenter',function (){
            $(this).addClass('hover');
            oBar.addClass('current');
        });

        showHideBtn.on('mouseleave',function (){
            $(this).removeClass('hover');
            oBar.removeClass('current');
        });

        showHideBtn.on('click',function (){
            showHideBtn.removeClass('hide');
            $(this).addClass('hide');
        });

        oShow.on('click',function (){
            aOtherScreen.addClass('current');
        });

        oHide.on('click',function (){
            aOtherScreen.removeClass('current');
        });
    });


    $(function (){
    	var aLi=$('.product-foot-ul li')
        aLi.on('mouseenter',function (){
            $(this).addClass('hover');
        });
        aLi.on('mouseleave',function (){
            $(this).removeClass('hover');
        });

        var prev=$('#pro-foot-btn1');
        var next=$('#pro-foot-btn2');
        prev.on('mouseenter',function (){
            $(this).addClass('hover');
        });
        prev.on('mouseleave',function (){
            $(this).removeClass('hover');
        });
        next.on('mouseenter',function (){
            $(this).addClass('hover');
        });
        next.on('mouseleave',function (){
            $(this).removeClass('hover');
        });

    });

})(window.$ || window.jQuery)