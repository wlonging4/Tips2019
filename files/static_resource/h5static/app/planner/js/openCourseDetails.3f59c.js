webpackJsonp([11],{353:function(s,a,t){s.exports=t(354)},354:function(s,a,t){"use strict";t(355);var n=t(12),e=function(s){return s&&s.__esModule?s:{default:s}}(n),o=t(6),l=(0,e.default)("#wrapper"),i={getData:function(s){return o.Tools.AJAXTOKEN({url:o.G.base+"/capp/openClassController/openClassDetail.ason",type:"post",data:{classId:s}})},renderHtml:function(s){var a="";return s&&s.openClassDetail&&(a='<div class="content">\n            <h2>'+s.openClassDetail.title+"</h2>\n            <h3>"+s.openClassDetail.subTitle+'</h3>\n            <div class="item item-course">\n                <p class="course-des">'+s.openClassDetail.classInfo+'</p>\n                <div class="lecturer-box">\n                    <img src="'+s.openClassDetail.teacherHead+'" alt="" class="lecturer-pic">\n                    <p class="lecturer-name">讲师：<span>'+s.openClassDetail.teacher+'</span></p>\n                    <p class="lecturer-des">'+s.openClassDetail.teacherInfo+"</p>\n                </div>\n            </div>\n            "+(s.openClassDetail.playPassword?'<div class="item item-info">\n                <a href="javascript:void (0);" class="copy-btn" data-clipboard-target="#copyContent" onclick="">复制</a><i class="icon icon-lock"></i><span class="item-title">播放密码</span><span class="item-content" id="copyContent">'+s.openClassDetail.playPassword+"</span>\n            </div>":"")+'\n            <div class="item item-info">\n                <i class="icon icon-play"></i><span class="item-title">开讲时间</span><span class="item-content">'+s.openClassDetail.startTime+'</span>\n            </div>\n            <div class="item item-info">\n                <i class="icon icon-clock"></i><span class="item-title">课程时长</span><span class="item-content">'+s.openClassDetail.duration+'</span>\n            </div>\n        </div>\n        <div class="footer">\n        '+("1"==s.openClassDetail.classType?1==s.applyStatus?'<a href="javascript:void(0)">已预约</a>':'<a href="javascript:void(0)" id="appoint">去预约</a>':'<a href="'+s.openClassDetail.playUrl+'">去观看</a>')+"\n            \n        </div>"),a},copyPassword:function(){(0,e.default)(document).on("click",".copy-btn",function(){var s=(0,e.default)("#copyContent").html();o.Tools.BRIDGE("xhOpenAppPasteboard",{content:s}),o.Tools.toast("已复制到剪切板")})},bindEvent:function(s){(0,e.default)(document).on("click","#appoint",function(){var a=(0,e.default)(this);a.hasClass("disabled")||o.Tools.dialogConfirm({title:"是否预约",content:"预约后，公开课开播前会给您发送推送<br/>通知，提醒您观看",cancel:"取消",confirm:"预约",confirmCB:function(){var t=this;return o.Tools.AJAXTOKEN({url:o.G.base+"/capp/openClassController/openClassApply.ason",type:"post",data:{classId:s}}).then(function(s){if(t.close().remove(),1!=s.code)return o.Tools.toast(s.msg);o.Tools.toast("预约成功"),a.html("已预约"),a.addClass("disabled")}),!1}})})},init:function(){var s=this,a=o.Tools.queryUrl(location.href),t=a.classId;if(o.Tools.setTitle("星火公开课"),!t)return o.Tools.toast("缺少参数classId");this.getData(t).then(function(a){if("0"==a.code)return o.Tools.toast(a.msg);var n=a.data,e=i.renderHtml(n);l.html(e),s.copyPassword(),"1"==n.openClassDetail.classType&&0==n.applyStatus&&s.bindEvent(t)})}};i.init()},355:function(s,a){}},[353]);