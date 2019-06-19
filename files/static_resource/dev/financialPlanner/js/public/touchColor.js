window.onload=function(){
	[].slice.call(document.querySelectorAll(".footerItem  a")).forEach(function(thisObj,index){
		thisObj.addEventListener("touchstart",function(){thisObj.classList.add("active")},false);
		thisObj.addEventListener("touchend",function(){thisObj.classList.remove("active")},false);
	});
	
}