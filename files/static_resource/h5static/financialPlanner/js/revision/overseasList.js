$(function(){var a=$("li.img").width(),e=parseInt(239*a/695);$("li.img").css("max-height",e+"px");new Swiper(".swiper-container",{pagination:".swiper-pagination",paginationClickable:!0,preventClicksPropagation:!1,preventClicks:!1,paginationBulletRender:function(a,e,i){var t=["美国","英国","澳洲"],n='<span class="'+i+'"><a href="javascript:;">'+t[e]+"</a></span>";return n},onSlideChangeStart:function(a){var e=["美国","英国","澳洲"],i=a.activeIndex,t=$("#managerId").val(),n={protype:"海外置业"};n.country=e[i],n.managerId=t,$.ajax({type:"post",url:"/mobile/allocation/lifeJson.shtml",dataType:"json",data:n,success:function(a){var e=a&&a.length?a.length:0,t="";if(e>0){t+='<p class="societyTitle"><img src="'+staticAppImages+'/sea2.png" width="80%"/></p>';for(var l=0;e>l;l++){var s=a[l];t+='<ul class="societyProject">',s.subimage&&(t+='<li class="img"><a href="/mobile/allocation/subjectSimpleInfo.shtml?code='+s.code+"&openNewPage=1&managerId="+n.managerId+'"><img src="'+s.subimage+'" width="100%"/></a> </li>'),t+='<li><a href="/mobile/allocation/subjectSimpleInfo.shtml?code='+s.code+"&openNewPage=1&managerId="+n.managerId+'"><img src="'+staticAppImages+'/sea5.jpg" width="100%"/></a></li>',t+='<li class="word"><h2>'+s.subtitle+"</h2><p>"+s.subdesc+"</p></li>",t+='<li><a href="/mobile/allocation/subjectSimpleInfo.shtml?code='+s.code+"&openNewPage=1&managerId="+n.managerId+'" class="btn lg">查看详情</a> </li>',t+="</ul>"}$(".actionContent").eq(i).html(t);var o=$("li.img").width(),c=parseInt(239*o/695);$("li.img").css("max-height",c+"px")}}})}})});