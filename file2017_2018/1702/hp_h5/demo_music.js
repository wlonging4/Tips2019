define(function (require,exports){


    document.addEventListener(Event.Touch.move,Event.preventDefault);
    var raiden = document.getElementById('raiden');
    raiden.ctx = raiden.getContext('2d');

    window.addEventListener('DOMContentLoaded',function(){
        raiden.height = window.innerHeight;
        document.querySelector('.loading').classList.remove('loading-visible');

    });

    // 兼容性处理
    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;
    var lastTime = 0;
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }

    //开始游戏
    var main = document.querySelector('.main');
    document.querySelector('.start').addEventListener('tap',function(){
        document.querySelector('.gift-pic img').src=  'http://active.zol.com.cn/16active/1222lenovo/giftflow.gif';
        setTimeout(function(){
            document.querySelector('.foreword').classList.add('visible');
            setTimeout(function(){
                main.classList.add('visible');
                document.querySelector('.foreword').style.display =  document.querySelector('.home').style.display =  'none';
                document.querySelector('.gift-pic img').src=  'http://2.zol-img.com.cn/zt/tm_587/74f8dbad34/homegift.png';
                init();
            },2400)
        },2800)
    })

    var lock;
    var props = [],bullets = [],figure,heroX,heroY,all = [],timer;
    var monster = [{"dx":403,"dy":553,"w":100,"h":120,"effect":-6}];
    var diamonds = [{"dx":0,"dy":230,"w":228,"h":186,'effect':10},{"dx":257,"dy":230,"w":186,"h":186,'effect':10},{"dx":473,"dy":230,"w":174,"h":154,'effect':10},{"dx":673,"dy":230,"w":159,"h":144,'effect':10},{"dx":869,"dy":230,"w":114,"h":114,'effect':10},{"dx":0,"dy":0,"w":86,"h":97,'effect':5},{"dx":123,"dy":0,"w":54,"h":62,'effect':5},{"dx":221,"dy":0,"w":42,"h":46,'effect':5},{"dx":312,"dy":0,"w":144,"h":154,'effect':5}];//礼物 9

    // 初始化
    function init(){
        ishit.SCORE = 0;
        window.subtract = !1;
        window.delaySpeed = 1;
        window.bombing = !1; //控制小人是否遇到炸弹
        score.innerHTML = ishit.SCORE;
        attack.timestamp = 0;
        invasion.m = 0;
        time.countdown = 15; //游戏倒计时时间
        time.innerHTML = time.countdown;

        // 小人的初始化坐标
        heroX = 640/2 - 170/2;  //100小人高
        heroY = parseInt(raiden.height) - 250;


        //add(0,553,239,204,'figure'); //添加小人到画布
        add(0,553,200,170,'figure'); //添加小人到画布
        attack();

        timer && clearInterval(timer);
        timer = setInterval(countDown,1000);
        document.querySelector('.footer .time').classList.add('begin');
    };

    // 创建对象
    function generate(x,y,dx,dy,w,h,role,effect){
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.w = w;
        this.h = h;
        //this.width = w - (role === 'figure' ? 18 : 30);
        this.width = w ;
        this.height = role === 'figure' ? h : h - 30;
        this.role = role;
        this.effect = effect;
    };

    // 添加怪或道具之后加入到数组中，通过遍历数组得到每一个怪或道具
    function add(dx,dy,w,h,role,effect){ //参数（图片里的x，y位置，元素宽高，角色，effect）
        switch(role){
            case 'figure':
                x = heroX;
                y = heroY;
                figure = new generate(x,y,dx,dy,w,h,role,effect);
                all.push(figure);
                break;
            case 'prop':
            case 'bomb': //炸弹和礼包出现的位置
                x = parseInt(Math.random() * 340),y = 0; //340=640-笔记本宽  /笔记本比较宽，计算出现的x范围
                /*while(x && x > 130){ /
                 x = parseInt(Math.random() * 510);
                 };*/
                props.push(new generate(x,y,dx,dy,w,h,role,effect));
                break;
        };
    };


    // 出现怪物的频次以600毫秒为基准，逐次递减
    function invasion(timestamp){
        invasion.speed = (600 - parseInt(timestamp/600));

        invasion.t = parseInt(timestamp/invasion.speed);
        //console.log(invasion.t )
        if(invasion.t > invasion.m){
            if(invasion.t%3 == 0){ //出现炸弹的频率 4s
                //var position = monster[parseInt(Math.random()*3)]; //n为几个炸弹
                var position = monster[parseInt(Math.random()*1)];
                add(position.dx,position.dy,position.w,position.h,'bomb',position.effect);
            }else{
                //var position = diamonds[parseInt(Math.random()*3)]; //n为几个礼物
                var position = diamonds[parseInt(Math.random()*9)];
                add(position.dx,position.dy,position.w,position.h,'prop',position.effect);
            }

            invasion.m = invasion.t;
        }
    };
    /*
     *	重绘，实现道具和怪，人物，子弹的移动
     *	考虑到移动端的性能问题，这里将在超出画布的时候进行删减处理
     * 	subtract为小人是否被击中的控制变量
     */

    // 攻击
    var alpha = 1,sort = !0;
    function attack(){
        all = [];
        raiden.ctx.clearRect(0,0,raiden.width,raiden.height);
        if(!subtract){
            attack.timestamp += 16;
            invasion(attack.timestamp);
        }
        // 小人
        raiden.ctx.beginPath();
        figure.x = heroX;
        figure.y = heroY;


        /*if(subtract){
         changeAlpha();
         }else{
         raiden.ctx.globalAlpha = 1;
         }
         */

        raiden.ctx.drawImage(raiden_props,figure.dx,figure.dy,figure.w,figure.h,figure.x,figure.y,figure.w,figure.h);
        all.push(figure);


        // 怪物/魔法道具
        props.forEach(function(item){
            raiden.ctx.beginPath();
            raiden.ctx.globalAlpha = 1;
            if(item.y > raiden.height) props.remove(item);
            if(!subtract) item.y += (10 * delaySpeed);
            raiden.ctx.drawImage(raiden_props,item.dx,item.dy,item.w,item.h,item.x,item.y,item.w,item.h);

        });
        try{
            attack.timer = requestAnimationFrame(attack);
        }catch(error){}
        if(!subtract){
            all = all.concat(bullets,props);
            all.forEach(function(item){
                attack.first = item;
                all.forEach(function(other){
                    attack.another = other;
                    attack.another !== attack.first && ishit(attack.first,attack.another);
                });
            });
        }

    };
    /*
     *	碰撞检测 *
     */

    function ishit(a,b){
        var h,v;
        if(a.role !== b.role){

            // 礼物或者炸弹 碰撞检测
            if((a.role === 'prop' || a.role === 'bomb') && b.role === 'figure'){
                //h = Math.abs(a.x - (b.x + b.width));
                //v = Math.abs(a.y - (b.y + b.height));
                h = a.x > b.x ? Math.abs(a.x - b.x + a.width) : Math.abs(b.x - a.x + b.width);
                v = a.y > b.y ? Math.abs(a.y - b.y + a.height) : Math.abs(b.y - a.y + b.height);
                /*if(a.x>b.x){
                 h = Math.abs(a.x - b.x + a.width); //人物在左
                 }else{
                 h = Math.abs(b.x - a.x + b.width); //人物在右
                 }
                 if(a.y>b.y){
                 v = Math.abs(a.y - b.y + a.height); //人物在上
                 }else{
                 v = Math.abs(b.y - a.y + b.height);//人物在下
                 }*/

                if(h <= (a.width + b.width) && v <= (a.height + b.height)){
                    ishit.SCORE += premium(b,a);
                    if(ishit.SCORE<=0)ishit.SCORE = 0;
                    score.innerHTML = ishit.SCORE;

                }
            }


        }
    };

    // 技能效果及加分
    function premium(a,b){
        var number = 0;
        //bullets.remove(a);
        explosion(b); //碰到炸弹爆炸
        number = +b.effect;
        return number;
    };
    // 碰到炸弹爆炸
    function explosion(o){
        if(o.role === 'bomb'){
            if(!eggbox.classList.contains('show')){
                sport(egg,eggimg,640,872,17);
                eggbox.classList.add('show');
                lock = true;
                //media1.play();
                setTimeout(function(){
                    eggbox.classList.remove('show');
                    egg.x = 0;

                },1200)
            }
            var x = o.x - (232 - o.w)/2;
            var y = o.y - (232 - o.h)/2;
            raiden.ctx.drawImage(raiden_props,730,553,232,232,x,y,232,232);

            //bombing = true; //让小人哭开关
        }
        props.remove(o);
    }

    //绘制小鸡爆炸

    function sport(c,img,w,h,step){
        c.timer && cancelAnimationFrame(c.timer);
        var manCtx = c.getContext('2d');
        if(c.x == undefined ){
            c.x = 0;
            c.y = 0;
        }else{
            manCtx.clearRect(0,0,w,h)
            if(c.x ==14 && c.y!=8){
                c.y++;
                c.x = 13;
            }
            c.x ++;
            //manCtx.drawImage(img,c.x*w,0,w,h,0,0,w,h);
            manCtx.drawImage(img,c.x*w,0,w,h,110,220,448,610);
        }
        c.timer = requestAnimationFrame(function(){sport(c,img,w,h,step)});
        if(c.x >= step){
            cancelAnimationFrame && cancelAnimationFrame(c.timer);
            c.x = c.y = 0 ;
            manCtx.clearRect(0,0,640,872);
        }
    };

    // 移动小人
    raiden.addEventListener(Event.Touch.down,function(e){
        var position = e.changedTouches[0];
        var px = +position.pageX,
            py = +position.pageY;
        /*
         *	获取手指坐标之后，并确定位置是否在小人的范围内
         *	由于需要将手指位置定于小人的中心，分别需要将坐标减掉小人宽、高的1/2;
         */
        if(px > heroX && px < heroX + 168 && py > heroY && py < heroY + 188){
            raiden.dragable = !0;
            heroX = px - 100; //宽高一半
            heroY = py - 85;
        }
    });

    raiden.addEventListener(Event.Touch.up,function(){
        raiden.dragable = !1;
    });

    raiden.addEventListener(Event.Touch.move,function(e){
        if(lock){
            media1.play();
            lock = false;
        }
        var position = e.changedTouches[0];
        var px = position.pageX,
            py = position.pageY;

        // 获取手指坐标之后，
        if(raiden.dragable){
            heroX = px - 100;
            heroY = py - 85;
            if(heroX>=440){ //640-人物宽
                heroX=440;
            }else if(heroX<=0){
                heroX=0;
            };
            if(heroY>=raiden.height-254){ //高度-人物高
                heroY=raiden.height-254;
            }else if(heroY<=0){
                heroY=0;
            };

        }

    });
    // 清空
    function clear(a){
        if(a && a === 'all') figure = '';
        props = [];
    };
    //倒计时
    var countDown = function() {
        var timeMain = document.querySelector('#time'),
            timeProgress = document.querySelector('.time-progress');
        time.countdown--;
        if (time.countdown >= 0) {
            timeMain.innerHTML = time.countdown;
        } else {
            clearInterval(timer);
            isOver();
        };
    };

    var isOver = function(){
        document.body.style.height = window.innerHeight+'px';

        var allTotal = document.querySelectorAll('.total') ;
        clear('all');
        cancelAnimationFrame && cancelAnimationFrame(attack.timer);
        gameover.classList.add('visible');
        allTotal.forEach(function(span,i){
            span.innerHTML = ishit.SCORE;
        })
        document.querySelector('.footer .time').classList.remove('begin');
    };

    function restart(){
        subScore.disabled = false;
        if(gameover.classList.contains('visible')){
            gameover.classList.remove('visible');
            score.innerHTML = ishit.SCORE;
        }
        gameover.classList.contains('gameover-status1') && gameover.classList.remove('gameover-status1');
        gameover.classList.contains('gameover-status2') && gameover.classList.remove('gameover-status2');
        subScore.disabled = false;
        init();
    }

    //重玩游戏
    replay.addEventListener('tap',restart);

    // 测试使用
    //document.getElementById('stop').addEventListener('tap',isOver);

    var activeType = 6238396; //专题id
    //获取排行
    function fillRank(data){
        var html = '';
        if(data && Array.isArray(data)){
            data.forEach(function(item,index){
                var timeArr = item.ctime.match(/(\d{4})-(\d{1,2})-(\d{1,2})/),
                    timeStr = timeArr[2]+'-'+timeArr[3];
                html += '<tr><td width="15%">'+(index+1)+'</td><td width="35%">'+ item.tel +'</td><td width="20%">'+ timeStr +'</td><td width="30%">'+ item.ext1 +'</td></tr>'
            });
            return html;
        }
    };
    function getRankData(){
        $.ajax({
            type:'get',
            url:'http://m.zol.com.cn/topic/services/user.php?action=getUserListForMaxScore&type='+activeType+'&limit=10',
            dataType:'jsonp',
            success:function(res){
                if(res.result){
                    document.querySelector('.rank-list .rank-con').innerHTML = fillRank(res.result);
                    if(res.result.length == 0){
                        document.querySelector('.rank-list .rank-con').innerHTML ='排行暂无数据，赶快参加吧~';
                    }
                }else{
                    document.querySelector('.rank-list .rank-con').innerHTML ='排行暂无数据，赶快参加吧~';
                }
            }
        });
    };

    //提交成绩
    var subScore =  document.querySelector('.sub-btn'),
        mobile = document.querySelector('.inp-box .tel');
    subScore.addEventListener('tap',function(){
        if (subScore.disabled) return;

        if (!mobile.value || !(/^1(([38]\d)|(4[57])|(5[012356789])|(7[0678]))\d{8}$/.test(mobile.value))) {
            alert('请正确输入手机号');
            return;
        }
        window.mobileValue = mobile.value;
        localStorage.userPhone = mobile.value;
        subScore.disabled = true;
        $.ajax({
            type:'get',
            url: 'http://m.zol.com.cn/topic/services/session.php?callback=?',
            dataType: 'json',
            success: function (res) {
                if(res){
                    var token = res.result;
                    $.ajax({
                        type:'get',
                        url: 'http://m.zol.com.cn/topic/services/user.php?callback=?',
                        data:{token:token,action:'addUser',username:'lenovo',type:activeType,tel:window.mobileValue,ext1:ishit.SCORE},
                        dataType: 'jsonp',
                        success: function (data) {
                            document.body.style.height = '';
                            if(data.result == 1){//提交成功
                                successFn(window.mobileValue);
                            }else {
                                alert(data.result);
                                subScore.disabled = false;
                            }
                        },
                        error : function(){
                            alert('网络不好，请稍后重试');
                            subScore.disabled = false;
                        }
                    });
                }
            },
            error : function(){
                alert('网络不好，请稍后重试');
                subScore.disabled = false;
            }
        });

    });
    //查询排名
    function successFn(phone){
        $.ajax({
            type:'get',
            url: 'http://m.zol.com.cn/topic/services/user.php?',
            data:{action:'findUserTop',type:activeType,tel:phone},
            dataType: 'jsonp',
            success: function (result) {
                if(result){
                    var result = result.result;
                    var bestScore = result.ext1,
                        ranking = result.top;
                    if(window.rank || searchFlag){
                        resultRank.style.display = 'block';
                        searchBox.style.display = 'none';
                        document.querySelector('.rank-section .tel').innerHTML = phone;
                        document.querySelector('.rank-section .best').innerHTML = bestScore;
                        document.querySelector('.rank-section .ranking').innerHTML = ranking;
                    }else{
                        if(result.over>=30){
                            gameover.classList.add('gameover-status2');
                            gameover.querySelector('.percent').innerHTML = result.over+'%';

                        }else{
                            gameover.classList.add('gameover-status1');
                            gameover.querySelector('.status1 .best').innerHTML = bestScore;
                            gameover.querySelector('.status1 .ranking').innerHTML = ranking;


                        }
                    }

                }
            }
        });

    }
    //查看排行榜
    var searchBox = document.querySelector('.hd-box .search-box'),
        resultRank = document.querySelector('.hd-box .result-rank'),
        searchFlag;
    document.querySelectorAll('.rank-btn').addEventListener('click',function(){
        getRankData();

        document.querySelector('.rank-section').classList.add('visible');
        var tel  =  window.mobileValue  ||  localStorage.userPhone //或者本地存储
        if(tel){
            window.rank = true;
            successFn(tel);
        }else{
            resultRank.style.display = 'none';
            searchBox.style.display = 'block';
        }
    });

    //查询
    var searchPhone = document.querySelector('.input-box .phone'),
        searchBtn = document.querySelector('.search-btn');

    searchBtn.addEventListener('tap',function(){
        var searchVal = searchPhone.value;
        if (!searchVal || !(/^1(([38]\d)|(4[57])|(5[012356789])|(7[0678]))\d{8}$/.test(searchVal))) {
            alert('请正确输入手机号');
            return;
        }
        //localStorage.userPhone = searchPhone.value;
        searchFlag = true;
        successFn(searchVal);
    });

    //关闭
    document.querySelector(' .scroll').addEventListener('click',function(){
        var parent = this.parentNode;
        parent.classList.remove('visible');
        iScrollBrand.scrollTo(0,0);
    });
    document.querySelector('.go-home').addEventListener('click',function(){
        var parent = this.parentNode.parentNode.parentNode;
        parent.classList.remove('visible');
    });
    //弹出页面
    var scroll = document.querySelector('.scroll');
    var iScrollBrand = new iScroll(scroll, {
        bounce: false,
    });
    document.querySelector('.gift').addEventListener('click',function(){
        document.querySelector('.page-section').classList.add('visible');
        iScrollBrand.refresh();
    })
    //查看规则
    document.querySelector('.rule-btn').addEventListener('tap',function(){
        document.querySelector('.rule-con').style.display = 'block';
    });
    document.querySelector('.rule-con').addEventListener('tap',function(){
        this.style.display = 'none';
    });


    var musicFlag;
    //控制音乐自动播放
    //bgmedia.play();
    bgmedia.play();
    document.addEventListener(Event.Touch.down, function () {
        if(!musicFlag){
            bgmedia.play();
            musicFlag = true;
        }

    });

    //控制音乐循环播放
    bgmedia.addEventListener('ended', function () {
        setTimeout(function () {
            bgmedia.play();
        }, 10);
    }, false);

    //控制音乐暂停或开始
    control && control.addEventListener('click',function(){
        if(this.className === 'on'){
            this.className = 'off';
            bgmedia.pause();
        }else{
            this.className = 'on';
            bgmedia.play();
        }
    });





    //重力感应
    /* function readyFn() {
     var dom = document.querySelector('.main-bg'),
     img = dom.querySelector('.img');


     var IMG_W = img.width,
     IMG_H = img.height;
     var WIN_W = document.documentElement.clientWidth,
     WIN_H = document.documentElement.clientHeight;
     var timefragment = 0,               // 时间片计时
     nowts = 0;                      // 当前时间
     // 设置默认的left/top

     dom.style[$.CSSTransform] = 'translate(0px,0px) ';
     window.addEventListener('deviceorientation', function (evt) {

     nowts = new Date().getTime();
     // 控制时间片
     if (nowts  - timefragment > 37) {
     timefragment = nowts;
     var alpha = evt.alpha,          //垂直于屏幕的轴 0 ~ 360
     beta = evt.beta,            //横向 X 轴 -180 ~ 180
     gamma = evt.gamma;          //纵向 Y 轴 -90 ~ 90
     var top = parseInt(getObjTop(dom), 10) || 0,
     left = parseInt(getObjLeft(dom), 10) || 0;
     var _top, _left;
     _top = top + (beta / 180 * 30);
     _left = left + (gamma / 90 * 30);
     _top = _top >= 0 ? 0 : (_top < (WIN_H - IMG_H) ? (WIN_H - IMG_H) : _top);
     _left = _left >= 0 ? 0 : (_left < (WIN_W - IMG_W) ? (WIN_W - IMG_W) : _left);

     if(_left<=-220){_left = -220} ;
     if(_top<=-70){_top = -70} ;

     dom.style[$.CSSTransform] = 'translate('+ _left+'px,'+_top+'px) ';

     }
     }, false);


     //获取top位置

     function getObjTop(ele){
     var top = window.getComputedStyle(ele, null).webkitTransform.split(',')[5];
     return parseInt(top.replace(/\)/g,''));
     }
     //获取left位置
     function getObjLeft(ele){
     var left = window.getComputedStyle(ele, null).webkitTransform.split(',')[4];
     return parseInt(left);
     }


     }*/






})