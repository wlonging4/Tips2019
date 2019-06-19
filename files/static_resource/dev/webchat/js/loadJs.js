window.ontouchstart=function(){}
var swiper="";
window.onload=function(){
	hengshuping();
	var courseTitle=getQueryString("courseTitle");
	document.querySelector(".swiper-wrapper").classList.add(courseTitle);
	if(document.getElementsByClassName("swiper-container").length>0){
		appendHtmlBind();
		var indexNum=document.querySelectorAll(".swiper-container img").length;
		document.querySelector(".total").innerHTML=indexNum;
		selectItem(indexNum);
		swiper = new Swiper('.swiper-container', {
	        pagination: '.swiper-pagination',
	        paginationClickable: '.swiper-pagination',
	        nextButton: '.swiper-button-next',
	        prevButton: '.swiper-button-prev',
	        onTransitionStart: function(swiper){
	        	imgLoad(swiper.activeIndex);
	        },
	        onTransitionEnd: function(swiper){
	        	document.querySelector(".nowPage").innerHTML=swiper.activeIndex+1;
	        	selectDialogActive(swiper.activeIndex);

	        }
	    });

	    document.querySelector(".page").onclick=function(){
	    	selectDialogShow();
	    }
	     document.querySelector(".selectDialogMash").onclick=function(){
	    	selectDialogHide();
	    }

	}

	if(document.querySelectorAll(".selectDialog ul li").length > 0){
		[].slice.call(document.querySelectorAll(".selectDialog ul li")).forEach(function(thisObj,index){
			  thisObj.onclick=function(){
			   	swiper.slideTo(index, 500, false);
			   	selectDialogActive(index);
			   	document.querySelector(".nowPage").innerHTML=index+1;
			   	imgLoad(index);
			   	selectDialogHide();
			  }
    	});
	}


	photoSwipeBind();
}
function selectDialogActive(indexActive){
	[].slice.call(document.querySelectorAll(".selectDialog ul li")).forEach(function(thisObj,index){
			   thisObj.classList.remove("radioActive");
    });
	document.querySelectorAll(".selectDialog ul li")[indexActive].classList.add("radioActive");


}
function selectItem(indexNum){
	var html="";
	if(indexNum!=0){
		for(i=0; i<indexNum; i++){
			if(i==0){
				html+='<li class="radioActive"><div class="nubBox">'+(i+1)+'</div><div class="radioBtn"><span></span></div></li>';
			}else{
				html+='<li><div class="nubBox">'+(i+1)+'</div><div class="radioBtn"><span></span></div></li>';
			}

		}
	}

	document.querySelector(".selectDialog ul").innerHTML=html;
}
function selectDialogShow(){
	document.querySelector(".selectDialogMain").classList.add("displayblock");
}
function selectDialogHide(){
	document.querySelector(".selectDialogMain").classList.remove("displayblock");
}
function hengshuping(){
  if(window.orientation==180||window.orientation==0){
       document.body.classList.remove("shenping");
       swiperContainerRemoveHeight();
   }
if(window.orientation==90||window.orientation==-90){
        document.body.classList.add("shenping");
        swiperContainerHeight();
    }
 }
window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", hengshuping, false);
function swiperContainerHeight(){
	document.querySelector(".swiper-container").style.height=(document.documentElement.clientHeight || document.body.clientHeight)+"px";
}
function swiperContainerRemoveHeight(){
	document.querySelector(".swiper-container").setAttribute("style","");
}
function photoSwipeBind(){
		var initPhotoSwipeFromDOM = function(gallerySelector) {

			var parseThumbnailElements = function(el) {
			    var thumbElements = el.childNodes,
			        numNodes = thumbElements.length,
			        items = [],
			        el,
			        childElements,
			        thumbnailEl,
			        size,
			        item;

			    for(var i = 0; i < numNodes; i++) {
			        el = thumbElements[i];

			        // include only element nodes
			        if(el.nodeType !== 1) {
			          continue;
			        }

			        childElements = el.children;

			        size = el.getAttribute('data-size').split('x');

			        // create slide object
			        item = {
						src: el.getAttribute('data-med'),
						w: parseInt(size[0], 10),
						h: parseInt(size[1], 10),
						author: el.getAttribute('data-author')
			        };

			        item.el = el; // save link to element for getThumbBoundsFn

			        if(childElements.length > 0) {
			          item.msrc = childElements[0].getAttribute('src'); // thumbnail url
			          if(childElements.length > 1) {
			              item.title = childElements[1].innerHTML; // caption (contents of figure)
			          }
			        }


					var mediumSrc = el.getAttribute('data-med');
		          	if(mediumSrc) {
		            	size = el.getAttribute('data-med-size').split('x');
		            	// "medium-sized" image
		            	item.m = {
		              		src: mediumSrc,
		              		w: parseInt(size[0], 10),
		              		h: parseInt(size[1], 10)
		            	};
		          	}
		          	// original image
		          	item.o = {
		          		src: item.src,
		          		w: item.w,
		          		h: item.h
		          	};

			        items.push(item);
			    }

			    return items;
			};

			// find nearest parent element
			var closest = function closest(el, fn) {
			    return el && ( fn(el) ? el : closest(el.parentNode, fn) );
			};

			var onThumbnailsClick = function(e) {
			    e = e || window.event;
			    e.preventDefault ? e.preventDefault() : e.returnValue = false;

			    var eTarget = e.target || e.srcElement;

			    var clickedListItem = closest(eTarget, function(el) {
			        return el.tagName === 'A';
			    });

			    if(!clickedListItem) {
			        return;
			    }

			    var clickedGallery = clickedListItem.parentNode;

			    var childNodes = clickedListItem.parentNode.childNodes,
			        numChildNodes = childNodes.length,
			        nodeIndex = 0,
			        index;

			    for (var i = 0; i < numChildNodes; i++) {
			        if(childNodes[i].nodeType !== 1) {
			            continue;
			        }

			        if(childNodes[i] === clickedListItem) {
			            index = nodeIndex;
			            break;
			        }
			        nodeIndex++;
			    }
			    if(index >= 0) {
			        openPhotoSwipe( index, clickedGallery );
			    }
			    return false;
			};

			var photoswipeParseHash = function() {
				var hash = window.location.hash.substring(1),
			    params = {};

			    if(hash.length < 5) {
			        return params;
			    }

			    var vars = hash.split('&');
			    for (var i = 0; i < vars.length; i++) {
			        if(!vars[i]) {
			            continue;
			        }
			        var pair = vars[i].split('=');
			        if(pair.length < 2) {
			            continue;
			        }
			        params[pair[0]] = pair[1];
			    }

			    if(params.gid) {
			    	params.gid = parseInt(params.gid, 10);
			    }

			    return params;
			};

			var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
			    var pswpElement = document.querySelectorAll('.pswp')[0],
			        gallery,
			        options,
			        items;

				items = parseThumbnailElements(galleryElement);


			    options = {

			        galleryUID: galleryElement.getAttribute('data-pswp-uid'),

			        getThumbBoundsFn: function(index) {

			            var thumbnail = items[index].el.children[0],
			                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
			                rect = thumbnail.getBoundingClientRect();

			            return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
			        },

			        addCaptionHTMLFn: function(item, captionEl, isFake) {
						if(!item.title) {
							captionEl.children[0].innerText = '';
							return false;
						}
						captionEl.children[0].innerHTML = item.title +  '<br/><small>Photo: ' + item.author + '</small>';
						return true;
			        },

			    };


			    if(fromURL) {
			    	if(options.galleryPIDs) {

			    		for(var j = 0; j < items.length; j++) {
			    			if(items[j].pid == index) {
			    				options.index = j;
			    				break;
			    			}
			    		}
				    } else {
				    	options.index = parseInt(index, 10) - 1;
				    }
			    } else {
			    	options.index = parseInt(index, 10);
			    }


			    if( isNaN(options.index) ) {
			    	return;
			    }



				var radios = document.getElementsByName('gallery-style');
				for (var i = 0, length = radios.length; i < length; i++) {
				    if (radios[i].checked) {
				        if(radios[i].id == 'radio-all-controls') {

				        } else if(radios[i].id == 'radio-minimal-black') {
				        	options.mainClass = 'pswp--minimal--dark';
					        options.barsSize = {top:0,bottom:0};
							options.captionEl = false;
							options.fullscreenEl = false;
							options.shareEl = false;
							options.bgOpacity = 0.85;
							options.tapToClose = true;
							options.tapToToggleControls = false;
				        }
				        break;
				    }
				}

			    if(disableAnimation) {
			        options.showAnimationDuration = 0;
			    }

			    // Pass data to PhotoSwipe and initialize it
			    gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);

			    // see: http://photoswipe.com/documentation/responsive-images.html
				var realViewportWidth,
				    useLargeImages = false,
				    firstResize = true,
				    imageSrcWillChange;

				gallery.listen('beforeResize', function() {

					var dpiRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
					dpiRatio = Math.min(dpiRatio, 2.5);
				    realViewportWidth = gallery.viewportSize.x * dpiRatio;


				    if(realViewportWidth >= 1200 || (!gallery.likelyTouchDevice && realViewportWidth > 800) || screen.width > 1200 ) {
				    	if(!useLargeImages) {
				    		useLargeImages = true;
				        	imageSrcWillChange = true;
				    	}

				    } else {
				    	if(useLargeImages) {
				    		useLargeImages = false;
				        	imageSrcWillChange = true;
				    	}
				    }

				    if(imageSrcWillChange && !firstResize) {
				        gallery.invalidateCurrItems();
				    }

				    if(firstResize) {
				        firstResize = false;
				    }

				    imageSrcWillChange = false;

				});

				gallery.listen('afterChange', function() {
					var gallerActive=gallery.getCurrentIndex();
					swiper.slideTo(gallerActive, 500, false);
				   	selectDialogActive(gallerActive);
				   	document.querySelector(".nowPage").innerHTML=gallerActive+1;
				   	imgLoad(gallerActive);
				})

				gallery.listen('gettingData', function(index, item) {
				    if( useLargeImages ) {
				        item.src = item.o.src;
				        item.w = item.o.w;
				        item.h = item.o.h;
				    } else {
				        item.src = item.m.src;
				        item.w = item.m.w;
				        item.h = item.m.h;
				    }
				});

			    gallery.init();
			};

			// select all gallery elements
			var galleryElements = document.querySelectorAll( gallerySelector );
			for(var i = 0, l = galleryElements.length; i < l; i++) {
				galleryElements[i].setAttribute('data-pswp-uid', i+1);
				galleryElements[i].onclick = onThumbnailsClick;
			}

			// Parse URL and open gallery if it contains #&pid=3&gid=1
			var hashData = photoswipeParseHash();
			if(hashData.pid && hashData.gid) {
				openPhotoSwipe( hashData.pid,  galleryElements[ hashData.gid - 1 ], true, true );
			}
		};


		initPhotoSwipeFromDOM(".demo-gallery");

}
function appendHtmlBind(){
	if(document.querySelectorAll(".kj1").length==1){
		appendHtml("kj1",22);
	}else if(document.querySelectorAll(".kj2").length==1){
		appendHtml("kj2",101);
	}else if(document.querySelectorAll(".kj3").length==1){
		appendHtml("kj3",67);
	}else if(document.querySelectorAll(".kj4").length==1){
		appendHtml("kj4",83);
	}else if(document.querySelectorAll(".kj5").length==1){
		appendHtml("kj5",105);
	}else if(document.querySelectorAll(".kj6").length==1){
		appendHtml("kj6",70);
	}else if(document.querySelectorAll(".kj7").length==1){
		appendHtml("kj7",14);
	}else if(document.querySelectorAll(".kj8").length==1){
		appendHtml("kj8",104);
	}else if(document.querySelectorAll(".kj9").length==1){
		appendHtml("kj9",146);
	}else if(document.querySelectorAll(".kj10").length==1){
		appendHtml("kj10",42);
	}else if(document.querySelectorAll(".kj11").length==1){
		appendHtml("kj11",38);
	}else if(document.querySelectorAll(".kj12").length==1){
		appendHtml("kj12",53);
	}else if(document.querySelectorAll(".kj13").length==1){
		appendHtml("kj13",29);
	}else if(document.querySelectorAll(".kj14").length==1){
		appendHtml("kj14",84);
	}else if(document.querySelectorAll(".kj15").length==1){
		appendHtml("kj15",62);
	}else if(document.querySelectorAll(".kj16").length==1){
		appendHtml("kj16",27);
	}else if(document.querySelectorAll(".kj17").length==1){
		appendHtml("kj17",67);
	}else if(document.querySelectorAll(".kj18").length==1){
		appendHtml("kj18",70);
	}else if(document.querySelectorAll(".kj19").length==1){
		appendHtml("kj19",78);
	}else if(document.querySelectorAll(".kj20").length==1){
		appendHtml("kj20",119);
	}else if(document.querySelectorAll(".kj21").length==1){
		appendHtml("kj21",125);
	}else if(document.querySelectorAll(".kj22").length==1){
		appendHtml("kj22",100);
	}else if(document.querySelectorAll(".kj23").length==1){
		appendHtml("kj23",33);
	}else if(document.querySelectorAll(".kj24").length==1){
		appendHtml("kj24",31);
	}else if(document.querySelectorAll(".kj25").length==1){
		appendHtml("kj25",63);
	}else if(document.querySelectorAll(".kj26").length==1){
		appendHtml("kj26",84);
	}else if(document.querySelectorAll(".kj27").length==1){
		appendHtml("kj27",44);
	}else if(document.querySelectorAll(".kj28").length==1){
		appendHtml("kj28",36);
	}else if(document.querySelectorAll(".kj29").length==1){
		appendHtml("kj29",98);
	}else if(document.querySelectorAll(".kj30").length==1){
		appendHtml("kj30",20);
	}else if(document.querySelectorAll(".kj31").length==1){
		appendHtml("kj31",7);
	}else if(document.querySelectorAll(".kj32").length==1){
		appendHtml("kj32",35);
	}
}
function appendHtml(obj,imgNum){
	var appendhtml="";
	var seatImg="../webchat/images/defaultImg.jpg";
	for(i=0; i<imgNum; i++){
		var imgUrl='../webchat/images/'+obj+'/'+obj+'_'+(i+1)+".jpg";
		appendhtml+='<a  data-size="2880x1620" data-med="'+imgUrl+'" data-med-size="960x540" data-author="Folkert Gorter"  class="swiper-slide">'
        if(i==0){
        	appendhtml+='<img src="'+imgUrl+'" loadend="loadend" />';
        }else{
        	appendhtml+='<img src="'+seatImg+'" loadend="" />';
        }

        appendhtml+='</a>'
	}
	document.querySelector("."+obj).innerHTML=appendhtml;

}
function imgLoad(indexNum){
	var loadImgObj=document.querySelectorAll(".swiper-wrapper a img")[indexNum];
	if(loadImgObj.getAttribute("loadend") != "loadend"){
		var imgLoadObj=document.querySelectorAll(".swiper-wrapper a")[indexNum];
		var imgUrl=imgLoadObj.getAttribute("data-med");
		loadImgObj.src=imgUrl;
		loadImgObj.setAttribute("loadend","loadend");
	}


}
function getQueryString(name){
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) return unescape(r[2]); 
    return null; 
}