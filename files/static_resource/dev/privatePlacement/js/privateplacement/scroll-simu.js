/**
 * Created by yugu10 on 2017/6/30.
 */
$(document).ready(function(){
    ;(function(){
        if($('#wrapper').length > 0){
            var myScroll = new IScroll('#wrapper', { probeType: 3, mouseWheel: true }),
                pageIndex = 1,//第几页，初始是第一页
                pageMore = true,//是否翻页
                flag = false,//滚动结束的标志
                ajaxFlag = true,//防止重复提交
                wrapper = $("#scroller"),
                item = wrapper.children(),
                len = item.length;
            if(item.length > 20){
                pageMore = false;//初次进来不翻页
            }
            myScroll.on('scroll', function(){
                var h1 = wrapper.height(), h2 = $(".tips").height() || 0, winH = $(window).height();
                if(this.directionY > -1){
                    if((h1 + h2 < winH) || (h1 + h2 == winH)){
                        if(this.maxScrollY - this.y == 0){
                            flag = true;
                        };
                    }else{
                        if(this.maxScrollY - this.y > 30){
                            flag = true;
                        };
                    }
                }
            });
            myScroll.on('scrollEnd', function(){
                var token = $("#sesame-token").val();
                if(pageMore && flag && ajaxFlag){
                    pageIndex++;
                    ajaxFlag = false;
                    $.ajax({
                        url: "/mobile/appsesame/sesameList/2.shtml?pageMore=" + pageMore + "&pageIndex=" + pageIndex + "&pageSize=1&token=" + token,
                        type:"GET",
                        success:function(data){
                            if(data && data.length > 0){
                                wrapper.append(data);
                                myScroll.refresh();
                                var newLen = wrapper.children().length;
                                if(newLen - len < 20){//分页数据已经获取全了，不需要再 获取分页了
                                    pageMore = false;
                                }
                            }else{
                                pageMore = false;
                                $(".tips").addClass("show");
                                var timer = setTimeout(function(){
                                    $(".tips").removeClass("show");
                                    clearTimeout(timer);
                                }, 1000);
                            };
                            ajaxFlag = true;
                        }
                    })
                }else{
                    pageMore = false;
                    $(".tips").addClass("show");
                    var timer = setTimeout(function(){
                        $(".tips").removeClass("show");
                        clearTimeout(timer);
                    }, 1000);
                };
                flag = false;

            });
        }
    })();

});