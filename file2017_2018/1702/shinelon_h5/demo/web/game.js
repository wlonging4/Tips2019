!(function(){
	var speed = 1,
		distance = 0,
		objs = [],
		canvas = document.getElementById('canvas'),
		context = canvas.getContext('2d'),
		rapid = document.querySelector('.rapid span'),
		quick = 0,
		slow = 0;
		now = 0,
		now2 = 0,	
		carChange = 0,
		carImages = document.querySelectorAll('.cars img'),
		carIndex = 0,
		carFlag = 0,
		car = null,
		isStart = false,
		timerStop = null,
		timerStop1 = null,
		flag = true,
		backgroundImages = document.querySelectorAll('.backgrounds img'),//����ͼ��
		backgroundIndex = 0,
		backgroundFlag = 0,
		endTime = null,
		playMu = null,
		popIndex = 0,
		popImgDom = document.getElementById('pop-img'),
		popBox= document.querySelector('.pop-box'),
		musicFlag = true;

	
	function Car(){
		this.img = carImages[carIndex];
		this.w = 264;
		this.h = 229
		this.x = 0;
		this.y = 0;
		this.dx = (canvas.width-this.w)/2;
		this.dy = canvas.height-this.w;
		this.dw = this.w;
		this.dh = this.h;
		this.iTack = 7;
		return this;
	}
	Car.prototype = {
		changeImg : function(){
			carFlag += 1;
			var carSp;
			if(speed > 1){
				carSp = 1;
			}else if(speed < 1){
				carSp = 5;
			}else{
				carSp = 3;
			}
			if(carFlag % carSp == 0){
				carIndex += 1;
				carIndex = carIndex > (carImages.length - 1) ? 0 : carIndex;
			}
			this.img = carImages[carIndex];
		},
		turnLeft:function(){
			var _this = this;
			_this.dx -= 110;
				
			if(_this.dx<=78){
				_this.dx = 78;
				_this.iTack = 2;
			}else{
				_this.iTack = 7;
			}
		},
		turnRight:function(){
			var _this = this;
			_this.dx += 110;
			if(_this.dx>=298){
				_this.dx = 298;
				_this.iTack = 4;
			}else{
				_this.iTack = 7;
			}
		}
	}

	function Line(json){
		oImg = new Image();
		oImg.src = 'http://2.zol-img.com.cn/zt/tm_579/573da364a4/line.png';
		if(json){
			dw = json.dw;
			dh = json.dh;
			dy = json.dy;
			objs.unshift({img:oImg,dw:json.dw,dh:json.dh,dy:json.dy,track:3});
		}else{
			objs.unshift({img:oImg,dw:4,dh:6,track:3});
		}
	}
	
	function Ball(json){
		oImg = document.querySelector('.ball img');
		!json && (json = {});
		if(json.quick){
			quick = json.quick;
		}else{
			var quick = Math.random();
			quick = quick >= 0.3 ? 1 : 2;
		}
		if(!json.track){
			var track = Math.random();
			track = track >= 0.5 ? 2 : 4;
		}else{
			track = json.track;
		}
		objs.unshift({img:oImg,w:220,h:220,dw:json.dw,dh:json.dh,track:track,quick:quick,type:json.type});
		
	}
	
	function square(){
		oImg = new Image();
		oImg.src = 'http://2.zol-img.com.cn/zt/tm_579/573da364a4/start.png';
		objs.unshift({img:oImg,w:579,h:162,track:6});
	}

	function Mountain(json){
		oImg = document.querySelector('.Mount img');
		var track = Math.random()*10;

		if(track >= 5){
			track = 1;
			w = 546;
			h = 425;
			if(json){
				dw = json.dw;
				dh = json.dh;
				dy = json.dy;
				dx = json.dx;
				track = json.track
				objs.unshift({img:oImg,w:w,h:h,dw:dw,dh:dh,dx:dx,dy:dy,track:track});
			}else{
				objs.unshift({img:oImg,w:w,h:h,track:track});
			}
		}else{
			track = 5;
			w = 570;
			h = 425;
			if(json){
				dw = json.dw;
				dh = json.dh;
				dy = json.dy;
				dx = json.dx;
				track = json.track
				objs.unshift({img:oImg,w:w,h:h,dw:dw,dh:dh,dx:dx,dy:dy,track:track});
			}else{
				objs.unshift({img:oImg,w:w,h:h,track:track});
			}
		}
		
	};
	function Tree(json){
		oImg = document.querySelector('.Tree img');

		var track = Math.random();
		if(track >= 0.5){
			track = 1;
			w = 546;
			h = 425;
			if(json){
				dw = json.dw;
				dh = json.dh;
				dy = json.dy;
				dx = json.dx
				objs.unshift({img:oImg,w:w,h:h,dw:dw,dh:dh,dx:dx,dy:dy,track:track});
			}else{


				objs.unshift({img:oImg,w:w,h:h,track:track});
			}
		}else{
			track = 5;
			w = 570;
			h = 425;
			if(json){
				dw = json.dw;
				dh = json.dh;
				dy = json.dy;
				dx = json.dx
				objs.unshift({img:oImg,w:w,h:h,dw:dw,dh:dh,dx:dx,dy:dy,track:track});
			}else{
				objs.unshift({img:oImg,w:w,h:h,track:track});
			}
		}
		
	};
	function backgroundMove(){
		
		!(function(){
			background = backgroundImages[backgroundIndex];
			draw(background,0,0,canvas.width,canvas.height,0,0,canvas.width,canvas.height);

			backgroundFlag += 1;
			var bTime;
			if(speed > 1){
				bTime = 2;
			}else if(speed < 1){
				bTime = 6;
			}else{
				bTime = 4;
			}
			if(backgroundFlag % bTime == 0){
				backgroundIndex += 1;
				backgroundIndex = backgroundIndex > (backgroundImages.length - 1) ? 0 : backgroundIndex;
			}
			
		})();

		
		car.changeImg();			
		
	}

	function move(fn){
		move.timer = setTimeout(function(){
			objs.forEach(function(ele,index){
				if(ele.dx >= canvas.width || ele.dx < -570 || ele.dy >= canvas.height){
					objs.splice(index,1)
				}
			});
			if(isStart){
				objs.forEach(function(ele,index){
					if(objs[index].dy >= 630 && objs[index].dy <= 700){
						if(car.iTack == 4 && objs[index].track == 4 || (car.iTack == 2 && objs[index].track == 2) || (car.iTack == 7 && objs[index].track == 7)){						
							if(objs[index].disabled) return;
							objs[index].disabled = true;
							if(objs[index].quick == 1){
								quick += 1;
								document.querySelector('.box > .statistics .bolt').innerHTML = quick;
								document.querySelector('.end-pop1 .statistics .bolt').innerHTML = quick;
								objs[index].y = 500;
								speed = 2;
								rapid.style.WebkitTransform = 'rotate(90deg)';
								rapid.style.transform = 'rotate(90deg)';
								
								if(timerStop) clearTimeout(timerStop);

								speed = 1;
								timerStop = setTimeout(function(){
									rapid.style.WebkitTransform = 'rotate(0)';
									rapid.style.transform = 'rotate(0)';

								},500);
								
								if(playMu) clearTimeout(playMu);
								setTimeout(function(){
									objs.splice(index,1);
								},10);
								if(musicFlag){
									document.getElementById('quick').play();
								}
								
								playMu = setTimeout(function(){
									document.getElementById('quick').pause();
								},1000);
							}else if(objs[index].quick == 2){
								objs[index].y = 500;
								slow += 1;
								document.querySelector('.box > .statistics .tortoise').innerHTML = slow;
								document.querySelector('.end-pop1 .statistics .tortoise').innerHTML = slow;
								rapid.style.WebkitTransform = 'rotate(-90deg)';
								rapid.style.transform = 'rotate(-90deg)';
								
								if(timerStop1) clearTimeout(timerStop1);
								var timerStop1= setTimeout(function(){
									rapid.style.WebkitTransform = 'rotate(0)';
									rapid.style.transform = 'rotate(0)';
									speed = 1;
								},500);
								speed = 0.3;
								
								
								setTimeout(function(){
									objs.splice(index,1);
								},10);
								if(musicFlag){
									document.getElementById('show').play();
								}
								
								setTimeout(function(){
									document.getElementById('show').pause();
								},1000);
								

							}	
						}
					}
				});
			}
			context.clearRect(0,0,canvas.width,canvas.height);
			if(isStart){
				backgroundMove();

			}
			objs.forEach(function(ele,index){
				!ele.speed && (ele.speed = 0.1);
				
				var temp={};
				switch(ele.track){
					case 1:
						ele.x = 0;
						ele.y = 0;
						if(!ele.dh) ele.dh = ele.h/20;
						if(!ele.dw) ele.dw = ele.w/20;
						if(!ele.dx) ele.dx = 210;
						if(!ele.dy) ele.dy = 410;

						temp = {
							dh:ele.dh+speed*ele.speed,
							dw:ele.dw+speed*ele.speed,
							dx:ele.dx-speed*ele.speed*1.3,
							dy:ele.dy-speed*ele.speed*0.39,
						};
						break;
					case 2:
						if(ele.quick == 1){
							ele.x = 0;
						}else{
							ele.x = 280;
						}
						if(!ele.y) ele.y = 0;
						if(!ele.dx) ele.dx = 280;
						if(!ele.dy) ele.dy = 410;
						if(!ele.dw) ele.dw = ele.w/10;
						if(!ele.dh) ele.dh = ele.h/10;

						temp = {
							dw:ele.dw+speed*ele.speed*1.2,
							dh:ele.dh+speed*ele.speed*1.2,
							dy:ele.dy+speed*ele.speed,
							dx:ele.dx-speed*ele.speed*1.1
						};
						break;
					case 3://line
						ele.x = 0;
						ele.y = 0;
						ele.w = 17;
						ele.h = 42;
						if(!ele.dx) ele.dx = parseInt((canvas.width-ele.dw)/2);
						if(!ele.dy) ele.dy = 415;

						temp = {
							dh:ele.dh+speed*ele.speed*10,
							dw:ele.dw+speed*ele.speed*0.6,
							dy:ele.dy+speed*ele.speed*10,
							dx:ele.dx-speed*ele.speed*0.3
						};
						//console.log(ele.img,ele.x,ele.y,ele.w,ele.h,ele.dx,ele.dy,ele.dw,ele.dh);
						break;
					case 4://ball
						if(ele.quick == 1){
							ele.x = 0;
						}else{
							ele.x = 280;
						}
						if(!ele.y) ele.y = 0;
						if(!ele.dx) ele.dx = 350;
						if(!ele.dy) ele.dy = 410;
						if(!ele.dw) ele.dw = ele.w/10;
						if(!ele.dh) ele.dh = ele.h/10;
					
						temp = {
							dw:ele.dw+speed*ele.speed*1.2,
							dh:ele.dh+speed*ele.speed*1.2,
							dy:ele.dy+speed*ele.speed,
							dx:ele.dx+speed*ele.speed*0.1
						};
						break;
					case 5:
						ele.x = 770;
						ele.y = 0;
						if(!ele.dh) ele.dh = ele.h/20;
						if(!ele.dw) ele.dw = ele.w/20;
						if(!ele.dx) ele.dx = 410;
						if(!ele.dy) ele.dy = 403;

						temp = {
							dh:ele.dh+speed*ele.speed,
							dw:ele.dw+speed*ele.speed,
							dx:ele.dx+speed*ele.speed*0.3,
							dy:ele.dy-speed*ele.speed*0.39
						};
						

						ele.flag = !0;
						
						break;
					case 6:
						ele.x = 0;
						ele.y = 0;
						if(!ele.dh) ele.dh = ele.h/0.98;
						if(!ele.dw) ele.dw = ele.w/0.98;
						if(!ele.dx) ele.dx = -10;
						if(!ele.dy) ele.dy = 750;
						if(isStart){
							temp = {
								dh:ele.dh+speed*8,
								dw:ele.dw+speed*15,
								dx:ele.dx-speed*8,
								dy:ele.dy+speed*20
							};
						}
						//console.log(ele.img,ele.x,ele.y,ele.w,ele.h,ele.dx,ele.dy,ele.dw,ele.dh);
						break;
					case 7:
						if(ele.quick == 1){
							ele.x = 0;
						}else{
							ele.x = 280;
						}
						if(!ele.y) ele.y = 0;
						if(!ele.dx) ele.dx = 315;
						if(!ele.dy) ele.dy = 410;
						if(!ele.dw) ele.dw = ele.w/10;
						if(!ele.dh) ele.dh = ele.h/10;

						temp = {
							dw:ele.dw+speed*ele.speed*1.2,
							dh:ele.dh+speed*ele.speed*1.2,
							dy:ele.dy+speed*ele.speed,
							dx:ele.dx-speed*ele.speed*0.5
						};
						break;
					default:
						break;
				}
				//console.log(objs);
				draw(ele.img,ele.x,ele.y,ele.w,ele.h,ele.dx,ele.dy,ele.dw,ele.dh,ele);

				if(temp.dw) ele.dw = temp.dw;
				if(temp.dh) ele.dh = temp.dh;
				if(temp.dx) ele.dx = temp.dx;
				if(temp.dy) ele.dy = temp.dy;
				ele.speed = ele.speed * 1.2;
			});

			fn();
			
			move.timer = setTimeout(arguments.callee,30);

		},30);
				
	}
	move.stop = function(){
		clearTimeout(move.timer);
	}
	function draw(img,x,y,w,h,dx,dy,dw,dh){
		context.drawImage(img,x,y,w,h,dx,dy,dw,dh);
	}
	function init(){
		car = new Car();
		document.querySelector('.turnL').addEventListener('tap',car.turnLeft.bind(car));
		document.querySelector('.turnR').addEventListener('tap',car.turnRight.bind(car));
		
		objs.unshift(car);
		square();
		Line({
			dw:10,dh:50,dy:510
		});

		Ball({track:2,quick:1});
		Ball({track:4,quick:1});
		Ball({track:7,quick:1});
		Mountain()
		Mountain({
			x:0,y:0,w:567/2,h:452/2,dx:-90,dy:430,dw:567/2.5,dh:452/2.5,track:1
		});
		Mountain({
			x:250,y:0,w:570/2,h:452/2,dx:500,dy:430,dw:570/2.5,dh:452/2.5,track:5
		});
		Tree();
		move(function(){
			distance = distance+speed*30;
		});
		gameStart();
		setTimeout(function(){
			move.stop();
		},500);
		setTimeout(function(){
			document.querySelector('.index').style.display = 'none';
			document.querySelector('.countDown').classList.add('down');
		},2000);
		
		setTimeout(function(){
			console.log(111);//��ʾ����ʱ
			document.querySelector('.countDown').style.display = 'none';
			document.querySelector('.countDown').classList.remove('down');
		},5000);
	}
	//��ҳ go
	document.querySelector('.start-go').addEventListener('tap',function(){
		document.querySelector('.countDown').style.display = 'block';
		document.querySelector('.loading-go').style.display = 'block';
		document.querySelector('.start-go').style.display = 'none';
		init();
		setTimeout(function(){
			countDown();
		},5100);
	});
	
	
	function gameStart(){
		if(!flag) return;
		flag = false;
		var y = 0;
		if(musicFlag){
			document.getElementById('firing').play();
			setTimeout(function(){
				document.getElementById('countDown').play();
			},2100);
			setTimeout(function(){
				//$('.start-title').css('display','none');
				document.getElementById('loop').play();
			},2500);
		}

		setTimeout(function(){
			document.querySelector('.sky-bg1').style.WebkitAnimation = 'opacity1 20s forwards';
			document.querySelector('.sky-bg1').style.animation = 'opacity1 20s forwards';
		},17000);
		
		setTimeout(function(){
			document.querySelector('.sky-bg1').style.display = 'none';
			document.querySelector('.sky-bg2').style.WebkitAnimation = 'opacity1 20s forwards';
			document.querySelector('.sky-bg2').style.animation = 'opacity1 20s forwards';

		},30000);

		var timer = setInterval(function(){
			y = y  - 266;
		},2500);
	
		setTimeout(function(){
			isStart = true;
			clearInterval(timer);
			document.getElementById('core').classList.add('core');
			rapid.style.WebkitTransform = 'rotate(0deg)';
			rapid.style.transform = 'rotate(0deg)';
	
			move(function(){
				distance = distance+speed*30;
				now++;
				if(now%5 == 0){
					Tree();
					Mountain();
				}
				if(now % 15 == 0){
					Line();
				}
				var ballPosition = [];
				
				setTimeout(function(){
					now2++;
					if(now2%18==0){
						Ball({type:true,track:2});
					}else if(now2%22==0){
						Ball({type:true,track:4});
					}
				},500);
			});
		},5100);
		document.querySelector('#core').addEventListener('animationend',function(){
			gameEnd();
			console.log('gameend');
		});
		document.querySelector('#core').addEventListener('webkitAnimationEnd',function(){
			gameEnd();
			console.log('gameend');
		});
	}
	function gameEnd(){
		document.querySelector('.loading-go').style.display = 'none';
		document.querySelector('.end-pop1').style.display = 'block';
		document.querySelector('.pop-box').style.display = 'none';
		document.querySelector('.layer').style.display = 'block';
		document.querySelector('.end-pop1 span b').innerHTML = parseInt(distance/570)+quick*5-slow*4;
		document.querySelector('input#dis').value = parseInt(distance/570)+quick*5-slow*4;

		rapid.style.WebkitTransform = 'rotate(-130deg)';
		rapid.style.transform = 'rotate(-130deg)';

		move.stop();
	}
	var musicOn = true;
	function loading(){
        var l = document.querySelector('.loading');
        if(!l) return;
        l.classList.remove('loading-visible');
        setTimeout(function(){
          l.style.display = 'block';
          l.classList.add('loading-visible');
        },0)
     }
	loading.dismiss = function(){
	    var l = document.querySelector('.loading');
	    if(!l) return;
	    l.classList.remove('loading-visible');
	    setTimeout(function(){
	      l.style.display = 'none';
	    },300)
	};
	window.onload = function (){
		loading.dismiss();
		document.querySelector('.start-go').style.display = 'block';
	}
	document.querySelector('.audio-icon').addEventListener('tap',function(){
		if(musicOn){
			document.getElementById('bgMu').pause();
			document.getElementById('quick').pause();
			document.getElementById('show').pause();
			document.getElementById('countDown').pause();
			document.getElementById('firing').pause();
			//document.getElementById('quickCar').pause();
			document.getElementById('loop').pause();
			document.querySelector('.audio-icon').classList.add('pase');
			musicFlag = false;
			musicOn = false;
		}else{
			document.getElementById('bgMu').play();
			document.getElementById('loop').play();
			document.querySelector('.audio-icon').classList.remove('pase');
			musicFlag = true;
			musicOn = true;
		}
		
	});
	
	
	
	var oInput = document.querySelector('.end-pop1 input');
	var epop1 = document.querySelector('.end-pop1');
	var epop2 = document.querySelector('.end-pop2');
	var epop3 = document.querySelector('.end-pop3');
	var epop4 = document.querySelector('.end-pop4');
	var epop2Ul = epop2.querySelector('ul');
	var epop4Ul = epop4.querySelector('ul');
	var session='';

	epop2.querySelector('.game').addEventListener('tap',function(){
		epop3.style.display = 'block';
	});
	document.querySelector('.end-pop4 .game').addEventListener('tap',function(){
		epop3.style.display = 'block';
	});
	epop3.querySelector('.close').addEventListener('tap',function(){
		epop3.style.display = 'none';
	});
	
	document.querySelector('#submit').addEventListener('tap',submitBtn);
	function submitBtn(){
		document.getElementById('core').classList.remove('core');
		v_tel = document.querySelector('#tel').value;

		if(!/^1(([38]\d)|(4[57])|(5[012356789])|(7[0678]))\d{8}$/.test(v_tel)){
			alert('\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u624b\u673a\u53f7');
		}else{
			getToken(add);
		}
	}
	
	document.querySelector('.next-list').addEventListener('tap',function(){
		document.getElementById('core').classList.remove('core');
		epop4.style.display = 'block';
		getList(epop4Ul);
	});

	function add(){
		var num = document.querySelector('input#dis').value;
		//console.log(v_tel,num,session);
		$.ajax({
			url:'http://m.zol.com.cn/topic/services/user2.php',
			data:{
				'username':'5952709',
				'type':'5952709',
				'action':'addUser',
				'tel':v_tel,
				'ext1':num,
				'token':session,
			},
			type:'post',
			dataType:'json',
			success:function(data){
				//console.log(data);
				if(data.result == 1){
					epop1.style.display = 'none';
					epop2.style.display = 'block';
					getList(epop2Ul);
				}
			}
		});
	}
	function getList(ul){
		$.ajax({
			url:'http://m.zol.com.cn/topic/services/user.php?action=getUserListForMaxScore', 
			data:{
				'type':'5952709',
				'limit':5,
			},
			type:'get',
			dataType:'jsonp',
			success:function(data){
				var result = data.result;
				result.forEach(function(e,i){
					var oLi = document.createElement('li');
					oLi.innerHTML = '<span class="name">'+e.tel+'</span><span class="dis">'+e.ext1+'km</span><span class="times">'+e.ctime+'</span>'
					ul.appendChild(oLi);
				});
			}
		});
	}
	//token
	function getToken(fn){
		$.ajax({
			url:'http://m.zol.com.cn/topic/services/session.php',
			data:{},
			type:'get',
			dataType:'jsonp',
			success:function(data){
				session = data.result;
				if(data && data.result){
					if(typeof fn === 'function'){
						fn(data);
					}
				}
			}
		})
	}	
	
	//countDown
	var countNum = 45;
	var countImg = document.querySelectorAll('.count-down img');
	
	function countDown(){
		setInterval(function(){
			countNum--;
			if(countNum<0) return;
			var countNumStr = ''+countNum
			for(var i=0;i<countImg.length;i++){
				if(countNum<10){
					countImg[0].src = 'http://2.zol-img.com.cn/zt/tm_57a/326ca0fec6/0.png';
					countImg[1].src = 'http://2.zol-img.com.cn/zt/tm_57a/326ca0fec6/'+countNum+'.png';
					
				}else{
					var str = countNumStr.charAt(i);
					countImg[i].src = 'http://2.zol-img.com.cn/zt/tm_57a/326ca0fec6/'+str+'.png';
				}
				
			}
		},1000);
	}
	document.querySelectorAll('.play-again').addEventListener('tap',palyAgain);
	
	//����һ��
	function palyAgain(){
		//window.location.reload();
		context.clearRect(0,0,canvas.width,canvas.height);
		document.querySelector('.index').style.display = 'block';
		document.querySelector('.loading-go').style.display = 'block';
		document.querySelector('.countDown').style.display = 'block';
		epop1.querySelector('.statistics .tortoise').innerHTML = '0';
		epop1.querySelector('.statistics .bolt').innerHTML = '0';
		console.log(document.querySelector('#dis').value);

		epop1.style.display = 'none';
		epop2.style.display = 'none';
		epop3.style.display = 'none';
		epop4.style.display = 'none';
		document.querySelector('.layer').style.display = 'none';
		speed = 1;
		distance = 0;
		objs = [];
		quick = 0;
		slow = 0;
		now = 0;
		now2 = 0;	
		carChange = 0;
		carIndex = 0;
		carFlag = 0;
		car = null;
		isStart = false;
		timerStop = null;
		timerStop1 = null;
		flag = true;
		backgroundIndex = 0;
		backgroundFlag = 0;
		endTime = null;
		playMu = null;
		popIndex = 0;
		musicFlag = true;
		document.querySelector('.sky-bg1').style = '';
		document.querySelector('.sky-bg2').style = '';
		
		init();

		setTimeout(function(){
			document.querySelector('.index').style.display = 'none';
			document.querySelector('.countDown').classList.add('down');
		},2100);
		setTimeout(function(){
			document.getElementById('core').classList.add('core');
			countNum = 46;
		},3800);
	};
	!(function(){
		document.querySelector('.index-rule-close').addEventListener('tap',function(){
			document.querySelector('#index-rule').style.display = 'none';
		});
	})();
	epop2.querySelector('#share1').addEventListener('click',function(){
		document.querySelector('.share-box').style.display = 'block';
	})
	epop4.querySelector('#share2').addEventListener('click',function(){
		document.querySelector('.share-box').style.display = 'block';
	});
	
	
	
	var timers = {};
	document.querySelector('.timer').style.color='rgba(255,255,255,0)';
	timers.timerDom = document.querySelectorAll('.timer span');
	
	timers.timeArr = [],timers.t = 0;
	function timerDown(){
		var ts = (new Date(2016, 8, 2, 0, 0, 0)) - (new Date());
		console.log(ts);
		if(ts < 0){
			console.log('\u5b8c\u4e86');
			clearInterval(timers.t);
			document.querySelector('#submit').removeEventListener('tap',submitBtn);
			document.querySelector('.end-pop1 input[type=text]').setAttribute('placeholder','\u6b64\u6b21\u6d3b\u52a8\u5df2\u7ed3\u675f\u007e');
			document.querySelector('.end-pop1 input[type=text]').setAttribute('disabled','true');
			return false;
		}
		//timers.t && clearInterval(timers.t);
		timers.timeArr[0] = checkTime(parseInt(ts / 1000 / 60 / 60 / 24, 10));
		timers.timeArr[1] = checkTime(parseInt(ts / 1000 / 60 / 60 % 24, 10));
		timers.timeArr[2] = checkTime(parseInt(ts / 1000 / 60 % 60, 10));
		timers.timeArr[3] = checkTime(parseInt(ts / 1000 % 60, 10));
		timers.timerDom && timers.timerDom.forEach(function (ele,i) {
			ele.innerText =  timers.timeArr[i];
		})
	}
	function checkTime(i){  
       i = (i < 10) ? "0" + i : i;              
       return i;  
    }  
    timerDown();
	timers.t  = setInterval(timerDown,1000);
})();

















