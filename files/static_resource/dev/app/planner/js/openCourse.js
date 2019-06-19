import "../css/openCourse.less";
import $ from 'jquery'
import {Tools, G, Dialog, CALC} from "COMMON/js/common";

/**
 * test test start**/
// function test1() {
//     let data = {"src":"5","sign":"27E81689FE9F04300E458EFB01451BE7","deviceVersion":"Android 9","versionName":"3.0.2","version":"2.0.0","deviceName":"MI MAX 3","orgId":"TROSR4VaMZAZyVqdqzVkvw==","versionCode":180,"token":"05f2b9609403440299ea4bdc693d2048:1","deviceIdentifier":"finance_c92e4b54-2f9e-4424-bf07-4f6edbfafc6a","orgCode":"3536363161393237313033623964343732643630","appid":"8aead9a64cc04916014cc049169d0000","sdkVersion":"28","appReqData":{}};
//     return Tools.AJAX({
//         url: G.base + "/capp/openClassController/topOpenClassList.ason",
//         type:"post",
//         data:{
//             data:JSON.stringify(data)
//         }
//     })
// }
// function test(num) {
//     let data = {"src":"5","sign":"89A719CFF754C46398DBA3029F40E397","deviceVersion":"Android 9","versionName":"3.0.2","version":"2.0.0","deviceName":"MI MAX 3","orgId":"TROSR4VaMZAZyVqdqzVkvw==","versionCode":180,"token":"05f2b9609403440299ea4bdc693d2048:1","deviceIdentifier":"finance_c92e4b54-2f9e-4424-bf07-4f6edbfafc6a","orgCode":"3536363161393237313033623964343732643630","appid":"8aead9a64cc04916014cc049169d0000","sdkVersion":"28","appReqData":{"pageNo":"1"}};
//     return Tools.AJAX({
//         url: G.base + "/capp/openClassController/openClassList.ason",
//         type:"post",
//         data:{
//             data:JSON.stringify(data)
//         }
//     })
// }


/**
 * test test wns**/


let listBox = $("#history-list");
let hot = $(".hot");
let hotBox = $(".hotbox");
let COURSE = {
    curPageNum:1,
    totalPage:Infinity,
    renderHot:function () {
        let self = this;

        // test1().then(function (data) {
        //     if(data.code == "0"){
        //         return Tools.toast(data.msg)
        //     }
        //     let info = data.data;
        //     if(info && info.topOpenClassList && info.topOpenClassList.length > 0){
        //         let item = info.topOpenClassList[0];
        //         let html = `<a href="openCourseDetails.html?classId=${item.classId}"><img src="${item.adUrl}" alt="${item.title}"></a>`;
        //         hot.html(html);
        //         self.setImgHeight();
        //         hotBox.show();
        //     }
        // });
        // return;
        Tools.AJAXTOKEN({
            url:G.base + "/capp/openClassController/topOpenClassList.ason",
            type:"post"
        }).then(function (data) {
            if(data.code == "0"){
                return Tools.toast(data.msg)
            }
            let info = data.data;
            if(info && info.topOpenClassList && info.topOpenClassList.length > 0){
                let item = info.topOpenClassList[0];
                let html = `<a href="openCourseDetails.html?classId=${item.classId}"><img src="${item.adUrl}" alt="${item.title}"></a>`;
                hot.html(html);
                self.setImgHeight();
                hotBox.show();
            }
        })
    },
    getData:function (pageNum) {
        // return test(pageNum)
        return Tools.AJAXTOKEN({
            url:G.base + "/capp/openClassController/openClassList.ason",
            type:"post",
            data:{
                pageNo:pageNum
            }
        })
    },
    renderHtml:function (data) {
        let html = ``;
        if(data && data.length > 0){
            html = data.map(item => `<li>
                    <a href="openCourseDetails.html?classId=${item.classId}"><img src="${item.adUrl}" alt="${item.title}"></a>
                </li>`).join("")
        }
        return html;
    },
    setImgHeight:(function () {//上传图片是375*112  但是要截取图片 375*100，
        let timer = null, maxH;
        return function () {
            if(maxH){//maxH 和timer 是同步的
                hot.css("max-height", maxH);
                $(".history-list li").css("max-height", maxH);
            }else{
                timer = setTimeout(function () {
                    let w = $(".history-list li").outerWidth();
                    maxH = CALC.div( CALC.mul(w, 100), 335);
                    maxH = parseInt(maxH);
                    hot.css("max-height", maxH);
                    $(".history-list li").css("max-height", maxH);
                }, 80);
            }
        }
    })(),
    init:function () {
        let self = this;

        Tools.setTitle("星火公开课");

        this.renderHot();
        let miniRefresh = new MiniRefresh({
            container: '#minirefresh',
            down: {
                isLock: true,
            },
            up: {
                isAuto: true,
                contentover: "松开加载数据",
                contentrefresh: "正在加载...",
                contentnomore: "已显示全部",
                offset:'10',
                toTop:{
                    isEnable:false
                },
                callback: function () {
                    self.getData(self.curPageNum).then(function (data) {
                        if(data.code == "0"){
                            return Tools.toast(data.msg)
                        }
                        let info = data.data;
                        let html = self.renderHtml(info.openClassList);
                        self.curPageNum = info.pageNo + 1;
                        listBox.append(html);

                        //截取图片
                        self.setImgHeight();

                        if (info.pageNo < info.totalPage) {
                            miniRefresh.endUpLoading(false);
                        } else {
                            miniRefresh.endUpLoading(true);
                        }
                    })
                }
            }
        });
    }
};

COURSE.init();




