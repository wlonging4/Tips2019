/MicroMessenger/i.test(navigator.userAgent) && (function() {
    var tips = document.getElementById('wechat-tips'), buttons = document.querySelectorAll('.share .weixin,.share .wechat,a[href$="#wechat"],a[href$="#weixin"]'), meta;
    if (!tips && buttons.length) {
        tips = document.createElement('div');
        tips.id = 'wechat-tips';
        var viewport = document.querySelector('meta[name="viewport"]');
        if (viewport && /width=640/.test(viewport.content)) {
            tips.style.cssText = 'display: none;position: fixed;z-index: 999;left: 0;top: 0;width: 100%;height: 100%;background: rgba(0,0,0,.9) url(http://icon.zol-img.com.cn/m/images/wechat-tips.png) no-repeat 100% 0;';
            tips.innerHTML = '<span role="button" onclick="this.parentNode.style.display=\'none\';" style="position: relative;display: block;width: 382px;height: 64px;line-height: 64px;margin: 0 auto;top: 624px;border: 2px solid #fff;color: #fff;font-size: 30px;text-align: center;">\u6211\u77E5\u9053\u4E86 </span>';
        } else {
            tips.style.cssText = 'display: none;position: fixed;z-index: 999;left: 0;top: 0;width: 100%;height: 100%;background: rgba(0,0,0,.9) url(http://icon.zol-img.com.cn/m/images/wechat-tips.png) no-repeat 100% 0;-webkit-background-size: 320px 416px;background-size: 320px 416px;';
            tips.innerHTML = '<span role="button" onclick="this.parentNode.style.display=\'none\';" style="position: relative;display: block;width: 192px;height: 32px;line-height: 32px;margin: 0 auto;top: 312px;border: 1px solid #fff;color: #fff;font-size: 15px;text-align: center;">\u6211\u77E5\u9053\u4E86 </span>';
        }
        document.body.appendChild(tips);
    }
    [].forEach.call(buttons, function(button) {
        var sibling = button.nextElementSibling || button.previousElementSibling, display = 'inline-block';
        if (sibling) {
            display = (sibling.currentStyle || document.defaultView.getComputedStyle(sibling))['display'];
        }
        button.style.display = display;
        button.addEventListener('click', function(e) {
            if (e) {
                e.preventDefault && e.preventDefault();
                e.preventManipulation && e.preventManipulation();
                e.preventMouseEvent && e.preventMouseEvent();
                e.returnValue = false;
            }
            tips.style.display = 'block';
        });
    });

    if (!window.WeixinShareData) {
        window.WeixinShareData = {
            appid: '',
            title: '',
            icon: '',
            description: '',
            url: ''
        };
        if (meta = document.querySelector('meta[name="wechat-appid"]'))
            WeixinShareData.appid = meta.getAttribute('content') || '';
        if (meta = document.querySelector('meta[name="wechat-title"]'))
            WeixinShareData.title = meta.getAttribute('content') || document.title || '';
        if (meta = document.querySelector('meta[name="wechat-icon"]'))
            WeixinShareData.icon = meta.getAttribute('content') || '';
        else if (meta = document.querySelector('link[rel="apple-touch-icon"]'))
            WeixinShareData.icon = meta.getAttribute('href') || '';
        if (meta = document.querySelector('meta[name="wechat-content"]'))
            WeixinShareData.description = meta.getAttribute('content') || '';
        else if (meta = document.querySelector('meta[name="description"]'))
            WeixinShareData.description = meta.getAttribute('content') || '';
        if (meta = document.querySelector('meta[name="wechat-url"]'))
            WeixinShareData.url = meta.getAttribute('content') || location.href || '';
        else
            WeixinShareData.url = location.href || '';
    }

    if (WeixinShareData.icon) {
        var icon = document.createElement('img');
        icon.src = WeixinShareData.icon;
        icon.style.cssText = 'display:block;position:absolute;pointer-events:none;width:300px;height:300px;opacity:0;z-index:-2';
        icon.width = 300;
        icon.height = 300;
        document.body.insertBefore(icon, document.body.firstChild);
    }
    if (WeixinShareData.title && WeixinShareData.title !== document.title) {
        window.addEventListener('load', function () {
            setTimeout(function () {
                document.title = WeixinShareData.title;
            }, 1000);
        });
    }
})();

// ZOL瀹㈡埛绔鐞�
/ZOL/i.test(navigator.userAgent) && (function() {
    if (WeixinShareData.icon) {
        var icon = document.createElement('img');
        icon.src = WeixinShareData.icon;
        icon.style.cssText = 'display:block;position:absolute;pointer-events:none;width:300px;height:300px;opacity:0;z-index:-2';
        icon.width = 300;
        icon.height = 300;
        document.body.insertBefore(icon, document.body.firstChild);
    }
    if (WeixinShareData.title && WeixinShareData.title !== document.title) {
        window.addEventListener('load', function () {
            setTimeout(function () {
                document.title = WeixinShareData.title;
            }, 1000);
        });
    }
})();