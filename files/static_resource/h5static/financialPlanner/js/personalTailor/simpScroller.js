var simpScroller=function(){var t=1*!(window.DocumentTouch&&document instanceof window.DocumentTouch||"ontouchstart"in window),e={start:["touchstart","mousedown"][t],move:["touchmove","mousemove"][t],end:["touchend","mouseup"][t]},o=function(o,n,l){var c="top",i="Top",r="height",a="Height",s="pageY";"horizontal"==n&&(c="left",i="Left",r="width",a="Width",s="pageX");var u=null;0==l.hideScrollBar&&(u=document.createElement("div"),u.className="scroller_"+n,l.container.appendChild(u));var d=o["client"+a],h=0,p=function(){if(null!=u){var t=u.style[r].replace("px",""),e=o["scroll"+i]/(h-d)*(d-t);0>=d-t-e&&(e=parseFloat(d)-parseFloat(t)),u.style[c]=e+"px"}},v=function(t){h=t["scroll"+a],u&&h>d&&(u.style.opacity=1,u.style[r]=d*d/h+"px",p())},m={};return o.addEventListener(e.start,function(t){h=this["scroll"+a],m[s]=t.touches?t.touches[0][s]:t[s],m[c]=this["scroll"+i],document.moveFollow=!0,u&&h>d&&(u.style.opacity=1,u.style[r]=d*d/h+"px",p())}),o.addEventListener(e.move,function(e){(0==t||1==document.moveFollow)&&(this["scroll"+i]=m[c]+(m[s]-(e.touches?e.touches[0][s]:e[s])),p(),l.onScroll.call(this,e)),e.preventDefault()}),o.addEventListener(e.end,function(t){u&&(u.style.opacity=1)}),1==t&&document.addEventListener("mouseup",function(){this.moveFollow=!1}),{initPosScrollFn:function(t){v(t)}}};return function(t,e){e=e||{};var n,l=new Object({verticalScroll:!0,horizontalScroll:!1,hideScrollBar:!1,onScroll:function(){}});for(n in e)l[n]=e[n];"static"==window.getComputedStyle(t).position&&(t.style.position="relative");var c=t.childNodes,i=document.createDocumentFragment();[].slice.call(c).forEach(function(t){i.appendChild(t)});var r=document.createElement("div");r.style.height="100%",r.style.width="100%",r.style.overflow="hidden",t.appendChild(r),r.appendChild(i),l.container=t;var a="";return 1==l.verticalScroll&&(a=o(r,"vertical",l)),1==l.horizontalScroll&&(a=o(r,"horizontal",l)),a.initPosScrollFn(r),this}}();