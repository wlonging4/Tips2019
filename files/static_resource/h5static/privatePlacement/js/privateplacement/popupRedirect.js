function showtime(e){var t,n=document.querySelector(".overlay"),o=document.querySelector("body");t=window.innerHeight>o.offsetHeight?window.innerHeight:o.offsetHeight,n||(n=document.createElement("div"),n.style.cssText="width:100%;height:"+t+"px;background:white;position:absolute;top:0;left:0;",n.className="ovrly",o.appendChild(n));var i=document.getElementById("interimTime"),l=null,r=document.getElementById("sesame-materialinfo-input");l=setInterval(function(){e--,0==e?(clearInterval(l),location.href=r.value):i.innerHTML=e},1e3)}window.onload=function(){showtime(2)};