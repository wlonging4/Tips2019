/**
 * common 公用模块 包含 babel-polyfill jquery flexible 还有一些第三方的工具等
 * refresh 下拉刷新
 * **/

module.exports = [
    {
        name: 'openCourse',
        des:'公开课列表页面',
        project:"planner",
        html: 'app/planner/pages/openCourse.html',
        jsEntry: ['app/planner/js/openCourse.js'],
        chunks:["common", 'refresh']
    },
    {
        name: 'openCourseDetails',
        des:'公开课列表页面',
        project:"planner",
        html: 'app/planner/pages/openCourseDetails.html',
        jsEntry: ['app/planner/js/openCourseDetails.js'],
        chunks:["common", "clipboard"]
    },
    {
        name: 'productDetailsLTB',
        des:'零投宝产品详情页',
        project:"planner",
        html: 'app/planner/pages/productDetailsLTB.html',
        jsEntry: ['app/planner/js/productDetailsLTB.js'],
        chunks:["common"]
    },
    {
        name: 'productDetailsZXB',
        des:'自选标产品详情页',
        project:"planner",
        html: 'app/planner/pages/productDetailsZXB.html',
        jsEntry: ['app/planner/js/productDetailsZXB.js'],
        chunks:["common"]
    },
    {
        name: 'productDetailsYYB',
        des:'月盈宝产品详情页',
        project:"planner",
        html: 'app/planner/pages/productDetailsYYB.html',
        jsEntry: ['app/planner/js/productDetailsYYB.js'],
        chunks:["common", "iosSelect"]
    },
    {
        name: 'productDetailsDZ',
        des:'私人定制产品详情页',
        project:"planner",
        html: 'app/planner/pages/productDetailsDZ.html',
        jsEntry: ['app/planner/js/productDetailsDZ.js'],
        chunks:["common"]
    },
    {
        name: 'productDetailsXXL',
        des:'星系列产品详情页',
        project:"planner",
        html: 'app/planner/pages/productDetailsXXL.html',
        jsEntry: ['app/planner/js/productDetailsXXL.js'],
        chunks:["common"]
    },
    {
        name: 'riskInfo',
        des:'风险信息测评页',
        project:"planner",
        html: 'app/planner/pages/riskInfo.html',
        jsEntry: ['app/planner/js/riskInfo.js'],
        chunks:["common"]
    },
    {
        name: 'blank',
        des:'空白页',
        project:"planner",
        html: 'app/planner/pages/blank.html',
        jsEntry: [],
        chunks:["common"]
    },
    {
        name: 'shareShop',
        des:'工作室_邀请注册_分享注册',
        project:"planner",
        html: 'app/planner/pages/shareShop.html',
        jsEntry: ['app/planner/js/shareShop.js'],
        chunks:["common"]
    },
    {
        name: 'paymentLimit',
        des:'支付限额表',
        project:"planner",
        html: 'app/planner/pages/paymentLimit.html',
        jsEntry: ['app/planner/js/paymentLimit.js'],
        chunks:["common"]
    },
    {
        name: 'appYueyingbaoRule',
        des:'APP月盈宝回款规则',
        project:"planner",
        html: 'app/planner/pages/appYueyingbaoRule.html',
        chunks:["common"]
    },
    {
        name: 'staffProtocolApp',
        des:'APP合作协议书',
        project:"planner",
        html: 'app/planner/pages/staffProtocolApp.html',
        jsEntry: ['app/planner/js/staffProtocolApp.js'],
        chunks:["common"]
    },
    {
    	name: 'securityMechanism',
        des:'安全保障',
        project:"planner",
        html: 'app/planner/pages/securityMechanism.html',
        jsEntry: ["app/planner/js/securityMechanism.js"],
        chunks:["common"]
    },
    {
    	name: 'appCommission',
        des:'推荐服务费',
        project:"planner",
        html: 'app/planner/pages/appCommission.html',
        jsEntry: ["app/planner/js/appCommission.js"],
        chunks:["common"]
    },
    {
        name: 'productLinkContent',
        des:'项目亮点&风险揭示',
        project:"planner",
        html: 'app/planner/pages/productLinkContent.html',
        jsEntry: ['app/planner/js/productLinkContent.js'],
        chunks:["common"]
    },
    {
        name: 'invitationRegister',
        des:'邀请注册',
        project:"planner",
        html: 'app/planner/pages/invitationRegister.html',
        jsEntry: ['app/planner/js/invitationRegister.js'],
        chunks:["common"]
    },
    {
    	name: 'invitationRegisterQRCode',
        des:'工作室二维码',
        project:"planner",
        html: 'app/planner/pages/invitationRegisterQRCode.html',
        jsEntry: ['app/planner/js/invitationRegisterQRCode.js'],
        chunks:["common"]
    },
    {
    	name: 'appManagerAbout',
        des:'关于星火',
        project:"planner",
        html: 'app/planner/pages/appManagerAbout.html',
        jsEntry: ['app/planner/js/appManagerAboutBindAbout.js','app/planner/js/appManagerAboutTitle.js'],
        chunks:["common"]
    },
    {
    	name: 'appManagerKnow',
        des:'了解星火金服',
        project:"planner",
        html: 'app/planner/pages/appManagerAbout.html',
        jsEntry: ['app/planner/js/appManagerAboutBindAbout.js','app/planner/js/appManagerKnowTitle.js'],
        chunks:["common"]
    },
    {
    	name: 'appManagerIntroduce',
        des:'星火介绍',
        project:"planner",
        html: 'app/planner/pages/appManagerIntroduce.html',
        jsEntry: ['app/planner/js/appManagerAboutBindIntroduce.js'],
        chunks:["common"]
    },
    {
    	name: 'appManagerIntroduceShare',
        des:'星火介绍分享',
        project:"planner",
        html: 'app/planner/pages/appManagerIntroduceShare.html',
        jsEntry: ['app/planner/js/appManagerIntroduceShare.js'],
        chunks:["common"]
    },
    {
    	name: 'noviceGuide',
        des:'新手理财师指引',
        project:"planner",
        html: 'app/planner/pages/noviceGuide.html',
        jsEntry: ['app/planner/js/noviceGuide.js'],
        chunks:["common"]
    },
    {
    	name: 'noviceGuideFinancial',
        des:'新手理财师指引',
        project:"planner",
        html: 'app/planner/pages/noviceGuideFinancial.html',
        jsEntry: ['app/planner/js/noviceGuideFinancial.js'],
        chunks:["common"]
    },
    {
        name: 'activity2019q1PlannerUpdate',
        des:'星火理财师APP改版介绍',
        project:"activity",
        html: 'app/activity/2019q1/pages/plannerUpdate.html',
        jsEntry: [],
        chunks:["common"]
    },
    {
        name: 'activity2019q1xxlNotice',
        des:'星系列又添新成员',
        project:"activity",
        html: 'app/activity/2019q1/pages/xxlNotice.html',
        jsEntry: [],
        chunks:["common"]
    },
    {
        name: 'activity2019q1studioUpdate',
        des:'星系列又添新成员',
        project:"activity",
        html: 'app/activity/2019q1/pages/studioUpdate.html',
        jsEntry: [],
        chunks:[""]
    }

];
