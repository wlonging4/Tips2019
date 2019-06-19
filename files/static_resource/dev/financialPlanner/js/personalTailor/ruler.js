;
(function (window) {
	//标尺的构造函数
	var Ruler = function (id, paraObj) {
		var that = this;
		this.clientWidth = document.body.clientWidth;
		this.maxNum = paraObj.maxNum || 300.0; //最大数值
		this.minNum = paraObj.minNum || 30.0; //最小数字
		this.cellNum = paraObj.cellNum || 10; //一个大刻度的数值区间
		this.totalNum = paraObj.totalNum;
		this.minNum = parseInt(this.minNum / this.cellNum) * this.cellNum;
		this.record = [];
		this.oldMax = paraObj.maxNum;
		this.oldMin = paraObj.minNum;
		if ((this.maxNum - this.minNum) % this.cellNum != 0) {
			this.maxNum = this.minNum + this.cellNum * parseInt((this.maxNum - this.minNum) / this.cellNum + 1);
		}
		this.name = paraObj.name;
		this.rateName = paraObj.rateName;
		this.unit = paraObj.unit;
		this.initNum = paraObj.initNum;
		this.nowData = this.initNum || this.minNum || 30.0;
		this.decimalWei = paraObj.decimalWei;
		this.callback = paraObj.callback;
		this.callBackStart=paraObj.callBackStart;
		this.scaleWidth=parseInt(paraObj.scaleWidth) || 100;
		this.scaleWidthDouble=this.scaleWidth/2;
		//做出标尺的html结构
		this.rulerStructure(id); //传入id值
		
		this.drawBgWhite();  //兼容 背景白色
		//画出标尺的静态
		this.drawRuler();
		//添加滑动标尺功能
		this.moveRuler();
		//添加标尺的加减功能
		// return this;
	}

	//构建html结构
	Ruler.prototype.rulerStructure = function (id) {
		//父节点部分 传入的id
		var parentNode = document.getElementById(id);
		var parentNodeStyle = {
			//"overflow": "hidden",
			"position": "relative"
		};
		this.addStyle(parentNode, parentNodeStyle); //给根元素添加样式

		//标题部分
		var titleNode = document.createElement("div");
		titleNode.setAttribute("class", "ruler-title");
		titleStyle = {
			"width": "100%",
			"height": "35%",
			"position": "relative",
			"overflow": "hidden",
			"top":"-10px"
			//"opacity":0
		};
		this.addStyle(titleNode, titleStyle);

		//标题中的参数
		var parameterNode = document.createElement("div");
		parameterNode.setAttribute("class", "ruler-parameter");
		parameterStyle = {
			"width": "215px",
			"text-align": "center",
			"box-sizing": "border-box",
			"margin": "0 auto",
			"margin-top": "30px"
		}
		this.addStyle(parameterNode, parameterStyle);
		//标题中间的文字和+ -
		parameterNode.innerHTML = "<div id='ruler-num' style='font: bold 0.8rem/50px 微软雅黑; color:#C4A06C; display:inline-block'>30.0</div><div style='font: bold 0.35rem/50px 微软雅黑; color:#999999; display:inline-block;width:0;white-space: pre;'>&nbsp;%</div>";					  
		//声明结果对象
		this.numNode = parameterNode.firstChild;
		//设定标尺的初始数值
		parameterNode.firstChild.innerHTML = this.initNum || this.minNum;
		//打包标题节点
		titleNode.appendChild(parameterNode);
		parentNode.appendChild(titleNode);

		//标尺的包裹部分
		var containNode = document.createElement("div");
		containNode.setAttribute("class", "ruler-contain");
		containStyle = {
			"width": "100%",
			"height": "40%",
			"position": "absolute",
			"top": "35%",
			"left": "0%",
			"overflow": "hidden"
		}
		this.addStyle(containNode, containStyle);
		containNode.innerHTML = "<div class='ruler' id='ruler' style='left: 0; height: 100%; position: absolute; top: 0; left: 0;'><canvas id='rulerCanvas'></canvas></div>";
		//设定标尺的初始位置
		containNode.firstChild.style.left = -(this.initNum - this.minNum) / this.cellNum * parseInt(this.scaleWidthDouble) + "px";
		//声明标尺的canvase对象
		containNode.firstChild.firstChild.width = (Math.ceil((this.maxNum - this.minNum) / this.cellNum) * parseInt(this.scaleWidthDouble) + this.clientWidth * 1)*2;
		containNode.firstChild.firstChild.height = "160";
		this.canvasObj=containNode.firstChild.firstChild;
		this.Canvas = containNode.firstChild.firstChild.getContext("2d");
		//声明尺子的包裹对象 
		this.rulerNode = containNode.firstChild;
		parentNode.appendChild(containNode);

		//标尺的指针部分
		var pinNode = document.createElement("div");
		pinNode.setAttribute("class", "ruler-img");
		pinStyle = {
			"margin": "0 auto",
			"width": "4px",
			"height": "60px",
			"position": "relative",
			"z-index": "9"
		}
		this.addStyle(pinNode, pinStyle);
		pinNode.innerHTML = "<canvas id='pinPic' width='4' height='60'></canvas>";
		this.drawPin(pinNode.firstChild);
		parentNode.appendChild(pinNode);

		//推荐服务费数值
		var valueNode = document.createElement("div");
		this.valueNode = valueNode;
		valueNode.setAttribute("class", "value-node");
		valueNode.innerHTML=this.initNum || this.minNum;
		var valueStyle = {
			"font-size":"26px",
			"color":"#333",
			"position": "absolute",
			"left": "-59%",
			"top": "40%",
			"font-weight":"bold",
			"display":"none"
		}
		this.addStyle(valueNode, valueStyle);
		parentNode.appendChild(valueNode);
		//推荐服务费标题
		var titleNode2 = document.createElement("div");
		titleNode2.setAttribute("class", "title-node2");
		titleNode2.innerHTML=this.name+"  ("+ this.oldMin + this.unit + "~" + this.oldMax + this.unit + ")";
		var titleStyle2 = {
			"font-size":"0.35rem",
			"color":"#999",
			"position": "absolute",
			"left": "50%",
			"top": "0",
			"transform": "translateX(-50%)",
  			"-webkit-transform": "translateX(-50%)",
  			"white-space": "pre"
		}
		this.addStyle(titleNode2, titleStyle2);
		parentNode.appendChild(titleNode2);

		//参考年回报率数值
		var rateNode = document.createElement("div");
		this.rateNode = rateNode;
		rateNode.setAttribute("class", "value-node value-nodeHtml");
		rateNode.innerHTML=(this.totalNum - (this.initNum || this.minNum)).toFixed(2);
		var rateStyle = {
			"font-size":"0.4rem",
			"color":"#C4A06C",
			"display":"inline-block"
			/*"position": "absolute",
			"left": "70%",
			"top": "75%",
			"font-weight":"bold",
			"transform": "translateX(-50%)",
  			"-webkit-transform": "translateX(-50%)",
  			"white-space": "pre"*/
		}
		this.addStyle(rateNode, rateStyle);
		/*this.rateNode=parentNode.appendChild(rateNode);*/
		this.rateNode=document.createElement("div");
		this.rateNode.appendChild(rateNode);
		
		//参考年回报率标题
		var rateTitleNode = document.createElement("div");
		rateTitleNode.setAttribute("class", "title-node2");
		rateTitleNode.innerHTML=this.rateName+"  "+this.rateNode.innerHTML+"  "+ this.unit+"";
		
		var rateTitleStyle = {
			"font-size":"0.35rem",
			"color":"#333333",
			"position": "absolute",
			"left": "50%",
			"bottom": "10px",
			"transform": "translateX(-50%)",
  			"-webkit-transform": "translateX(-50%)",
  			"white-space": "pre"
		}
		this.addStyle(rateTitleNode, rateTitleStyle);
		parentNode.appendChild(rateTitleNode);
		
		this.rateNode=document.querySelector(".value-nodeHtml");
	}
	//添加样式属性
	Ruler.prototype.addStyle = function (obj, style) {
		for (var i in style) {
			obj.style[i] = style[i];
		};
	}

	//画指示针
	Ruler.prototype.drawPin = function (obj) {
		var pinCanvas = obj.getContext("2d");
		//画三角形
		pinCanvas.beginPath();
		pinCanvas.moveTo(3 - 0.5, 10);
		pinCanvas.lineTo(3 - 0.5, 60);
		pinCanvas.strokeStyle = "#C4A06C"; //中间标线颜色
		pinCanvas.lineWidth = 3;
		pinCanvas.stroke();
		pinCanvas.closePath();
	}
	
	//画背景白色 兼容
	
	Ruler.prototype.drawBgWhite = function (obj) {
		var that=this;
		that.Canvas.beginPath();
		that.Canvas.fillStyle="#FFFFFF";	
		that.Canvas.fillRect(0,0,that.canvasObj.width,that.canvasObj.height);
		
		
		that.Canvas.closePath();
	}
	
	
	//将标尺画出来
	Ruler.prototype.drawRuler = function () {
		var that = this;
		//画整数的刻度
		(function () {
			for (var i = 0; i <= Math.ceil((that.maxNum - that.minNum) / (that.cellNum / 2)); i++) {
				scale(i);

			}
			function scale(i) {
				that.Canvas.beginPath(); //起始一条路径，或重置当前路径
			
				that.Canvas.moveTo(that.clientWidth * 1 / 2 + parseInt(that.scaleWidth)/2 * i - 0.5, 80); //把路径移动到画布中的指定点，不创建线条
				that.Canvas.lineTo(that.clientWidth * 1 / 2 + parseInt(that.scaleWidth)/2 * i - 0.5, 120);// 40
				that.Canvas.strokeStyle = "#cccccc";
				that.Canvas.stroke(); //绘制已定义的路径
				that.Canvas.closePath(); //创建从当前点回到起始点的路径
				that.Canvas.font = "26px Arial";
				that.Canvas.fillStyle = "#cccccc";
				//绘制标签下面的数字
				/*console.log(i)*/
				/*if (i <= ((that.maxNum - that.minNum) / that.cellNum)) {
					console.log(i);*/
					that.Canvas.fillText(that.decimal(Math.floor(that.minNum)+i* 0.5 , that.decimalWei), that.clientWidth * 1 / 2 + parseInt(that.scaleWidth)/2 * i - 16, 70);
				/*}*/
			}
		})();


		//画小数的刻度
		(function () {
			for (var j = 0; j <= Math.ceil((that.maxNum - that.minNum) / that.cellNum) * 100 / 10; j++) {
				if (j % 5 != 0) {
					scale(j);
				}
			}

			function scale(j) {
				that.Canvas.beginPath();
				that.Canvas.moveTo(that.clientWidth * 1 / 2 + (parseInt(that.scaleWidth)/10) * j - 0.5, 100);
				that.Canvas.lineTo(that.clientWidth * 1 / 2 + (parseInt(that.scaleWidth)/10) * j - 0.5, 120); //20
			/*	console.log(j+":"+that.clientWidth * 1 / 2 + (parseInt(that.scaleWidth)/10) * j);*/
				that.Canvas.strokeStyle = "#cccccc";
				that.Canvas.stroke();
				that.Canvas.closePath();
				
				/*that.Canvas.font = "13px Arial";
				that.Canvas.strokeStyle = "#ccc";*/
				that.Canvas.font = "26px Arial";
				that.Canvas.strokeStyle = "#cccccc";
				that.Canvas.fillStyle = "#ccccccc";
				//绘制标签下面的数字
				
				//绘制小数数字
				
					
				that.Canvas.fillText(that.decimal( Math.floor(that.minNum)+j/10, that.decimalWei ), that.clientWidth * 1 / 2 + (parseInt(that.scaleWidth)/10) * j - 16,70);
				
				
			}
		})();
		
		
		//画装饰直线
		(function () {
			var j=Math.ceil((that.maxNum - that.minNum) / that.cellNum) * 100 / 10;
			that.Canvas.beginPath();
			that.Canvas.moveTo(that.clientWidth * 1 / 2-0.5, 120);
			that.Canvas.lineTo(that.clientWidth * 1 / 2 + (parseInt(that.scaleWidth)/10) * j - 0.5,120); //20
		
			that.Canvas.strokeStyle = "#dddddd";
			that.Canvas.stroke();
			that.Canvas.closePath();
		})();
	}
	//返回当前值
	Ruler.prototype.getNowData=function(){
		return this.nowData
	}
	
	Ruler.prototype.getTotalNum=function(){
		return this.totalNum/*.toFixed(this.decimalWei)*/;
	}
	/*Ruler.prototype.getRateNodeNum=function(){
		return (this.totalNum-this.nowData).toFixed();
	}*/

	//控制标尺的滑动
	Ruler.prototype.moveRuler = function () {
		var that = this;
		//标尺绑定touchstart事件
		this.rulerNode.addEventListener("touchstart", rulerStart, false);
		function rulerStart(e) {
			that.callBackStart();
			var e = e || window.event;
			e.preventDefault();
			clearInterval(that.timer);
			clearInterval(that.partTime);
			that.record = [];
			var startX = e.targetTouches[0].clientX;
			var startY = e.targetTouches[0].clientY;
			//标尺绑定touchmove事件
			that.rulerNode.addEventListener("touchmove", rulerMove, false);
			var moveNum = parseInt(that.rulerNode.style.left);
			var n = 0;

			function rulerMove(e) {
				var e = e || window.event;
				var moveX = e.targetTouches[0].clientX;
				var moveY = e.targetTouches[0].clientY;
				var transX = moveX - startX;
				var transY = moveY - startY;
				isScrolling = Math.abs(transX) < Math.abs(transY) ? 1 : 0; //isScrolling为1时，表示纵向滑动，0为横向滑动
				if (isScrolling == 1) {
					e.preventDefault();
				} else {
					var leftNum = -Math.round(moveNum + transX) / ( parseInt(that.scaleWidthDouble)/ that.cellNum) + that.minNum;
					var moveDis = moveNum + transX;
					if (moveDis >= 0) {
						moveDis = 0;
						leftNum = that.minNum;
					} else if (moveDis <= -(Math.ceil((that.maxNum - that.minNum) / that.cellNum) * parseInt(that.scaleWidthDouble))) {
						moveDis = -(Math.ceil((that.maxNum - that.minNum) / that.cellNum) * parseInt(that.scaleWidthDouble));
						leftNum = that.maxNum;
					}
					that.nowData = that.decimal(leftNum, that.decimalWei);
					that.numNode.innerHTML = that.nowData; 
					that.valueNode.innerHTML = that.nowData; 
					that.rateNode.innerHTML = parseFloat(that.totalNum - that.nowData).toFixed(2);
					that.rulerNode.style.left = moveDis + "px";
					n++;
					var moveTime = new Date().getTime();
					that.record[n] = [];
					that.record[n].push(moveTime);
					that.record[n].push(moveDis);
				}
			}
			//标尺绑定touchend事件
			that.rulerNode.addEventListener("touchend", rulerEnd, false);

			function rulerEnd(e) {
				var e = e || window.event;
				that.rulerNode.removeEventListener("touchmove", rulerMove);
				that.rulerNode.removeEventListener("touchend", rulerEnd);
				if (that.record.length > 4) {
					var speed = (that.record[that.record.length - 1][1] - that.record[that.record.length - 4][1]) / (that.record[that.record.length - 1][0] - that.record[that.record.length - 4][0]) * parseInt(that.scaleWidthDouble)*10;/*1000*/
					clearInterval(that.timer);
					that.timer = setInterval(function () {
						if (Math.abs(speed) > that.scaleWidthDouble) {
							speed = speed > 0 ? speed - (that.scaleWidthDouble/3) : speed + (that.scaleWidthDouble/3);
							var speedX = parseInt(that.rulerNode.style.left) + (speed / (parseInt(that.scaleWidthDouble)/2));
							if (speedX >= 0) {
								speedX = 0;
							} else if (speedX <= -(Math.ceil((that.maxNum - that.minNum) / that.cellNum) * parseInt(that.scaleWidthDouble))) {
								speedX = -(Math.ceil((that.maxNum - that.minNum) / that.cellNum) * parseInt(that.scaleWidthDouble));
							}
							that.rulerNode.style.left = speedX + "px";
							var speedNum = -Math.round(speedX) / (parseInt(that.scaleWidthDouble) / that.cellNum) + that.minNum;
							that.nowData = that.decimal(speedNum, that.decimalWei);
							that.numNode.innerHTML = that.nowData;
							that.valueNode.innerHTML = that.nowData; 
							that.rateNode.innerHTML = (that.totalNum - that.nowData).toFixed(2);
						} else {
							clearInterval(that.timer);
							var numM = parseFloat(that.rulerNode.style.left);
							var numStep = parseInt(numM / (parseInt(that.scaleWidthDouble)/10));
							if (numM - numStep * (parseInt(that.scaleWidthDouble)/10) > -5) {
								that.movePart(numM, numStep * (parseInt(that.scaleWidthDouble)/10), (parseInt(that.scaleWidthDouble)/10), that.rulerNode, "left");
							} else {
								that.movePart(numM, (numStep - 1) * (parseInt(that.scaleWidthDouble)/10), (parseInt(that.scaleWidthDouble)/10), that.rulerNode, "left");
							}
						}
					}, 10);
				} else {
					var numM = parseFloat(that.rulerNode.style.left);
					var numStep = parseInt(numM / (parseInt(that.scaleWidthDouble)/10));
					if (numM - numStep * (parseInt(that.scaleWidthDouble)/10) > -5) {
						that.movePart(numM, numStep * (parseInt(that.scaleWidthDouble)/10), (parseInt(that.scaleWidthDouble)/10), that.rulerNode, "left");
					} else {						
						that.movePart(numM, (numStep - 1) * (parseInt(that.scaleWidthDouble)/10), (parseInt(that.scaleWidthDouble)/10), that.rulerNode, "left");
					}
					/*回调*/
					var fn = that.callback;
					if (typeof fn === 'function') {
						fn(that.nowData);
					}
				}
				var fn = that.callback;
				setTimeout(function(){
					fn(that.nowData);
				},500)
			}
			
		}
	}
	//滑动停止后的局部滑动
	Ruler.prototype.movePart = function (start, end, stepNum, obj, attr, fn) {
		var that = this;
		// console.log(start,end)
		//阻止滑动超过最大值和最小值
		var maxEnd = -parseInt(that.scaleWidthDouble)*(that.oldMax - that.minNum)/that.cellNum,minEnd = -parseInt(that.scaleWidthDouble)*(that.oldMin - that.minNum)/that.cellNum;
		var end = end<maxEnd?maxEnd:end;
		end = end>minEnd?minEnd:end;
		var fn = that.callback;
		clearInterval(this.partTime);
		if (end != start) {
			var step = (end - start) / stepNum;
			this.partTime = setInterval(function () {
				start += step;
				if (start <= end && step < 0) {
					clearInterval(that.partTime);
					start = end;
					if (typeof fn === 'function') {
						fn(that.nowData);
					}
				} else if (start >= end && step > 0) {
					clearInterval(that.partTime);
					start = end;
					if (typeof fn === 'function') {
						fn(that.nowData);
					}
				}
				obj.style[attr] = start + "px";
				var leftNum = -Math.round(start) / (parseInt(that.scaleWidthDouble) / that.cellNum) + that.minNum;
				that.nowData = that.decimal(leftNum, that.decimalWei);
				that.numNode.innerHTML = that.nowData;
				that.valueNode.innerHTML = that.nowData; 
				that.rateNode.innerHTML = (that.totalNum - that.nowData).toFixed(2);
			}, 20)
		}
	}
	//对小数位数的控制
	Ruler.prototype.decimal = function (num, decimalNum) {
		var xsd = num.toString().split(".");
		if (decimalNum == 1) {
			if (xsd.length == 1) {
				num = num.toString() + ".0";
				return num;
			}
			if (xsd.length > 1) {
				if (xsd[1].substring(0, decimalNum) == "0") {
					num = Math.round(num).toString() + ".0";
					return num;
				} else {
					num = Math.round(num * 10) / 10;
					var xsd0 = num.toString().split(".");
					if (xsd0.length == 1) {
						num = num + ".0";
					}
					return num;
				}
			}
		} else if (decimalNum == 2) {
			if (xsd.length == 1) {
				num = num.toString() + ".00";
				return num;
			}
			if (xsd.length > 1) {
				if (xsd[1].substring(0, decimalNum) == "0") {
					num = Math.round(num).toString() + ".00";
					return num;
				} else {
					num = Math.round(num * parseInt(that.scaleWidthDouble)) / parseInt(that.scaleWidthDouble);
					var xsd0 = num.toString().split(".");
					if (xsd0.length == 1) {
						num = num + ".00";
					}
					return num;
				}
			}
		} else {
			return Math.round(num);
		}
	};
	if (typeof module === "object" && module && typeof module.exports === "object") {
		module.exports = Ruler;
	}
	window.Ruler = Ruler;
})(window);