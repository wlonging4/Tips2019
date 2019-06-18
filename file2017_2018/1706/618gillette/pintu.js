/**
 * Created by Moker on 2017/6/15.
 */
!(function (w) {
    var Pintu = function (opt) {
        var _this = this;
        !opt && (opt = {});
        _this.opt = {};
        for (var ele in _this.options) {
            _this.opt[ele] = opt[ele] || _this.options[ele];
        }
        _this.init();
    };
    Pintu.prototype = {
        init: function () {
            var _this = this,
                num = _this.opt.num,
                img = new Image(),
                container = _this.opt.container,
                canvas = _this.canvas = _makeCanvas(container),
                context = _this.context = canvas.getContext('2d'),
                w = canvas.width = _this.opt.width,
                h = canvas.height = _this.opt.height,
                r = Math.sqrt(num),
                width = w / r,
                height = h / r,
                start;

            img.src = _this.opt.src;
            _this._defineStaticProperty('img', img);

            canvas.style.pointerEvents = 'all';
            img.addEventListener('load', function () {
                var splitData = _this._splitImg()//打乱 数组 [2301];
                var relResult = _this._init_draw({//正确的对象
                    game: _this,
                    splitData: splitData
                });

                _this._splitData = splitData;

                var flag = false;

                canvas.addEventListener('tap', function (e) {
                    var x = parseInt(e.pageX - _this.opt.oLeft);
                    var y = parseInt(e.pageY - _this.opt.oTop);
                    var row = Math.floor(y / height);//行
                    var col = Math.floor(x / width);//列
                    if (!flag) {
                        flag = true;
                        start = row * r + col;
                        context.strokeStyle = _this.opt.stroke;
                        context.lineWidth = _this.opt.lineWidth;
                        context.strokeRect(relResult['part_' + start][0] + (_this.opt.lineWidth - 1), relResult['part_' + start][1] + (_this.opt.lineWidth - 1), Math.ceil(width) - (_this.opt.lineWidth * 2 - 2), Math.ceil(height) - (_this.opt.lineWidth * 2 - 2));
                        context.stroke();
                    } else {
                        end = row * r + col;
                        //换队形
                        temp = _this._splitData[end];
                        _this._splitData[end] = _this._splitData[start]
                        _this._splitData[start] = temp;
                        _this.move({
                            index: start,
                            target_index: end
                        });
                        flag = false;
                    }

                });
            });

        },
        _splitImg: function () {
            var _this = this,
                num = _this.opt.num,
                data = [],
                r = Math.sqrt(num),
                w = _this.opt.width,
                h = _this.opt.height,
                width = w / r,
                height = h / r,
                splitData,
                index = 0,
                relResult = {};


            _this._defineStaticProperty('img_item_w', width);
            _this._defineStaticProperty('img_item_h', height);
            _this._defineStaticProperty('canvas_item_w', width);
            _this._defineStaticProperty('canvas_item_h', height);

            for (var i = 0; i < r; i++) {//列
                for (var j = 0; j < r; j++) {//行
                    relResult['part_' + index] = [j * width, i * height, width, height];
                    data.push(index);
                    index++;
                }
            }
            _this._defineStaticProperty('relResult', relResult);

            if (_this.opt.testData) {
                return _this.opt.testData
            }
            splitData = data.sort(function () { return 0.5 - Math.random() });
            splitData = splitData.reverse();
            splitData = splitData.sort(function () { return 0.5 - Math.random() });
            var y = _this.computeResult(splitData);
            y && (splitData = _this._splitImg());
            return splitData;
        },
        _defineStaticProperty: function (name, property, obj_str) {
            var _this = this;
            if (obj_str) {
                if (_this[obj_str][name]) return;
            } else {
                if (_this[name]) return;
            }
            Object.defineProperty(_this[obj_str] || _this, name, {
                value: property,
                writable: false,
                enumerable: false,
                configurable: false
            });
        },
        _draw: function (obj) {
            var _this = this;

            _this.context.drawImage(
                _this.img,
                obj[0],
                obj[1],
                _this.img_item_w,
                _this.img_item_h,
                obj[2] + _this.opt.imgMargin,
                obj[3] + _this.opt.imgMargin,
                _this.canvas_item_w - _this.opt.imgMargin * 2,
                _this.canvas_item_h - _this.opt.imgMargin * 2
            );

            _this.context.restore();
        },
        _init_draw: function (obj) {

            var _this = this,
                splitData = obj.splitData,
                num = _this.opt.num,
                r = Math.sqrt(num),
                w = parseInt(window.getComputedStyle(_this.canvas)['width']),
                h = parseInt(window.getComputedStyle(_this.canvas)['height']),
                itemW = w / r,
                itemH = h / r,
                a = 0,
                nowResult = [];

            _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            for (var i = 0; i < r ; i++) {
                for (var j = 0; j < r ; j++) {

                    nowResult.push([
                        _this.relResult['part_' + splitData[a]][0],
                        _this.relResult['part_' + splitData[a]][1],
                        itemW * j,
                        itemH * i
                    ]);
                    _this._draw(nowResult[a]);
                    a++
                }
            }
            _this._nowResult = nowResult;

            return _this.relResult;
        },
        move: function (obj) {
            var _this = this,
                w = _this._nowResult[obj.target_index][2] - _this._nowResult[obj.index][2],
                h = _this._nowResult[obj.target_index][3] - _this._nowResult[obj.index][3],
                step_time = 30,
                all_time = _this.opt.switchTime,
                step_w = w / (all_time / step_time),
                step_h = h / (all_time / step_time);

            _this.canvas.style.pointerEvents = 'none';

            var _timer = setInterval(function () {
                w = (Math.abs(w) - Math.abs(step_w) <= 0) ? 0 : w - step_w;
                h = (Math.abs(h) - Math.abs(step_h) <= 0) ? 0 : h - step_h;

                _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);

                _this._nowResult.forEach(function (ele, i) {

                    var img_x = _this.relResult['part_' + _this._splitData[i]][0],
                        img_y = _this.relResult['part_' + _this._splitData[i]][1],
                        canvas_x = _this._nowResult[i][2],
                        canvas_y = _this._nowResult[i][3];

                    if (i == obj.index) {
                        img_x = _this.relResult['part_' + _this._splitData[obj.target_index]][0],
                            img_y = _this.relResult['part_' + _this._splitData[obj.target_index]][1],
                            canvas_x = _this._nowResult[obj.target_index][2] - w;
                        canvas_y = _this._nowResult[obj.target_index][3] - h;
                    } else if (i == obj.target_index) {
                        img_x = _this.relResult['part_' + _this._splitData[obj.index]][0],
                            img_y = _this.relResult['part_' + _this._splitData[obj.index]][1],
                            canvas_x = _this._nowResult[obj.index][2] + w;
                        canvas_y = _this._nowResult[obj.index][3] + h;
                    }

                    _this._draw([
                        img_x,
                        img_y,
                        canvas_x,
                        canvas_y
                    ])
                })
                if (!w && !h) {
                    clearInterval(_timer);
                    var y = _this.computeResult(_this._splitData);
                    if (y) {
                        //_this.opt.pop.style.opacity = 1;
                    }
                    _this.canvas.style.pointerEvents = 'all';
                }
            }, step_time);
        },
        computeResult: function (arr) {
            var flag = true,
                _this = this;
            arr.forEach(function (ele, index) {
                if (ele - index != 0) flag = false;
            });

            if (flag) {
                _this.canvas.style.pointerEvents = 'none';
                if (typeof _this.opt.success == 'function') {
                    setTimeout(function () {
                        _this.opt.success();
                    }, 1000);
                }
            }
            _this.canvas.flag = false;
            return flag;
        }
    }
    Pintu.prototype.options = {
        src: 'images/ruleImg1.jpg',//图
        num: 4,//拆分数量
        stroke: '#3b3f44',//选中线颜色
        lineWidth: 5,//选中线宽
        container: document.getElementById('myCanvas'),//canvas的父级容器元素
        //canvas:document.getElementById('myCanvas'),//canvas dom
        testData: null,//固定图片位置
        imgMargin: 3,//图片间距
        switchTime: 150,//换位时间
        success: null,//成功回调
        width: 540,//宽
        height: 420,//高
        oLeft: 52,//canvas 距右边距离
        oTop: 353//canvas 距顶部距离
    }

    function _makeCanvas(container) {
        var canvas = container.querySelector('canvas');
        canvas && canvas.remove();
        canvas = document.createElement('canvas');
        container.appendChild(canvas);
        return canvas;
    }

    w.Pintu = Pintu;
})(window)
