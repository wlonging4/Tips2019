$(function(){

        var imgW = $("li.img").width(), imgH = parseInt(imgW*239/695);
        $("li.img").css("max-height", imgH + "px");

        var swiper = new Swiper('.swiper-container', {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            preventClicksPropagation:false,
            preventClicks:false,
            paginationBulletRender: function (swiper, index, className) {
                var arr=['美国','格林纳达','葡萄牙','马耳他'],
                        str='<span style="width:24%;" class="' + className + '"><a href="javascript:;">'+arr[index]+'</a></span>';
                return str;
            },
            onSlideChangeStart: function(swiper){
                //回调函数，滑动完成后

                var arrH = ['美国','格林纳达','葡萄牙','马耳他'], activeIndex = swiper.activeIndex, managerId = $("#managerId").val();
                var reqJSON = {
                    protype: "投资移民"
                };
                reqJSON.country = arrH[activeIndex];
                reqJSON.managerId = managerId;
                $.ajax({
                    type : "post",
                    url :"/mobile/allocation/lifeJson.shtml",
                    dataType : "json",
                    data : reqJSON,
                    success : function(data) {
                        var len = data&&data.length ? data.length : 0, html = "", newActionH;
                        if(len > 0){
                            html += '<p class="societyTitle"><img src="' + staticAppImages + '/sea2.png" width="80%"/></p>';

                            for(var i = 0; i < len; i++){
                                var item = data[i];
                                html += '<ul class="societyProject">';
                                if(item["subimage"]) {
                                    html += '<li class="img"><a style="display:block" href="/mobile/allocation/subjectSimpleInfo.shtml?code=' + item["code"] + '&openNewPage=1&managerId=' + reqJSON.managerId + '"><img src="' + item["subimage"] + '" width="100%"/></a> </li>'
                                }
                                html += '<li><a style="display:block" href="/mobile/allocation/subjectSimpleInfo.shtml?code=' + item["code"] + '&openNewPage=1&managerId=' + reqJSON.managerId + '"><img src="' + staticAppImages + '/sea5.jpg" width="100%"/></a></li>'
                                html += '<li class="word"><h2>' + item["subtitle"] + '</h2><p>' + item["subdesc"] + '</p></li>';
                                html += '<li><a href="/mobile/allocation/subjectSimpleInfo.shtml?code=' + item["code"] + '&openNewPage=1&managerId=' + reqJSON.managerId + '" class="btn lg">查看详情</a> </li>';
                                html += '</ul>'
                            }
                            $(".actionContent").eq(activeIndex).html(html);
                            var imgW = $("li.img").width(), imgH = parseInt(imgW*239/695);
                            $("li.img").css("max-height", imgH + "px");
                        }
                    }
                });

            }
        });
    })