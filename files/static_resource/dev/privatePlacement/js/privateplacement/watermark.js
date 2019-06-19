
//水印
window.onload=function(){

	if(document.querySelectorAll(".watermarkBox").length>0){
        var maxH = document.querySelector("body").offsetHeight;

        var cloneNum = parseInt(maxH/200);
		var watermark = document.querySelector(".watermark");
		var cloneHtmlAll = "";
		for(var i = 0; i < cloneNum; i++){
            var cloneDom = watermark.cloneNode(true);
            if(i === 0){
                cloneDom.style.top = '100px'
            }else{
                cloneDom.style.top = (100 + 200*i) + 'px';
            }
            var cloneDomStr = cloneDom.outerHTML;
            cloneHtmlAll += cloneDomStr;
		}
		document.querySelector(".watermarkBox").innerHTML = cloneHtmlAll;
		
	}
	
	
	if(document.querySelectorAll(".content img").length>0){
		[].slice.call(document.querySelectorAll(".content img")).forEach(function(tabNavItem,index){
			document.querySelectorAll(".content img")[index].setAttribute("style","");
			document.querySelectorAll(".content img")[index].setAttribute("width","");
			document.querySelectorAll(".content img")[index].setAttribute("height","");
		});
		
	}
}