!(function(){

	var speed = 1,
		distance = 0,
		objs = [],
		canvas = document.getElementById('canvas'),
		context = canvas.getContext('2d'),
		flag = true,
		quick = 0,
		slow = 0;
		now = 0,
		now2 = 0;
		carChange = 0,
		carImages = ['images/car1.png','images/car2.png','images/car3.png'],
		carIndex = 0,//��������
		carFlag = 0,//���㱳���л�������
		car = new Car(),
		backgroundImages = ['images/bg1.png','images/bg2.png'],//����ͼ��
		backgroundIndex = 0,//��������
		backgroundFlag = 0,//���㱳���л�������
		isStart = false,
		timerStop = null,
		popQImages = ['images/pop1.png','images/pop2.png','images/pop3.png','images/pop4.png'],//�Ե����ٵ�������ߵ���
		popSImages = ['images/pop8.png'],
		endTime = null,
		playMu = null,
		popPositionX = ['207px','461px','723px','1000px','1005px'],//���һ��Ϊ�Ե��ڹ�ʱ��ʾλ��
		popPositionY = ['50%','75%'],
		popIndex = 0;
		
	//�������ֶ���ķ���
	function Car(){//��
		oImg = new Image();
		oImg.src = carImages[carIndex];
		this.img = oImg;
		this.w = 389;
		this.h = 303
		return this;
	}
	function Line(json){//��
		oImg = new Image();
		oImg.src = 'images/line.png';
		if(json){
			dw = json.dw;
			dh = json.dh;
			dy = json.dy;
			objs.unshift({img:oImg,dw:json.dw,dh:json.dh,dy:json.dy,track:3});
		}else{
			objs.unshift({img:oImg,dw:4,dh:6,track:3});
		}
	}
	
	function Ball(json){//��
		oImg = new Image();
		oImg.src = 'images/ball.png'
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
	function square(){//�׸�
		oImg = new Image();
		oImg.src = 'images/start.png';
		objs.unshift({img:oImg,w:812,h:268,track:6});
	}
	function Mountain(json){//ɽ
		oImg = new Image();
		oImg.src = 'images/mountain.png'
		//�켣
		var track = Math.random();
		if(track >= 0.5){
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
	function Tree(json){//��
		oImg = new Image();
		oImg.src = 'images/tree.png'
		//�켣
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
		//�� backgroundImages[backgroundIndex]
		!(function(){
			var background = new Image();
			background.src = backgroundImages[backgroundIndex];
			draw(background,0,0,canvas.width,canvas.height,0,0,canvas.width,canvas.height);

			backgroundFlag += 1;
			var bTime;
			if(speed > 1){//����
				bTime = 1;
			}else if(speed < 1){//����
				bTime = 6;
			}else{//����
				bTime = 4;
			}
			if(backgroundFlag % bTime == 0){
				backgroundIndex += 1;
				backgroundIndex = backgroundIndex > (backgroundImages.length - 1) ? 0 : backgroundIndex;
			}
			
		})();

		//�� carImages[carIndex]
		!(function(){
			carFlag += 1;
			var carSp;
			if(speed > 1){//����
				carSp = 1;
			}else if(speed < 1){//����
				carSp = 5;
			}else{//����
				carSp = 3;
			}
			if(carFlag % carSp == 0){
				carIndex += 1;
				carIndex = carIndex > (carImages.length - 1) ? 0 : carIndex;
			}
			var oImg = new Image();
			oImg.src = carImages[carIndex]
			car = new Car();

			objs[objs.length-1].img = oImg;
		})();			
		
	}
	//�˶�
	function move(fn){
		move.timer = setTimeout(function(){
			objs.forEach(function(ele,index){
				//��������ɾ��
				if(ele.dx >= canvas.width || ele.dx < -570 || ele.dy >= canvas.height){
					objs.splice(index,1)
				}
			});
			//���� or ����
			if(isStart){
				objs.forEach(function(ele,index){
					if(objs[index].dy >= 365 && objs[index].dy <= 380){
						if(objs[objs.length-1].iTack == 4 && objs[index].track == 4 || objs[objs.length-1].iTack == 2 && objs[index].track == 2 || objs[objs.length-1].iTack == 7 && objs[index].track == 7){
							console.log(objs[index].quick);
							
							if(objs[index].quick == 1){
								quick += 1;//������ٵ�����
								$('.bolt').html(quick);
								objs[index].y = 500;//�Ե����߼ӹ⡣
								speed = 2;
								$('.rapid span').css({
									'-webkit-transform': 'rotate(90deg)',
									'-moz-transform': 'rotate(90deg)',
									'-ms-transform': 'rotate(90deg)',
									'-o-transform': 'rotate(90deg)',
									'transform': 'rotate(90deg)'
								})

								if(timerStop) clearTimeout(timerStop);
								document.getElementById('quickCar').play();
								timerStop = setTimeout(function(){
									$('.rapid span').css({
										'-webkit-transform': 'rotate(0)',
										'-moz-transform': 'rotate(0)',
										'-ms-transform': 'rotate(0)',
										'-o-transform': 'rotate(0)',
										'transform': 'rotate(0)'
									})
									speed = 1;
									//$('#pop-img').hide().attr('src','');
									if(popIndex == 4){
										gameEnd();
										clearTimeout(endTime);
									}
								},9000);
								
								if(!objs[index].type){//����ǹ̶��ĵ���
									popIndex += 1;//����
									$('#pop-img').show().attr('src',popQImages[popIndex-1]);
									$('.pop-box').css({'left':popPositionX[popIndex-1],'top':popPositionY[0]}).fadeIn();
									setTimeout(function(){
										$('.pop-box').fadeOut();
									},5000);
								}
								
								//��������
								if(playMu) clearTimeout(playMu);
								setTimeout(function(){
									objs.splice(index,1);
								},10);

								document.getElementById('quick').play();
								playMu = setTimeout(function(){
									document.getElementById('quick').pause();
								},5000);
								setTimeout(function(){
									document.getElementById('bgMu').play();
								},2000);
							}else if(objs[index].quick == 2){
								objs[index].y = 500;
								slow += 1;
								$('.tortoise').html(slow);
								$('.rapid span').css({
									'-webkit-transform': 'rotate(-90deg)',
									'-moz-transform': 'rotate(-90deg)',
									'-ms-transform': 'rotate(-90deg)',
									'-o-transform': 'rotate(-90deg)',
									'transform': 'rotate(-90deg)'
								})
								if(timerStop) clearTimeout(timerStop);
								var timerStop = setTimeout(function(){
									$('.rapid span').css({
										'-webkit-transform': 'rotate(0)',
										'-moz-transform': 'rotate(0)',
										'-ms-transform': 'rotate(0)',
										'-o-transform': 'rotate(0)',
										'transform': 'rotate(0)'
									})
									speed = 1;
								},9000);
								
								if(!objs[index].type){
									$('#pop-img').show().attr('src',popSImages[0]);
									$('.pop-box').css({'left':popPositionX[popPositionX.length-1],'top':popPositionY[1]}).fadeIn();
									speed = 0.3;
									setTimeout(function(){
										$('.pop-box').fadeOut();
									},5000);
								}

								//��������
								setTimeout(function(){
									objs.splice(index,1);
								},10);

								document.getElementById('show').play();
								setTimeout(function(){
									document.getElementById('show').pause();
									document.getElementById('bgMu').play();
								},1000);
								
							}	
						}
					}
				});
			}
			//�������
			context.clearRect(0,0,canvas.width,canvas.height);
			if(isStart){
				backgroundMove();

			}
			objs.forEach(function(ele,index){
				!ele.speed && (ele.speed = 0.1);
				
				var temp={};//��һ����ʾλ��
				switch(ele.track){
					case 1:
						ele.x = 0;
						ele.y = 0;
						if(!ele.dh) ele.dh = ele.h/20;
						if(!ele.dw) ele.dw = ele.w/20;
						if(!ele.dx) ele.dx = 630;
						if(!ele.dy) ele.dy = 300;

						temp = {
							dh:ele.dh+speed*ele.speed,
							dw:ele.dw+speed*ele.speed,
							dx:ele.dx-speed*ele.speed*2,
							dy:ele.dy-speed*ele.speed*0.39,
						};
						break;
					case 2:
						if(ele.quick == 1){
							ele.x = 0;
						}else{
							ele.x = 300;
						}
						if(!ele.y) ele.y = 0;
						if(!ele.dx) ele.dx = 705;
						if(!ele.dy) ele.dy = 305;
						if(!ele.dw) ele.dw = ele.w/10;
						if(!ele.dh) ele.dh = ele.h/10;

						temp = {//������һ����ʾλ��
							dw:ele.dw+speed*ele.speed*5,
							dh:ele.dh+speed*ele.speed*5,
							dy:ele.dy+speed*ele.speed,
							dx:ele.dx-speed*ele.speed*5.5
						};
						break;
					case 3://line
						ele.x = 0;
						ele.y = 0;
						ele.w = 17;
						ele.h = 42;
						if(!ele.dx) ele.dx = parseInt((canvas.width-ele.dw)/2);
						if(!ele.dy) ele.dy = 316;

						temp = {//������һ����ʾλ��
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
							ele.x = 300;
						}
						if(!ele.y) ele.y = 0;
						if(!ele.dx) ele.dx = 720;
						if(!ele.dy) ele.dy = 305;
						if(!ele.dw) ele.dw = ele.w/10;
						if(!ele.dh) ele.dh = ele.h/10;

						temp = {//������һ����ʾλ��
							dw:ele.dw+speed*ele.speed*5,
							dh:ele.dh+speed*ele.speed*5,
							dy:ele.dy+speed*ele.speed,
							dx:ele.dx+speed*ele.speed*1
						};
						break;
					case 5:
						ele.x = 772;
						ele.y = 0;
						if(!ele.dh) ele.dh = ele.h/20;
						if(!ele.dw) ele.dw = ele.w/20;
						if(!ele.dx) ele.dx = 787;
						if(!ele.dy) ele.dy = 303;

						temp = {//������һ����ʾλ��
							dh:ele.dh+speed*ele.speed,
							dw:ele.dw+speed*ele.speed,
							dx:ele.dx+speed*ele.speed,
							dy:ele.dy-speed*ele.speed*0.39
						};
						break;
					case 6:
						ele.x = 0;
						ele.y = 0;
						if(!ele.dh) ele.dh = ele.h/0.98;
						if(!ele.dw) ele.dw = ele.w/0.98;
						if(!ele.dx) ele.dx = 300;
						if(!ele.dy) ele.dy = 480;
						if(isStart){
							temp = {//������һ����ʾλ��
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
							ele.x = 300;
						}
						if(!ele.y) ele.y = 0;
						if(!ele.dx) ele.dx = 712;
						if(!ele.dy) ele.dy = 305;
						if(!ele.dw) ele.dw = ele.w/10;
						if(!ele.dh) ele.dh = ele.h/10;

						temp = {//������һ����ʾλ��
							dw:ele.dw+speed*ele.speed*5,
							dh:ele.dh+speed*ele.speed*5,
							dy:ele.dy+speed*ele.speed,
							dx:ele.dx-speed*ele.speed*2
						};
						break;
					default:
						break;
				}
				draw(ele.img,ele.x,ele.y,ele.w,ele.h,ele.dx,ele.dy,ele.dw,ele.dh);

				//��һ��λ��
				if(temp.dw) ele.dw = temp.dw;
				if(temp.dh) ele.dh = temp.dh;
				if(temp.dx) ele.dx = temp.dx;
				if(temp.dy) ele.dy = temp.dy;
				ele.speed = ele.speed * 1.2;
			});
			
			//console.log(objs);
			//�ص��������
			fn();
			
			move.timer = setTimeout(arguments.callee,30);

		},30);
				
	}
	//�˶�ֹͣ
	move.stop = function(){
		clearTimeout(move.timer);
	}
	//��
	function draw(src,x,y,w,h,dx,dy,dw,dh){
		context.drawImage(src,x,y,w,h,dx,dy,dw,dh);
	}
	function init(){
		objs.unshift({img:car.img,x:0,y:0,w:car.w,h:car.h,dx:(canvas.width-car.w)/2,dy:468,dw:car.w,dh:car.h,iTack:7});
		square()
		Line({
			dw:10,dh:50,dy:510
		});
		setInterval(function(){//����
			Line();
		},400);
		Ball({track:2,quick:1});
		Ball({track:4,quick:1});
		Ball({track:7,quick:1});
		Mountain({
			x:0,y:0,w:567/2,h:452/2,dx:220,dy:200,dw:567/2,dh:452/2,track:1
		});
		Mountain({
			x:250,y:0,w:570/2,h:452/2,dx:920,dy:200,dw:570/2,dh:452/2,track:5
		});
		Tree();
		move(function(){
			distance = distance+speed*30;
			document.onkeydown = function(ev){
				if(ev.keyCode == 13){
					gameStart();
				}
			}
			$('#again').click(function(){
				gameStart();
			});
		});
	}
	init();
	setTimeout(function(){
		move.stop();
	},500);
	
	$('.backIndex').click(function(){
		window.location.reload();
	});
	$('.back_index').click(function(){
		window.location.reload();
	});
	
function gameStart(){
	if(!flag) return;
	flag = false;
	var y = 0;
	document.getElementById('firing').play();
	setTimeout(function(){//����ʱ
		document.getElementById('countDown').play();
	},2100);
	
	setTimeout(function(){//����1
		$('.sky-bg1').css({
				'-webkit-animation':'opacity1 20s forwards',
				'-moz-animation':'opacity1 20s forwards',
				'animation':'opacity1 20s forwards'
			});
	},17000);
	
	setTimeout(function(){//����1
		$('.sky-bg1').hide();
		$('.sky-bg2').css({
				'-webkit-animation':'opacity1 25s forwards',
				'-moz-animation':'opacity1 25s forwards',
				'animation':'opacity1 25s forwards'
			});
	},30000);

	setTimeout(function(){
		$('.start-title').css('display','none');
		document.getElementById('loop').play();
	},2500);
	var timer = setInterval(function(){
		y = y  - 266;
		$('#again').addClass('again');

	},2500);

	setTimeout(function(){
		isStart = true;
		clearInterval(timer);
		$('#core').addClass('core');
		$('.rapid span').css({
			'-webkit-transform': 'rotate(0deg)',
			'-moz-transform': 'rotate(0deg)',
			'-ms-transform': 'rotate(0deg)',
			'-o-transform': 'rotate(0deg)',
			'transform': 'rotate(0deg)'
		});

		move(function(){
			distance = distance+speed*30;
			document.onkeydown = function(ev){
				if(ev.keyCode == 39){
					objs[objs.length-1].dx += 220;
					
					if(objs[objs.length-1].dx>=745.5){
						objs[objs.length-1].dx = 745.5;
						objs[objs.length-1].iTack = 4;
					}else{
						objs[objs.length-1].iTack = 7;
					}
				}
				if(ev.keyCode == 37){
					objs[objs.length-1].dx -= 220;
					
					if(objs[objs.length-1].dx<=305.5){
						objs[objs.length-1].dx = 305.5;
						objs[objs.length-1].iTack = 2;
					}else{
						objs[objs.length-1].iTack = 7;
					}
				}
			}
			
			now++;
			if(now%5 == 0){
				Tree();
				Mountain();
			}
			var ballPosition = [];
			
			setTimeout(function(){
				now2++;
				if(now2%300 == 0){
					if(now2 == 900){
						Ball({track:2,quick:2});
						Ball({track:4,quick:2});
						Ball({track:7,quick:2});
					}else{
						Ball({track:2,quick:1});
						Ball({track:4,quick:1});
						Ball({track:7,quick:1});
					}
				}else if(now2%100==0){
					Ball({type:true});
				}
			},3000);
		});
	},5000);
	endTime = setTimeout(gameEnd,51000);

}
function gameEnd(){
	//console.log(distance/570);//��·��
	$('.rapid span').css({
		'-webkit-transform': 'rotate(-130deg)',
		'-moz-transform': 'rotate(-130deg)',
		'-ms-transform': 'rotate(-130deg)',
		'-o-transform': 'rotate(-130deg)',
		'transform': 'rotate(-130deg)'
	});
	$('.result span').html(parseInt(distance/570));
	$('.wrapper').animate({opacity:1},300);
	$('.detail-list .li1 span').html(quick);
	$('.detail-list .li2 span').html(5*quick+'%');
	$('.detail-list .li3 span').html(slow);
	$('.detail-list .li4 span').html(5*slow+'%');
	move.stop();
}

})()














