/***
Metronic AngularJS App Main Script
***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router", 
    "ui.bootstrap", 
    "oc.lazyLoad",  
    "ngSanitize",
    'datatables'
]);
var version = '?20161213';
/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);
MetronicApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
}]);
var siteVar = {
    basicUrl : 'http://xinghuocube.creditease.corp/',
    serverUrl: 'http://xinghuocube.creditease.corp/api/'
};
//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);
/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        layoutImgPath: Metronic.getAssetsPath() + 'admin/layout/img/',
        layoutCssPath: Metronic.getAssetsPath() + 'admin/layout/css/'
    };
    $rootScope.settings = settings;
    return settings;
}]);

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', '$state',function($scope, $rootScope, $state) {
    $scope.$on('$viewContentLoaded', function() {
        Metronic.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive
        if(!jQuery.ajaxSettings.xhrFields){
            jQuery.ajaxSettings.xhrFields = {withCredentials: true};
        }
        if(!jQuery.ajaxSettings.error){
            jQuery.ajaxSettings.error = function(XMLHttpRequest){
                if(XMLHttpRequest.readyState == 0){
                    $.cookie("cube_uuid",'', { expires: -1 });
                    $.cookie("cube_token",'', { expires: -1 });
                    localStorage.removeItem("menuinfo");
                    $.cookie("realname",'', { expires: -1 });
                    $state.go("welcome");
                }
            };
        }
        var loadingArr = [];
        if(!jQuery.ajaxSettings.beforeSend){
            jQuery.ajaxSettings.beforeSend = function(){
                loadingArr.push("loading");
                if($("#xinghuoLoading").length == 0){
                    $("body").append('<div id="xinghuoLoading"><img src="assets/admin/layout/img/xinghuoloading.gif" /></div>');
                }
            }
        }
        if(!jQuery.ajaxSettings.complete) {
            jQuery.ajaxSettings.complete = function(){
                loadingArr.pop();
                if(loadingArr.length == 0 && $("#xinghuoLoading").length > 0){
                    $("#xinghuoLoading").remove();
                }
            }
        }
    });
}]);
/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope', function($scope) {
    $scope.realname = $.cookie("realname");
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
        $scope.loginOut = function(){
            $.cookie("cube_uuid",'', { expires: -1 });
            $.cookie("cube_token",'', { expires: -1 });
            $.cookie("realname",'', { expires: -1 });
            localStorage.removeItem("menuinfo");
            location.href = siteVar.serverUrl+"logout.shtml";
        }
    });
    //websocket连接
    $(function() {
        if(typeof(WebSocket) == "undefined") {
            alert("您的浏览器不支持WebSocket连接");return;
        }
        if(!window.Notification){
            alert('您的浏览器不支持消息提醒');return;
        }
        function twoNum(str) {
            var num = parseInt(str);
            return num<10? "0"+num : ""+num;
        };
        function toJSdate(s){
            var self = this;
            if(!s) return "";
            var D = new Date(s);
            var date = [D.getFullYear(), twoNum(D.getMonth()+1), twoNum(D.getDate())];
            var time = D.toTimeString().split(" ")[0];
            return date.join("-")+" "+time;
        };
        var imgUrl='./favicon.ico';
        var timer = null, count = 1000;
        var popNotice = function(tit,con,icon,hrefType,params) {
                count += 1000;
                if(count > 21000){
                    count = 1000;
                }
                timer = setTimeout(function () {
                    var notification = new Notification(tit, {
                        body: con,
                        icon: icon
                    });
                    console.log('pop~')
                    var nowHref;
                    notification.onclick = function() {
                        $.ajax({
                            url: siteVar.serverUrl + "messageRemind/updateReadStatus.json",
                            type: "POST",
                            data: {'messageRemindId':params.id},
                            success: function (data) {
                                if (data.success) {
                                    console.log("修改成功");
                                    //创建定制
                                    if(hrefType==3){
                                        nowHref='javascript:;'
                                    }
                                    //交易失败
                                    if(hrefType==2){
                                        nowHref=siteVar.basicUrl+"#/tradeSheet.html?&lenderId="+params.lenderId+"&createTime="+toJSdate(params.createTime);
                                    }
                                    //开户记录
                                    if(hrefType==1){
                                        nowHref=siteVar.basicUrl+"#/userAddManage.html?&registerTimeStart="+params.newUserBeginTime+"&registerTimeEnd="+params.newUserEndTime;
                                    }
                                    if(hrefType!==3){
                                        window.open(nowHref);
                                    }
                                    notification.close();
                                } else {
                                    console.log("修改失败");
                                }
                            }
                        });
                    };
                    //clearTimeout(timer);
                }, count);
        };

        function wsConnect(){
            var socket;
            socket = new WebSocket("ws://"+siteVar.serverUrl.split('//')[1]+"webSocketServer");
            socket.onopen = function() {
                console.log("Socket 连接已打开");
            };
            socket.onmessage = function(msg) {
                var params=JSON.parse(msg.data);
                console.log(params);
                console.log("有新消息推送~~");
                if (Notification.permission == "granted") {
                    popNotice((params.type==1?'新用户注册成功 ':(params.type==2?'用户交易失败 ':'理财师创建私人订制 '))+params.remindTime,params.content+(params.type==1?'。点击查看用户注册详情':(params.type==2?'。 点击查看交易失败用户订单详情':'。')),imgUrl,params.type,params);
                } else if (Notification.permission != "denied") {
                    Notification.requestPermission(function (permission) {
                        popNotice((params.type==1?'新用户注册成功 ':(params.type==2?'用户交易失败 ':'理财师创建私人订制 '))+params.remindTime,params.content+(params.type==1?'。点击查看用户注册详情':(params.type==2?'。 点击查看交易失败用户订单详情':'。')),imgUrl,params.type,params);
                    });
                } else{
                    alert('请打开浏览器消息通知权限~~');return;
                }
            };
            socket.onclose = function() {
                console.log("Socket 连接已关闭");
                wsConnect();
                return;
            };
            socket.onerror = function() {
                console.log("Socket 连接错误");
                return;
            };
        }
        wsConnect();
    });
}]);

/**
 * type=file 的指令**/
MetronicApp.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                });
            });
        }
    }
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope','$rootScope', function($scope) {
    try{
        var data = JSON.parse(localStorage.menuinfo);
        for(var i in data){
            for(var m in data[i].childMenus){
                data[i].childMenus[m].resUrl = data[i].childMenus[m].resUrl.split("/")[2];
            }
        }
        $scope.menu = data;
    }catch(e){
        console.log(e);
    }
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar(); // init sidebar
    });
}]);
/* Setup Layout Part - Quick Sidebar */
MetronicApp.controller('QuickSidebarController', ['$scope', function($scope) {    
    $scope.$on('$includeContentLoaded', function() {
        setTimeout(function(){
            QuickSidebar.init(); // init quick sidebar        
        }, 2000)
    });
}]);
/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', ['$scope', function($scope) {    
    $scope.$on('$includeContentLoaded', function() {
        Demo.init(); // init theme panel
    });
}]);
/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);
/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/welcome.html");
    //$stateProvider.state('welcome',{url: 'welcome.html',templateUrl:siteVar.basicUrl+'apps/tpl/welcome.html',data:{pageTitle:'Welcome'}})
    $stateProvider
        .state('welcome',{
            url: '/welcome.html',
            templateUrl: siteVar.basicUrl+'apps/tpl/welcome.html',
            data: {pageTitle: 'Welcome'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/js/welcome.js' + version
                        ]
                    }])
                }]
            }
        })
        /*
        * 配置中心
        * */
        .state('siteSetting-param',{
            url: '/param.html',
            templateUrl: siteVar.basicUrl + "apps/modules/siteSetting/param.html" + version,
            data: {pageTitle: '参数设置'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/siteSetting/param.js' + version
                        ]
                    }]);
                }]
            }
        })
        .state('siteSetting-taskList',{
            url: '/taskList.html',
            templateUrl: siteVar.basicUrl + "apps/modules/siteSetting/taskList.html" + version,
            data: {pageTitle: '定时任务执行'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/siteSetting/taskList.js' + version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                        ]
                    }]);
                }]
            }
        })
        .state('siteSetting-taskExecution',{
            url: '/taskExecution.html',
            templateUrl: siteVar.basicUrl + "apps/modules/siteSetting/taskExecution.html" + version,
            data: {pageTitle: '定时任务'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/siteSetting/taskExecution.js' + version,
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('siteSetting-ftp',{
            url: '/ftp.html',
            templateUrl: siteVar.basicUrl + "apps/modules/siteSetting/addftp.html" + version,
            data: {pageTitle: 'FTP配置'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/siteSetting/addftp.js' + version
                        ]
                    }]);
                }]
            }
        })
        .state('siteSetting-product',{
            url: '/productDays.html',
            templateUrl: siteVar.basicUrl + "apps/modules/siteSetting/product.html" + version,
            data: {pageTitle: '特殊产品天数配置'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/siteSetting/product.js' + version
                        ]
                    }]);
                }]
            }
        })
        .state('siteSetting-ftpCycle',{
            url: '/ftpCycle.html',
            templateUrl: siteVar.basicUrl + "apps/modules/siteSetting/ftpCycle.html" + version,
            data: {pageTitle: 'FTP周期配置'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/siteSetting/ftpCycle.js' + version
                        ]
                    }]);
                }]
            }
        })
    /*
    数据报表
     */
        .state('dataReport-userAnalyze',{
            url: '/userAnalyze.html',
            templateUrl: siteVar.basicUrl + "apps/modules/dataReport/userAnalyze.html" + version,
            data: {pageTitle: '用户分析'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/dataReport/userAnalyze.js' + version,
                            siteVar.basicUrl+'assets/global/plugins/echarts/echarts.common.min.js'
                        ]
                    }]);
                }]
            }
        })
        .state('dataReport-dealAnalyze',{
            url: '/dealAnalyze.html',
            templateUrl: siteVar.basicUrl + "apps/modules/dataReport/dealAnalyze.html" + version,
            data: {pageTitle: '交易分析'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/dataReport/dealAnalyze.js' + version,
                            siteVar.basicUrl+'assets/global/plugins/echarts/echarts.common.min.js'
                        ]
                    }]);
                }]
            }
        })
        .state('dataReport-ehrinfo',{
            url: '/ehrinfo.html',
            templateUrl: siteVar.basicUrl + "apps/modules/dataReport/ehrinfo.html" + version,
            data: {pageTitle: '宜信员工'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/dataReport/ehrinfo.js' + version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl+'assets/global/plugins/echarts/echarts.common.min.js'
                        ]
                    }]);
                }]
            }
        })
        /*
        * 线索沟通记录管理
        * */
        .state('linkupRecord-clientRecord',{
            url: '/clientRecord.html',
            templateUrl: siteVar.basicUrl + "apps/modules/linkupRecord/clientRecord.html" + version,
            data: {pageTitle: '客户线索池管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/linkupRecord/clientRecord.js' + version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        /*
         * 线索沟通记录管理-----管理员
         * */
        .state('linkupRecord-adminClientRecord',{
            url: '/adminClientRecord.html',
            templateUrl: siteVar.basicUrl + "apps/modules/linkupRecord/adminClientRecord.html" + version,
            data: {pageTitle: '客户线索池管理-管理员'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/linkupRecord/adminClientRecord.js' + version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        /*
         * 线索沟通记录管理-----人员管理
         * */
        .state('linkupRecord-personnelManage',{
            url: '/personnelManage.html',
            templateUrl: siteVar.basicUrl + "apps/modules/linkupRecord/personnelManage.html" + version,
            data: {pageTitle: '客户线索池管理--人员管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/linkupRecord/personnelManage.js' + version
                        ]
                    }]);
                }]
            }
        })
        /**
         * 初筛沟通记录
         * **/
        .state('linkupRecord-editScreen',{
            url: '/editScreen.html',
            templateUrl: siteVar.basicUrl + "apps/modules/linkupRecord/editScreen.html" + version,
            data: {pageTitle: '客户线索池管理--初筛沟通记录'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/linkupRecord/editScreen.js' + version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css'

                        ]
                    }]);
                }]
            }
        })
        /**
         * 理财师沟通记录
         * **/
        .state('linkupRecord-editWealthManager',{
            url: '/editWealthManager.html',
            templateUrl: siteVar.basicUrl + "apps/modules/linkupRecord/editWealthManager.html" + version,
            data: {pageTitle: '客户线索池管理--理财师沟通记录'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/linkupRecord/editWealthManager.js' + version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css'
                        ]
                    }]);
                }]
            }
        })
        /**
         * 沟通记录详情
         * **/
        .state('linkupRecord-recordInfo',{
            url: '/recordInfo.html',
            templateUrl: siteVar.basicUrl + "apps/modules/linkupRecord/recordInfo.html" + version,
            data: {pageTitle: '客户线索池管理--沟通记录详情'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/linkupRecord/recordInfo.js' + version
                        ]
                    }]);
                }]
            }
        })
        .state('tradeSheet',{
            url: '/tradeSheet.html',
            templateUrl: siteVar.basicUrl + "apps/modules/salesSupport/tradeSheet.html" + version,
            data: {pageTitle: '交易单查询'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/salesSupport/tradeSheet.js' + version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /**
         * 销售支持人员管理
         * **/
        .state('salesManage',{
            url: '/salesManage.html',
            templateUrl: siteVar.basicUrl + "apps/modules/salesSupport/salesManage.html" + version,
            data: {pageTitle: '销支人员管理--主页'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/salesSupport/salesManage.js' + version
                        ]
                    }]);
                }]
            }
        })
        /**
         * 销售支持人员添加/编辑
         * **/
        .state('salesEdit',{
            url: '/salesEdit.html',
            templateUrl: siteVar.basicUrl + "apps/modules/salesSupport/salesEdit.html" + version,
            data: {pageTitle: '销支人员管理--编辑'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/salesSupport/salesEdit.js' + version
                        ]
                    }]);
                }]
            }
        })
        .state('logManage',{
            url: '/logManage.html',
            templateUrl: siteVar.basicUrl + "apps/modules/salesSupport/logManage.html" + version,
            data: {pageTitle: '日志管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/salesSupport/logManage.js' + version,
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                        ]
                    }]);
                }]
            }
        })
        .state('arrangement',{
            url: '/arrangement.html',
            templateUrl: siteVar.basicUrl + "apps/modules/salesSupport/arrangement.html" + version,
            data: {pageTitle: '分配管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/salesSupport/arrangement.js' + version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /**
         * 销支系统
         * 新增用户管理
         * **/
        .state('userAddManage',{
            url: '/userAddManage.html',
            templateUrl: siteVar.basicUrl + "apps/modules/salesSupport/userAddManage.html" + version,
            data: {pageTitle: '新增用户管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/salesSupport/userAddManage.js' + version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /**
         * 销支系统
         * 新增用户管理
         * **/
        .state('infoNotice',{
            url: '/infoNotice.html',
            templateUrl: siteVar.basicUrl + "apps/modules/salesSupport/infoNotice.html" + version,
            data: {pageTitle: '消息提醒'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/salesSupport/infoNotice.js' + version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /**
         * 销支系统
         * 理财经理数据管理
         * **/
        .state('salesSupport',{
            url: '/salesSupport.html',
            templateUrl: siteVar.basicUrl + "apps/modules/salesSupport/dataManage.html" + version,
            data: {pageTitle: '销支系统--理财经理数据管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/salesSupport/dataManage.js' + version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',

                        ]
                    }]);
                }]
            }
        })
        /**
         * 销支系统
         * 理财经理数据管理
         * 理财经理详情
         * **/
        .state('managerDetail',{
            url: '/managerDetail.html',
            templateUrl: siteVar.basicUrl + "apps/modules/salesSupport/managerDetail.html" + version,
            data: {pageTitle: '销支系统--理财经理数据管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/salesSupport/managerDetail.js' + version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css',
                            siteVar.basicUrl + 'assets/global/plugins/jqPaginator-1.2.1/jqpaginator.min.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',

                        ]
                    }]);
                }]
            }
        })

}]);
/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", function($rootScope, settings, $state) {
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$on('$stateChangeSuccess', function(){
        //if(!$.cookie("cube_uuid") && !$.cookie("cube_token")) {
        //    location.href = siteVar.serverUrl+"cubesso/index.shtml";
        //    return ;
        //}
    })
}]);
MetronicApp.factory('getSelectListFactory',['$q','tools',function($q,tools){
    var service = {};
    service.getSelectList = function(arr){
        var defer = $q.defer();
        var reqData = {
            'appReqData': {
                'keyNames': arr
            }
        };
        $.ajax({
            url: siteVar.serverUrl + 'fiancial/getSelectOption.json',
            method: 'POST',
            data: {
                data: JSON.stringify(reqData)
            }
        }).then(function(data){
            defer.resolve(data);
        },function(error){
            defer.reject(error);
        });
        return defer.promise;
    };
    return service;
}]);

//公用函数服务
MetronicApp.factory('tools',['$state',function($state){
    var tools = {
        /**
         * [datatables language setting]
         */
        dataTablesLanguage: {
            "sEmptyTable":     "没有任何数据",
            "sInfo":           "当前 _START_ 到 _END_ 共 _TOTAL_ 条数据",
            "sInfoEmpty":      "当前 0 到 0 共 0 条数据",
            "sInfoFiltered":   "(filtered from _MAX_ total 条数据)",
            "sLengthMenu":     "显示 _MENU_ 条数据",
            "sLoadingRecords": "加载中...",
            "sProcessing":     "数据加载中，请稍后...",
            "sSearch":         "查询:",
            "sZeroRecords":    "没有查询到匹配的记录",
            "oPaginate": {
                "sFirst":    "首页",
                "sLast":     "末页",
                "sNext":     "下一页",
                "sPrevious": "上一页"
            }
        },
        /**
         * [ajaxError ajax出错(500, 400)]
         * @param {[json]} [err] [错误信息]
         * @return {[type]} [description]
         */
        ajaxError: function ( err ) {
            console.log(err);
            alert("网络服务出错，请稍后再试！！");
        },
        /**
         * [twoNum 单数转多位数]
         * @param  {[String]} str [description]
         * @return {[String]}     [description]
         */
        twoNum: function (str) {
            var num = parseInt(str);
            return num<10? "0"+num : ""+num;
        },
        /**
         * [toJSDate 日期格式转换]
         * @param  {[String]} s [后台传来的时间格式]
         * @return {[String]}   [本地日期格式]
         */
        toJSDate: function(s){
            var self = this;
            if(!s) return "";
            var D = new Date(s);
            var date = [D.getFullYear(), self.twoNum(D.getMonth()+1), self.twoNum(D.getDate())];
            var time = D.toTimeString().split(" ")[0];
            return date.join("-")+" "+time;
        },
        /**
         * [toJSYMD 日期格式转换没有时间]
         * @param  {[String]} s [后台传来的时间格式]
         * @return {[String]}   [本地日期格式]
         */
        toJSYMD: function(s){
            var self = this;
            if(!s) return "";
            var D = new Date(s);
            var date = [D.getFullYear(), self.twoNum(D.getMonth()+1), self.twoNum(D.getDate())];
            //var time = D.toTimeString().split(" ")[0];
            return date.join("-");
        },
        /**
         * [toJSMD 日期格式转换没有年份没有时间]
         * @param  {[String]} s [后台传来的时间格式]
         * @return {[String]}   [本地日期格式]
         */
        toJSMD: function(s){
            var self = this;
            if(!s) return "";
            var D = new Date(s);
            var date = [ self.twoNum(D.getMonth()+1), self.twoNum(D.getDate())];
            //var time = D.toTimeString().split(" ")[0];
            return date.join("");
        },
        /**
         * [ajaxLocked ajax提交锁，防止重复提交]
         * @param  {[Object]} obj [触发ajax的DOM对象]
         * @return {[type]}       [description]
         */
        ajaxLocked: function (obj) {
            if($(obj).attr("key_ajax_lock") == "close"){
                return false;
            }
            $(obj).attr("key_ajax_lock", "close");
            return true;
        },
        /**
         * [ajaxOpened ajax提交锁释放，防止无法提交]
         * @param  {[Object]} obj [触发ajax的DOM对象]
         * @return {[type]}       [description]
         */
        ajaxOpened: function (obj) {
            $(obj).attr("key_ajax_lock", "open");
        },
        /**
         * [createModal 创建公用弹层框]
         * @return {[type]} [description]
         */
        createModal: function () {
            if(!$("#js_dialog").length){
                $("body").append($("<div>",{
                    "id": "js_dialog",
                    "class": "modal fade ui_modal_long",
                    "tabindex": "-1",
                }).html('<div class="modal-dialog js_content"></div>'))
            }
        },
        /**
         * [createModal 创建修改密码弹层框]
         * @return {[type]} [description]
         */
        createModalUser: function () {
            if(!$("#js_dialog_passport").length){
                $("body").append($("<div>",{
                    "id": "js_dialog_passport",
                    "class": "modal fade",
                    "tabindex": "-1",
                    "style": "width: 700px; left: 50%; margin-left: -350px; top: 20%;"
                }).html('<div class="modal-dialog js_content"></div>'))
            }
        },
        /**
         * [createModalProgress 加载进度条]
         * @return {[type]} [description]
         */
        createModalProgress: function (){
            if(!$("#js_dialog_progress").length){
                var progress = '<div style="padding: 20px; border-radius: 8px; background-color: #ffffff;"><div class="progress progress-striped active" style="margin:0;"><div class="progress-bar progress-bar-success" '+
                    'role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span '+
                    'class="sr-only">80% Complete (danger)</span></div></div></div>';
                progress = '<span style="width:66px; height: 66px; border-radius: 33px;  display: inline-block; overflow: hidden;"><img src="'+ siteVar.basicUrl +'assets/global/img/loading2.gif" style="width:66px;">'
                $("body").append($("<div>",{
                    "id": "js_dialog_progress",
                    "class": "modal fade",
                    "tabindex": "-1"
                }).html('<div class="modal-dialog js_content" style="width: 500px; text-align: center;">'+progress+'</div>'));
            }
        },
        /**
         * [interceptor 权限拦截器]
         * @param  {[json]} data [ 服务器返回数据]
         * @return {[type]}      [description]
         */
        interceptor: function (data) {
            var KEY_CAN_PARSE_JSON = true, toData;
            if(typeof data == "string"){
                try {
                    toData = $.parseJSON(data);
                    KEY_CAN_PARSE_JSON = true;
                } catch(error) {
                    KEY_CAN_PARSE_JSON = false;
                    return true;
                } finally {
                    KEY_CAN_PARSE_JSON = true;
                }
                if(KEY_CAN_PARSE_JSON = true && !toData.success){
                    if(toData.errorcode == "101") return location.href = window.location.href = toData.data;
                    $("#js_dialog_permission .js_content").html('<span class="ui_red">'+toData.msg+'</span>');
                    $("#js_dialog_permission").modal("show");
                    return false;
                }
            }else{
                if(!data.success){
                    if(data.errorcode == "101") return window.location.href = data.data;
                    if(data.callback && typeof data.callback == "function"){
                        data.callback();
                    }
                    $("#js_dialog_permission .js_content").html('<span class="ui_red">'+data.msg+'</span>');
                    $("#js_dialog_permission").modal("show");
                    return false;
                }else{
                    return true;
                }
            }
        },
        /*
        *重置表格的宽度
        * */
        resetWidth: function(){
            var table = $("[datatable]");
            var container = $("#dataTables_wrapper");
            if(parseInt(table.css("width")) < parseInt(container.css("width"))){
                $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
            }
        },
        /**
         * [Validator 验证是否通过]
         * @param {[type]} obj [验证对象]
         * @return {[Boolean]} [验证结果]
         */
        Validator: function (obj) {
            var isSubmit = true;
            obj.each(function(){
                if(!$(this).trigger("blur",[1]).data("Validator")){
                    isSubmit=false;
                }
            })
            return isSubmit;
        },
        /**
         * [getFormele  遍历form表单的字段信息，拼接返回后端]
         * @param  {[json]} conf   [grid的默认json]
         * @param  {[object]} sel  [form选择器]
         * @param  {[json]} extend [可扩展的json，放特殊字段]
         * @return {[json]}        [返回json数据]
         */
        getFormele: function (conf, sel, extend) {
            var json = {};
            sel.find("input[name]").each(function (i, e){
                var type = $(this).attr("type");

                if(type == "radio" && !this.checked) return;
                if(type == "checkbox" && !this.checked) return;

                if(e.value && type != "checkbox"){
                    json[e.name] = e.value;
                }else if(e.value && type == "checkbox"){
                    json[e.name] = json[e.name] ? json[e.name] : [];
                    json[e.name].push(e.value);
                }
            });
            sel.find("select[name]").each(function (i, e){
                if(e.value){
                    json[e.name] = e.value;
                }
            });
            sel.find("textarea[name]").each(function (i ,e) {
                if(e.value){
                    json[e.name] = e.value;
                }
            })
            if(conf.order && conf.order[0] && conf.columns){
                json["orderColumn"] = conf.columns[conf.order[0]["column"]]["data"];
                json["orderType"] = conf.order[0]["dir"];
            }
            if(extend){
                $.extend(true, json, extend);
            }
            $.extend(true, conf, json);

            return conf;

        },
        /*
        序列化URL的参数
         */
        serializeUrl: function getArgs(str) {
            var args = {};
            var query = str;
            var pairs = query.split("&");
            for(var i = 0; i < pairs.length; i++) {
                var pos = pairs[i].indexOf('=');
                if (pos == -1) continue;
                var argname = pairs[i].substring(0,pos);// Extract the name
                var value = pairs[i].substring(pos+1);// Extract the value
                value = decodeURIComponent(value);// Decode it, if needed
                args[argname] = value;
            }
            return args;// Return the object
        },
        /**
         * 数字千分位 格式化
         * **/
        formatNumber: function(num){
            if (isNaN(num)) {
                throw new TypeError("num is not a number");
            }

            return ("" + num).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
        },
        /*金额大写转换*/
        toChineseCharacters: function(n) { //金额大写转换函数 n为字符串防止0开头的自动转换为二进制
            if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
                return "数据非法";
            var unit = "仟佰拾亿仟佰拾万仟佰拾元角分", str = "";
            n += "00";
            var p = n.indexOf('.');
            if (p >= 0){
                n = n.substring(0, p) + n.substr(p+1, 2);
            }
            unit = unit.substr(unit.length - n.length);
            for (var i=0; i < n.length; i++){
                str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
            }
            return str.replace(/零(仟|佰|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万/g, "$1").replace(/^元零?|零分/g, "").replace(/元$/g, "元整").replace(/^分$/g, "零元整");
        },
        /*
        深拷贝对象
         */
        extend : function(p,c){
            c = c || {};
            for (var i in p) {
                if(p.hasOwnProperty(i)){
                    if(typeof p[i] === 'object'){
                        c[i] = Array.isArray(p[i])? []:{};
                        this.extend(p[i],c[i]);
                    }else{
                        c[i] = p[i];
                    }
                }
            };
            return c;
        },
        /**
         * [export 导出公共方法]
         * @param  {[object]} obj [description]
         * @return {[type]}    	  [description]
         */
        export: function (obj) {
            var originalAction = $("#js_form").attr("action");
            $("#js_form").attr({"action": siteVar.serverUrl + $(obj).attr("action"), "method": "post"}).submit();
            $("#js_form").attr({"action": originalAction, "method": ""});
        },
        /*获取url参数集合*/
        queryUrl:function(url){
            var result = {}, arr, str, key, key_arr, len;
            if(url.indexOf('?') != -1){
                arr = url.split('?');
                str = arr[1];
                arr = str.split('&');
                len = arr.length;
                if(len > 0){
                    for(var i = 0;i < len; i++){
                        key = arr[i];
                        key_arr = key.split('=');
                        result[key_arr[0]] = key_arr[1];
                    };
                };
            };
            return result;
        }
    };
    return tools;
}]);