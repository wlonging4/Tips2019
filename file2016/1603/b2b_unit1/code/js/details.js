(function (){


// 选择颜色、版本、内存大小

$(function (){
	var aLi=$('.wareParameter li');
	aLi.on('mouseenter',function (){
		$(this).addClass('hover');
	})
	aLi.on('mouseleave',function (){
		$(this).removeClass('hover');
	})
});

;(function (){

	function click(obj){
		var aLi=document.getElementById(obj).getElementsByTagName('li');
		for(var i=0;i<aLi.length;i++){

			aLi[i].onclick=function (){
				for(var j=0;j<aLi.length;j++){
					aLi[j].className='';
				}
				this.className='current';
			};
		}
	};

	click('colorSelect');
 	click('editionSelect');
 	click('memorySelect');
})();


/* 购买数量选择 */

$(function (){
    var aBtn=$('.wareBuy-btn');

    aBtn.on('mouseenter',function (){
        $(this).addClass('click');
    });
    aBtn.on('mouseleave',function (){
        $(this).removeClass('click');
    });

    var oAdd=$('#add');
    var oCut=$('#cut');
    var oBuyNum=$('#buyNum');
    var oStockNum=$('#stockNum');

    oAdd.on('click',function (){
        var oNum=oBuyNum.val();
        var oSNum=oStockNum.text();
        oNum++;
        if(oNum>=oSNum){
            oNum=oSNum;
        }
        oBuyNum.val(oNum);
    });

    oCut.on('click',function (){
        var oNum=oBuyNum.val();
        oNum--;
        if(oNum<=0){
            oNum=0;
        }
        oBuyNum.val(oNum);
    });




});





    /*表单选中*/
    $(function () {
        var form_1_input=$('.info-main-com-count-form1 label>input[name=comment]');
        form_1_input.on('click',function(){
            $(this).parent().addClass('info-main-form-check').siblings().removeClass('info-main-form-check');
        });
    });

    /*吸顶实现*/
;(function (){
        function getPos(obj)
        {
            var left=0;
            var top=0;
            while (obj)
            {
                console.log(top)
                left+=obj.offsetLeft;
                top+=obj.offsetTop;
                obj=obj.offsetParent;
            }
            return {left:left, top:top};
        };

       

        // 点击定位

        var bar_topLi=$('#info-bar-ul > li');

        var bar_sideLi=$('#info-bar-side .info-bar-side-s');

        var aaa=$('#info-main .scrollTrack');

        bar_topLi.on('click', function () {
            var index = $(this).index();
            $(this).addClass("li-hover").siblings().removeClass('li-hover');
            bar_sideLi.parent().eq(index).addClass("info-bar-side-bg").siblings().removeClass('info-bar-side-bg');
            var target = $(this).attr('data-rel');
            var top = $('#'+ target).offset().top;
            top = index !== 0 ? (top - 5 - 47) : top;
            $('body,html').stop().animate({scrollTop:top});
        });

        bar_sideLi.on('click', function () {
            var parent = $(this).parent();
            var index = parent.index();
            parent.addClass("info-bar-side-bg").siblings().removeClass('info-bar-side-bg');
            bar_topLi.eq(index).addClass("li-hover").siblings().removeClass('li-hover');
            var target = $(this).attr('data-rel');
            var top = $('#'+ target).offset().top;
            top = index !== 0 ? (top - 5 - 47) : top;
            $('body,html').stop().animate({scrollTop:top});
        });





        // 滚动改变 

        function scrollT(num){
            bar_topLi.eq(num).addClass("li-hover").siblings().removeClass('li-hover');
            bar_sideLi.parent().eq(num).addClass("info-bar-side-bg").siblings().removeClass('info-bar-side-bg');
        };

        var info_bar=document.getElementById('info-bar');
        var top=getPos(info_bar).top;
         var bb=[];

        window.onload=function (){
           
                aaa.each(function (i){

                    bb.push($(aaa).eq(i).offset().top-80);
                });
        };
       

        window.onscroll=function (){

            var scrollTop=document.documentElement.scrollTop || document.body.scrollTop;
            if (scrollTop > top)
            {
                info_bar.style.position="fixed";
                info_bar.style.top=0;
            }
            else
            {
                info_bar.style.position="absolute";
            }


            if(scrollTop>=bb[0] && scrollTop<=bb[1]){
                scrollT(0);
            }
            if(scrollTop>=bb[1] && scrollTop<=bb[2]){
                scrollT(1);
            }
            if(scrollTop>=bb[2] && scrollTop<=bb[3]){
                scrollT(2);
            }
            if(scrollTop>=bb[3]){
                scrollT(3);
            }
        };

    })();



})(window.$ || window.jQuery);