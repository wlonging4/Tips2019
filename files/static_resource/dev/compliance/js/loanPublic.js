var loan={
	msgDialog:function(msgString){
		if(msgString=="" || msgString==null || msgString==undefined){
			return;
		}
		var self=this;
		var msgBoxObj=$(".tipsOvrly");
		msgBoxObj.find(".ovrlyWord").html(msgString);
		msgBoxObj.addClass("tipsOvrlyShow");
		setTimeout(self.msgDialogHide,2000);
	},
	msgDialogHide:function(){
		var msgBoxObj=$(".tipsOvrly");
		msgBoxObj.removeClass("tipsOvrlyShow");
	},
	loadingShow:function(){
		var loadingObj=$(".loadingDiv");
		loadingObj.removeClass("hidden");
		loadingObj.addClass("show");
	},
	loadingHidden:function(){
		var loadingObj=$(".loadingDiv");
		loadingObj.removeClass("show");
		loadingObj.addClass("hidden");
	},
	getQueryString:function(name){
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	    var r = window.location.search.substr(1).match(reg);
	    if (r != null) return unescape(r[2]);
	    return null;
	},
    /*
模版引擎
options包含template必选,obj必选,container可选,callback可选
 */
    templateEngine : function(options) {
        var html, obj;
        if(!options.template || !options.obj){
            alert("参数错误");
            return false;
        }
        html = options.template;
        obj = options.obj;
        var re = /<%(.+?)%>/g,
            reExp = /(^( )?(var|if|for|else|switch|case|break|default|{|}|;))(.*)?/g,
            code = 'with(obj) { var r=[];\n',
            cursor = 0,
            result;
        var add = function(line, js) {
            js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
            return add;
        }
        while(match = re.exec(html)) {
            add(html.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }
        add(html.substr(cursor, html.length - cursor));
        code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, ' ');
        try { result = new Function('obj', code).apply(obj, [obj]); }
        catch(err) { console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n"); }
        if(options.container){
            $(options.container).html(result);
            if(typeof options.callback === "function"){
                options.callback();
            }
        }else{
            return result;
        }
    },

}
