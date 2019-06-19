import "../css/openCourseDetails.less";
import $ from 'jquery'
import {Tools, G, Dialog} from "COMMON/js/common";
let wrapperDom = $("#wrapper");
let COURSEDETAILS = {
    getData:function (classId) {
        return Tools.AJAXTOKEN({
            url:G.base + "/capp/openClassController/openClassDetail.ason",
            type:"post",
            data:{
                classId:classId
            }
        });
    },
    renderHtml:function (data) {
        let html = ``;
        if(data && data.openClassDetail){
            html = `<div class="content">
            <h2>${data.openClassDetail.title}</h2>
            <h3>${data.openClassDetail.subTitle}</h3>
            <div class="item item-course">
                <p class="course-des">${data.openClassDetail.classInfo}</p>
                <div class="lecturer-box">
                    <img src="${data.openClassDetail.teacherHead}" alt="" class="lecturer-pic">
                    <p class="lecturer-name">讲师：<span>${data.openClassDetail.teacher}</span></p>
                    <p class="lecturer-des">${data.openClassDetail.teacherInfo}</p>
                </div>
            </div>
            ${data.openClassDetail.playPassword ? `<div class="item item-info">
                <a href="javascript:void (0);" class="copy-btn" data-clipboard-target="#copyContent" onclick="">复制</a><i class="icon icon-lock"></i><span class="item-title">播放密码</span><span class="item-content" id="copyContent">${data.openClassDetail.playPassword}</span>
            </div>`:''}
            <div class="item item-info">
                <i class="icon icon-play"></i><span class="item-title">开讲时间</span><span class="item-content">${data.openClassDetail.startTime}</span>
            </div>
            <div class="item item-info">
                <i class="icon icon-clock"></i><span class="item-title">课程时长</span><span class="item-content">${data.openClassDetail.duration}</span>
            </div>
        </div>
        <div class="footer">
        ${data.openClassDetail.classType == '1'  ? (data.applyStatus == 1 ? `<a href="javascript:void(0)">已预约</a>`: `<a href="javascript:void(0)" id="appoint">去预约</a>`) :`<a href="${data.openClassDetail.playUrl}">去观看</a>`}
            
        </div>`
        }
        return html;
    },
    copyPassword:function () {
        $(document).on("click", ".copy-btn", function () {
            let copyContent = $("#copyContent").html();
            Tools.BRIDGE('xhOpenAppPasteboard', {
                content:copyContent
            });
            Tools.toast("已复制到剪切板");
        });
    },
    bindEvent:function (classId) {
        $(document).on("click", "#appoint", function () {
            let btn = $(this);
            if(!btn.hasClass("disabled")){
                Tools.dialogConfirm({
                    title:"是否预约",
                    content:"预约后，公开课开播前会给您发送推送<br/>通知，提醒您观看",
                    cancel:"取消",
                    confirm:"预约",
                    confirmCB:function () {
                        let dialog = this;

                        Tools.AJAXTOKEN({
                            url: G.base + "/capp/openClassController/openClassApply.ason",
                            type:"post",
                            data:{
                                classId:classId
                            }
                        }).then(function (data) {
                            dialog.close().remove();

                            if(data.code == 1){
                                Tools.toast("预约成功");
                                btn.html("已预约");
                                btn.addClass("disabled");
                            }else{
                                return Tools.toast(data.msg)
                            }

                        });
                        return false;
                    }
                });
            }

        });
    },
    init:function () {
        let self = this,
            params = Tools.queryUrl(location.href),
            classId = params.classId;
        Tools.setTitle("星火公开课");

        if(!classId){
            return Tools.toast("缺少参数classId")
        }
        this.getData(classId).then(function (data) {
            if(data.code == "0"){
                return Tools.toast(data.msg)
            }
            let renderData = data.data;
            let html = COURSEDETAILS.renderHtml(renderData);
            wrapperDom.html(html);

            self.copyPassword();
            if(renderData.openClassDetail.classType == '1' && renderData.applyStatus == 0){
                self.bindEvent(classId);
            }
        })
    }
};

COURSEDETAILS.init();


