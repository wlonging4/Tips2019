(function(window, document, undefined){
	/**
	 * 工具集
	 * @return {object}
	 */
	var utils = (function(){
		var me = {};
		/**
		 * 判断是否是空对象
		 * @param  {object} object 	需要判断的对象
		 * @return {Boolean}
		 */
		me.isEmptyObject = function(object){
	        for (var t in object){
	            return !1
	        }
	        return !0
		};

		me.isNotEmptyString = function(val) {
			return (typeof val === 'string') && val !== ''
		};

		/**
		 * 对象遍历器
		 * @param  {object}   object   需要遍历的对象
		 * @param  {Function} callback 回掉函数
		 */
		me.forEachIn = function(object, callback){
			for(var key in object) {
	            if(object.hasOwnProperty(key)){
	                callback(key, object[key])
	            }
	        }
		};

		/**
	     * 根据数据得到查询参数字符串
	     * @param  {Object} data 数据对象
	     * @return {String}      如：'a=xx&b=yy'
	     */
	    me.getQueryStr = function (data) {
	        var arr = [];
	        data = data || {};
	        _forEachIn(data, function(key, item) {
	            arr.push(key + '=' + item)
	        });
	        return arr.join('&')
	    };

		/**
	     * 跨域JSON提交或者发送get请求
	     * @param  {String}   src      接收地址
	     * @param  {Function} callback 回掉函数
	     */
	    me.jsonp = function (src, callback) {
	        // 创建script标签
	        var script  = document.createElement("script");
	        var head = document.getElementsByTagName('head')[0];
	        var callbackName = '_jsonp' + (+new Date());
	        src = src + '&callback=' + callbackName;
	        script.charset = "utf-8";
	        // 创建jsonp回调函数
	        window[callbackName] = function (data) {
	            window[callbackName] = null;
	            if(callback && typeof callback === 'function'){
					 callback(data)
				}
	        };
			script.onload = script.onreadystatechange = function() {
				if(!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
					if ( script.parentNode ) {
	                    script.parentNode.removeChild( script )
	                }
					script.onload = script.onreadystatechange = null
				}
			};
	        script.src  = src;
	        //head.appendChild(script)
	    };

		/**
         * 读取cookie
         * @param  {String} name cookie名字
         * @return {String}      cookie值
         */
        me.getCookie = function(name){
			var ret, m;
			var cookies = String(document.cookie);
			var reg = new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)');
			if (this.isNotEmptyString(name)) {
				m = cookies.match(reg);
				ret = m ? (m[1] ? unescape(m[1]) : '') : ''
			}
			return ret
        };

		/**
         * 设置cookie
         * @param  {String} name  cookie名字
         * @param  {String} value cookie值
         * @param  {Number} hours 过期时间
         */
        me.setCookie = function(name, value, expires, domain, path, secure){
            var text = '', date = expires;
			var MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000;
			// 从当前时间开始，多少天后过期
			if (typeof date === 'number') {
		   		date = new Date((new Date()).getTime() + expires * MILLISECONDS_OF_DAY)
			}
   			// expiration date
		   	if (date instanceof Date) {
	   			text += '; expires=' + date.toUTCString()
		   	}

			// domain
			if (this.isNotEmptyString(domain)) {
		   		text += '; domain=' + domain
			}

			// path
			if (this.isNotEmptyString(path)) {
	   			text += '; path=' + path;
			}

			// secure
			if (secure) {
		   		text += '; secure'
			}

            document.cookie = name + '=' + escape(value) + text
        };

		/**
         * 删除cookie
         * @param  {String} name  cookie名字
         */
        me.deleteCookie = function (name, domain, path, secure) {
			this.setCookie(name, '', -1, domain, path, secure)
        };

		/**
         * 获取页面链接的域名 domain
         * @return {String} 如：.zol.com.cn
         */
        me.getDomain = function(){
            var domain = '',
    		    hostname = location.hostname,
    		    str = hostname.replace(/\.(com|net|org|cn$)\.?.*/,'');
    		if(str.lastIndexOf('.') < 0){
                domain = '.' + hostname
            } else {
                str = str.substring(str.lastIndexOf('.'))
                domain = hostname.substring(hostname.lastIndexOf(str))
            }
            return domain
        };
		return me
	}());


	function ZPV(){
		return this.init.apply(this, arguments)
	}
	ZPV.prototype = {

		init: function() {
			// 设置参数
			this.setConfig(arguments[0]);
			//var queryData = this.getPvQueryParams();



			/*
			*兼容处理forEach indexOf
			*放在函数之前执行;
			* */
            this.compat();
            /*执行函数*/
            this.getEvent();




			var ipck = utils.getCookie('ip_ck');
			var url = window.location.protocol + '//liuxg.com/php/pv.php?c='+ ipck;
			utils.jsonp(url, function(res){
				// 如果需要 则先写ipck cookie
				if(data.isWriteIpckCookie) {
					// 十年
					utils.setCookie('ip_ck', res.ipck, 3650)
				}
				queryData.uv = res.uv
				queryData.se = res.se
				queryData.uv = res.uv
			})
		},

		setConfig: function(config) {
			var options = {

			}
			// extend
            for(var key in config){
                if(options.hasOwnProperty(key)){
                    options[key] = config[key]
                }
            }
            this.options = options
		},

		/*getPvQueryParams: function() {

			var settings = this.options,
				query = {};

			// 网站.业务模块.频道(或产品线)
			var site = 'ZOL', app = '*', channel = '*'
			var siteInfo = settings.site
			if(typeof siteInfo.site !== 'undefined' && settings.site !== ''){
                site = siteInfo.site.toLowerCase()
            }
			if(typeof siteInfo.app !== 'undefined' && settings.app !== ''){
                app = siteInfo.app
            }
			if(typeof siteInfo.channel !== 'undefined' && settings.channel !== ''){
                channel = siteInfo.channel
            }
			query.site = site + '.' + app + '.' + channel;

			// 用户id
			var userid = '';
            if(typeof settings.useridCookieName !== 'undefined' && settings.useridCookieName !== '') {
                userid = utils.getCookie(settings.useridCookieName)
            } else {
                userid = utils.getCookie('zol_userid')
            }
			query.userid = userid

			// vn: 访问次数(view num)
			// lv: 最后访问时间(last view)
            var vnCookieValue = utils.getCookie('vn'),
                lvCookieValue = utils.getCookie('lv')
            if(isNaN(parseInt(vnCookieValue))) {
                vnCookieValue = 0
            }
            if(isNaN(parseInt(lvCookieValue))) {
                lvCookieValue = 0
            }
            var vn = vnCookieValue
            var lv = lvCookieValue
            if((+new Date()/1000) - lvCookieValue > 7200) {
				// 除以1000是因为 php获取的时间戳是秒 JS的是毫秒
                lv = parseInt(+new Date()/1000)
                vn++
				// cookie 存365天 一年
                utils.setCookie('lv', lv, 365)
                utils.setCookie('vn', vn, 365)
            }
			query.vn = vn
			query.lv = lv

			// 显示屏幕宽高
            var screen = screen.width + 'x' + screen.height
			query.screen = screen

            // 页面来源
            var referrer = ''
            if(top.location === self.location){
                referrer = this.getReferrer()
            } else {
                var refUrl = document.referrer + ''
    			referrer = this.getRefUrl(refUrl)
                referrer = (referrer !== '') ? referrer : document.referrer
            }
            referrer = referrer.replace(/\</g, '').replace(/\>/g, '')
			query.ref = referrer

            return query
		},*/

		/**
         * 通过所给的url, 获取里边的参数 ref0
         * @param  {String} url
         * @return {String}
         */
        getRefUrl: function(url){
            var refUrl = ''
            if (url.indexOf('ref0') > -1){
        		var reg = /(?:\&|\?)ref0=([\s\S]*?)$/i
        		refUrl = url.match(reg)
        		refUrl = encodeURI(refUrl[1])
        	}
            return refUrl
        },

		/**
         * 获取页面来源，如果有设置的以设置的优先 设置变量为 _zpv_document_refer 全局变量
         * @return {String} 来源页url
         */
        getReferrer: function(){
			var referrer,
				cookieReferrer = utils.getCookie('PC2MRealRef')
			if (typeof(window._zpv_document_refer) !== "undefined" && window._zpv_document_refer !== '') {
				referrer = window._zpv_document_refer
			} else if(cookieReferrer !== ''){
				referrer = referrer
				var domain = utils.getDomain()
				utils.deleteCookie('PC2MRealRef', domain, '/')
			} else {
				referrer = document.referrer
			}
			return referrer
        },

		/*兼容方法*/
		compat:function(){
            if ( !Array.prototype.forEach) {
                Array.prototype.forEach = function forEach(callback) {
                    // 获取数组长度
                    var len = this.length;
                    if(typeof callback != "function") {
                        throw new TypeError();
                    }
                    // thisArg为callback 函数的执行上下文环境
                    var thisArg = arguments[1];
                    for(var i = 0; i < len; i++) {
                        if(i in this) {
                            // callback函数接收三个参数：当前项的值、当前项的索引和数组本身
                            callback.call(thisArg, this[i], i, this);
                        }
                    }
                }
            }
            if (!Array.prototype.indexOf) {
                if (!Array.prototype.indexOf) {
                    Array.prototype.indexOf = function (ele) {
                        var len = this.length;
                        var fromIndex = Number(arguments[1]) || 0;
                        if (fromIndex < 0) {
                            fromIndex += len;
                        }
                        while (fromIndex < len) {
                            if (fromIndex in this && this[fromIndex] === ele) {
                                return fromIndex;
                            }
                            fromIndex++;
                        }
                        if (len === 0) {
                            return -1;
                        }
                    }
                }
            }
            Array.prototype.Exists=function(v){var b=false;for(var i=0;i<this.length;i++){if(this[i]==v){b=true;break;}}return b;};
		},

		/*设置标记元素id*/
        markDiv: document.getElementById('w4'),
        //nowTimestamp:new Date().getTime(),
        eventArr:['mousemove','click','keyup','scroll','focus','blur','touchstart','touchmove'],


        addEvent: function(obj, ev, func) {
            if (document.attachEvent) {
                if (obj) {
                    obj.attachEvent('on' + ev, func)
                } else {
                    window.attachEvent('on' + ev, func)
                }
            } else if (document.addEventListener) {
                if (obj) {
                    obj.addEventListener(ev, func, false)
                } else {
                    window.addEventListener(ev, func, false)
                }
            }
        },

        nowTimeFlag:0,
        tsOld:0,
        tsNew:0,
		/*设置stamp最小间隔秒数*/
        timeInter:10,
		eventFlagsArr:[],

		touchOriginX:0,
		touchOriginY:0,
		touchEndX:0,
		touchEndY:0,
		touchEnd:0,
		/*设置touch最小间隔像素*/
		touchDistance:50,

		clickA:{
			clickPath:null,
			clickHref:null,
			clickAFlag:0
		},

        getEvent: function () {
            var _this=this;
			this.eventArr.forEach(function (item,index) {
				if(item=='keyup'||item=='mousemove'){
                    _this.addEvent(document,item,function (e) {
                        var event = window.event || e;
                        _this.getPvQueryStr(event.type);
                    });
				}
				if(item=='click'){
                    _this.addEvent(document,item,function (e) {
                        var event = window.event || e;
                        var eventSrc=window.event.srcElement || window.event.target;
                        //console.log(eventSrc);
                        //console.log(eventSrc.nodeName);
                        if((eventSrc.nodeType==1) && ((eventSrc.nodeName).toLowerCase()=='a')){
                            //console.log(eventSrc.getAttribute('href'));
                            _this.clickA.clickHref=eventSrc.getAttribute('href');
                            _this.clickA.clickAFlag=1;
                            /*获取xpath*/
                            _this.getClickXPath(eventSrc);
                            _this.clickA.clickPath=_this.getClickXPath(eventSrc);
						}
                        _this.getPvQueryStr(event.type);
                    });
				}
                if(item=='scroll'||item=='blur'||item=='focus'){
                    _this.addEvent(window,item,function (e) {
                        var event = window.event || e;
                        _this.getPvQueryStr(event.type);
                    })
				}
				/*判断touchmove移动*/
				if(item=='touchstart'){
					_this.addEvent(window,item,function (e) {
						var event = window.event || e;
						_this.touchOriginX=event.touches[0].clientX;
						_this.touchOriginY=event.touches[0].clientY;
						//console.log(this.touchOriginX);
						//console.log(this.touchOriginY);
						_this.getPvQueryStr(event.type);
					});
				}
				if(item=='touchmove'){
					_this.addEvent(window,item,function (e) {
						var event = window.event || e;
						_this.touchEndX=Math.pow(event.touches[0].clientX-_this.touchOriginX,2);
						_this.touchEndY=Math.pow(event.touches[0].clientY-_this.touchOriginY,2);
						_this.touchEnd=Math.sqrt(_this.touchEndX+_this.touchEndY);
						//console.log(_this.touchEnd+'__');
						if(_this.touchEnd<=_this.touchDistance){
							//console.log('noTouch');
							return false;
						}else{
							//console.log('yesTouch');
							_this.getPvQueryStr(event.type);
						}
					});
				}
            });
        },

		countTimestamp: function (i) {
            if(this.eventFlagsArr.Exists(i)){
                this.tsNew=+new Date();
                if(this.tsNew-this.tsOld>=this.timeInter*1000){
                    this.tsOld=this.tsNew;
					/*执行操作*/
					this.nowTimeFlag=1;
                }else{
                    this.nowTimeFlag=0;
				}
            } else{
            	/*第一次执行方法*/
            	this.eventFlagsArr.push(i);
                this.tsOld=+new Date();
                /*执行操作*/
                this.nowTimeFlag=1;
            }
        },

        getPvQueryStr: function (i) {
			var _this=this;
            console.log(i);
			this.countTimestamp(i);
			if(!this.nowTimeFlag){
				return false;
			}

			/*点击事件获取xpath及去向*/
			if(i=='click' && _this.clickA.clickAFlag==1){
				console.log(_this.clickA);
				_this.clickA.clickAFlag=0;
			}
			/*返回当前事件名称 时间戳 url*/
            console.log('触发: '+i);
			console.log(this.getBasicInfo(i));
            /*当前窗口底部的页面的高度像素（滚动的高度+窗口高度）*/
            console.log(this.getPageInfo());
            this.getPageInfo();
            /*特殊标记的位置*/
            console.log(this.getMarkInfo(this.markDiv));
            this.getMarkInfo(this.markDiv);
        },

        getPageInfo:function () {
            var winHeight;
            var scrollTop;
            if (window.innerHeight) {
                winHeight = window.innerHeight;
            } else if (document.documentElement && document.documentElement.clientHeight){
                winHeight = document.documentElement.clientHeight;
            }
            scrollTop=window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0;
            return({'winHeight=':winHeight,'scrollTop':scrollTop,'pageNowHeight':winHeight+scrollTop});
        },
        
        getMarkInfo:function (mark) {
            var markTop=mark.offsetTop,markLeft=mark.offsetLeft;
            mark=mark.offsetParent;
            while(mark!=null){
                markTop+=mark.offsetTop;
                markLeft+=mark.offsetLeft;
                mark=mark.offsetParent;
            }
            return {'markPageTop':markTop,'markPageLeft':markLeft};
        },

		getBasicInfo:function (evtName) {
			return { 'nowPageUrl':window.location.href,'nowPageEvent':evtName,'nowDatestamp':this.tsOld }
        },

        getClickXPath: function(element){
            var paths = [];
            for (; element && element.nodeType === 1; element = element.parentNode) {
                var index = 0;
                for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
                    if (sibling.id === 'BAIDU_DUP_fp_wrapper'){
                        continue;
                    }
                    if (sibling.tagName === element.tagName) {
                        ++index;
                    }
                }
                var tagName = element.tagName.toLowerCase();
                var pathIndex = (index ? "[" + (index+1) + "]" : "");
                paths.splice(0, 0, tagName + pathIndex);
            }
            return paths.length ? "/" + paths.join("/") + "/" : null;
        }
	};

	// 避免重复统计
    if(typeof(window._zpv_done) === 'undefined'){
        window._zpv_done = true;
        new ZPV(window._zpv_vars)
    }
}(this, document));
