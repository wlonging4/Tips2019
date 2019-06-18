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
var version = '?20190418';
var G = {
    static:"/admin/",
    server:"http://ghadmin.creditease.corp"
};
//image 图片的url
G.imagePath = G.server + '/resource';

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);

MetronicApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

}]);
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
    $rootScope.tabs = {};
    $scope.deleteTab = function (key, e) {
        delete $rootScope.tabs[key];
        return false;
    };
    $scope.$on('$viewContentLoaded', function() {
        Metronic.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive
        var loadingArr = [];
        if(!jQuery.ajaxSettings.xhrFields){
            jQuery.ajaxSettings.xhrFields = {withCredentials: true};
        }
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
MetronicApp.controller('HeaderController', ['$scope','tools', function($scope,tools) {
    $scope.realname = $.cookie("realname");
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
        $scope.loginOut = function(){
            tools.clearCookie();
        };
    });
}]);
/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope','$rootScope',"$http","$state","$timeout", function($scope, $rootScope, $http, $state,$timeout) {
    if(!!localStorage.getItem('menuinfo')){
        try{
            var data = JSON.parse(localStorage.getItem('menuinfo'));
            for(var i in data){
                for(var m in data[i].childMenus){
                    var temp = data[i].childMenus[m].resUrl.split("/");
                    data[i].childMenus[m].resUrl = temp[temp.length-1];
                }
            }
            $scope.menu = data;
        }catch(e){
            console.log(e);
        }
    }
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar(); // init sidebar
    });
    $scope.$on("$stateChangeSuccess", function(){
        $scope.current ="#" + $state.current.url;
        $timeout(function(){
            angular.forEach($scope.menu, function(item, index){
                var subItems = item.childMenus;
                angular.forEach(subItems, function(subItem, subIndex){
                    if(subItem.resUrl == $scope.current){
                        item.flag = true;
                    }
                })
            })
        }, 0);

        //console.log(2)

    })
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

/*
 获取枚举列表服务
 */
MetronicApp.factory('EnumeratorCollection',['$q','tools',function($q,tools){
    var service = {};
    service.getSelectList = function(str){
        var defer = $q.defer();
        $.ajax({
            url: G.server + '/enums/getEnums.json?values=' + str,
            method: 'GET',
        }).then(function(data){
            defer.resolve(data);
        },function(error){
            defer.reject(error);
        });
        return defer.promise;
    };
    return service;
}]);
/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/welcome");
    $stateProvider
        .state('welcome',{
            url: '/welcome',
            templateUrl:    G.static + 'apps/tpl/welcome.html',
            data: {pageTitle: 'Welcome'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/js/welcome.js' + version
                        ]
                    }]);
                }]
            },
            controller:function($scope){
                $.ajax({
                    url:G.server + '/ghsso/checkLogin.json',
                    type: "post",
                    dataType: "json",
                    success: function(data){
                        if(data && data.isLogin === 0){
                            $.cookie("goodhopeadmin_uuid",'', { expires: -1 });
                            localStorage.removeItem("menuinfo");
                            $.cookie("realname",'', { expires: -1 });
                            window.location.href = G.server ;
                        }

                    },
                    error: function(err){
                        window.location.href = G.server ;
                    }

                })
            }
        })
        /*
        * 活动管理
        * */
        .state('activeList',{
            url: '/activeList',
            templateUrl: G.static + "apps/modules/active/activeList.html" + version,
            data: {pageTitle: '活动列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/active/activeList.js' + version,
                            G.static + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static + 'assets/admin/pages/scripts/components-pickers.js',
                            G.static + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('activeAdd',{
            url: '/activeAdd',
            templateUrl: G.static + "apps/modules/active/activeAdd.html" + version,
            data: {pageTitle: '添加活动'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/active/activeAdd.js' + version,
                            G.static + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            G.static + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            G.static + 'assets/global/css/components-rounded.css',
                            G.static + 'assets/admin/layout/css/summernote.css'
                        ]
                    }]);
                }]
            }
        })
        .state('activeSignup',{
            url: '/activeSignup',
            templateUrl: G.static + "apps/modules/active/activeSignup.html" + version,
            data: {pageTitle: '活动报名列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/active/activeSignup.js' + version,
                            G.static + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static + 'assets/admin/pages/scripts/components-pickers.js',
                            G.static + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /*
        * 店主管理
        * */
        .state('storeList',{
            url: '/storeList',
            templateUrl: G.static + "apps/modules/store/storeList.html" + version,
            data: {pageTitle: '店主列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/store/storeList.js' + version,
                        ]
                    }]);
                }]
            }
        })
        /*
        * 佣金管理
        * */
        .state('commission',{
            url: '/commission',
            templateUrl: G.static + "apps/modules/store/commission.html" + version,
            data: {pageTitle: '佣金管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/store/commission.js' + version,
                            G.static + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static + 'assets/admin/pages/scripts/components-pickers.js',
                            G.static + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /*
        * 推荐的店
        * */
        .state('recommended',{
            url: '/recommended',
            templateUrl: G.static + "apps/modules/store/recommended.html" + version,
            data: {pageTitle: '推荐的店'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/store/recommended.js' + version,
                        ]
                    }]);
                }]
            }
        })
        /*
        * 店主装机数
        * */
        .state('mounting',{
            url: '/mounting',
            templateUrl: G.static + "apps/modules/store/mounting.html" + version,
            data: {pageTitle: '店主装机数'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/store/mounting.js' + version,
                        ]
                    }]);
                }]
            }
        })
        //app版本控制
        .state('goodhope-appVersionNav',{
            url: '/goodhope-appVersionNav',
            templateUrl: G.static + "apps/modules/appVersion/appVersionNav.html"+ version,
            data: {pageTitle: 'APP版本管理导航页'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/appVersion/appVersionNav.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('goodhope-appVersionManage',{
            url: '/goodhope-appVersionManage',
            templateUrl: G.static +"apps/modules/appVersion/appVersionManage.html"+ version,
            data: {pageTitle: 'APP版本管理页'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static +'apps/modules/appVersion/appVersionManage.js'+ version,
                            G.static +'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static +'assets/admin/pages/scripts/components-pickers.js',
                            G.static +'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            G.static  + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            G.static  + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            G.static  + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        .state('goodhope-appVersionAndriod',{
            url: '/goodhope-appVersionAndriod',
            templateUrl: G.static +"apps/modules/appVersion/appVersionAndriod.html"+ version,
            data: {pageTitle: 'APP版本编辑页—安卓'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static +'apps/modules/appVersion/appVersionAndriod.js'+ version,
                            G.static +'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static +'assets/admin/pages/scripts/components-pickers.js',
                            G.static +'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            G.static  + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            G.static  + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            G.static  + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        .state('goodhope-appVersionIos',{
            url: '/goodhope-appVersionIos',
            templateUrl: G.static +"apps/modules/appVersion/appVersionIos.html"+ version,
            data: {pageTitle: 'APP版本编辑页—IOS'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static +'apps/modules/appVersion/appVersionIos.js'+ version,
                            G.static +'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static +'assets/admin/pages/scripts/components-pickers.js',
                            G.static +'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            G.static + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            G.static + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            G.static + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        /*
        *内容管理
        **/
        .state('contentManage',{
            url: '/contentManage',
            templateUrl: G.static + "apps/modules/content/contentManage.html" + version,
            data: {pageTitle: '内容管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/content/contentManage.js' + version,
                            G.static +'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static +'assets/admin/pages/scripts/components-pickers.js',
                            G.static +'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('contentEdit',{
            url: '/contentEdit',
            templateUrl: G.static + "apps/modules/content/contentEdit.html" + version,
            data: {pageTitle: '内容编辑'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/content/contentEdit.js' + version,
                            G.static + 'assets/admin/layout/css/summernote.css'
                        ]
                    }]);
                }]
            }
        })
        /*
        *海报管理
        **/
        .state('posterManage',{
            url: '/posterManage',
            templateUrl: G.static + "apps/modules/content/posterManage.html" + version,
            data: {pageTitle: '海报管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/content/posterManage.js' + version,
                            G.static +'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static +'assets/admin/pages/scripts/components-pickers.js',
                            G.static +'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('posterEdit',{
            url: '/posterEdit',
            templateUrl: G.static + "apps/modules/content/posterEdit.html" + version,
            data: {pageTitle: '海报编辑'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/content/posterEdit.js' + version
                        ]
                    }]);
                }]
            }
        })
        /*
       * 分类管理
       * */
        .state('classifyManage',{
            url: '/classifyManage',
            templateUrl: G.static + "apps/modules/classify/classifyManage.html" + version,
            data: {pageTitle: '分类管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/classify/classifyManage.js' + version
                        ]
                    }]);
                }]
            }
        })
        .state('classifyManageSecond',{
            url: '/classifyManageSecond',
            templateUrl: G.static + "apps/modules/classify/classifyManageSecond.html" + version,
            data: {pageTitle: '分类管理-二级'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/classify/classifyManageSecond.js' + version
                        ]
                    }]);
                }]
            }
        })
        /*
        * 客户管理
        * */
        .state('customerManage',{
            url: '/customerManage',
            templateUrl: G.static + "apps/modules/customer/customerManage.html" + version,
            data: {pageTitle: '客户管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/customer/customerManage.js' + version,
                            G.static +'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static +'assets/admin/pages/scripts/components-pickers.js',
                            G.static +'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /*
       * 顾问管理
       * */
        .state('consultantManage',{
            url: '/consultantManage',
            templateUrl: G.static + "apps/modules/consultant/consultantManage.html" + version,
            data: {pageTitle: '顾问管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/consultant/consultantManage.js' + version,
                            G.static +'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static +'assets/admin/pages/scripts/components-pickers.js',
                            G.static +'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('consultantEdit',{
            url: '/consultantEdit',
            templateUrl: G.static + "apps/modules/consultant/consultantEdit.html" + version,
            data: {pageTitle: '顾问编辑'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/consultant/consultantEdit.js' + version
                        ]
                    }]);
                }]
            }
        })
        /*
      * 广告管理
      * */
        .state('adManage',{
            url: '/adManage',
            templateUrl: G.static + "apps/modules/advertise/adManage.html" + version,
            data: {pageTitle: '广告管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/advertise/adManage.js' + version,
                            G.static +'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static +'assets/admin/pages/scripts/components-pickers.js',
                            G.static +'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('adEdit',{
            url: '/adEdit',
            templateUrl: G.static + "apps/modules/advertise/adEdit.html" + version,
            data: {pageTitle: '广告编辑'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/advertise/adEdit.js' + version,
                            G.static+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static+'assets/admin/pages/scripts/components-pickers.js',
                            G.static+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /*
        * 消息管理
        * */
        .state('messageList',{
            url: '/messageList',
            templateUrl: G.static + "apps/modules/message/messageList.html" + version,
            data: {pageTitle: '消息管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/message/messageList.js' + version,
                            G.static+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static+'assets/admin/pages/scripts/components-pickers.js',
                            G.static+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('messageAdd',{
            url: '/messageAdd',
            templateUrl: G.static + "apps/modules/message/messageAdd.html" + version,
            data: {pageTitle: '消息推送'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/message/messageAdd.js' + version
                        ]
                    }]);
                }]
            }
        })
        /*
        * 推送管理
        * */
        .state('pushList',{
            url: '/pushList',
            templateUrl: G.static + "apps/modules/message/pushList.html" + version,
            data: {pageTitle: '推送管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/message/pushList.js' + version,
                            G.static+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static+'assets/admin/pages/scripts/components-pickers.js',
                            G.static+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('pushAdd',{
            url: '/pushAdd',
            templateUrl: G.static + "apps/modules/message/pushAdd.html" + version,
            data: {pageTitle: '消息推送'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/message/pushAdd.js' + version,
                            G.static + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static + 'assets/admin/pages/scripts/components-pickers.js',
                            G.static + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            G.static + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            G.static + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            G.static + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        /*
        * 优惠券管理
        * */
        .state('couponList',{
            url: '/couponList',
            templateUrl: G.static + "apps/modules/coupon/couponList.html" + version,
            data: {pageTitle: '优惠券管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/coupon/couponList.js' + version,
                            G.static + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static + 'assets/admin/pages/scripts/components-pickers.js',
                            G.static + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('couponAdd',{
            url: '/couponAdd',
            templateUrl: G.static + "apps/modules/coupon/couponAdd.html" + version,
            data: {pageTitle: '优惠券编辑'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/coupon/couponAdd.js' + version,
                            G.static + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            G.static + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            G.static + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                        ]
                    }]);
                }]
            }
        })
        .state('couponDrawList',{
            url: '/couponDrawList',
            templateUrl: G.static + "apps/modules/coupon/couponDrawList.html" + version,
            data: {pageTitle: '优惠券领取列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/coupon/couponDrawList.js' + version,
                            G.static + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static + 'assets/admin/pages/scripts/components-pickers.js',
                            G.static + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
    /**
     * 产品管理
     * **/
        .state('productList',{
            url: '/productList',
            templateUrl: G.static + "apps/modules/product/productList.html" + version,
            data: {pageTitle: '产品列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/product/productList.js' + version,
                            G.static + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static + 'assets/admin/pages/scripts/components-pickers.js',
                            G.static + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('productEdit',{
            url: '/productEdit',
            templateUrl: G.static + "apps/modules/product/productEdit.html" + version,
            data: {pageTitle: '编辑产品'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/product/productEdit.js' + version,
                            G.static + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static + 'assets/admin/pages/scripts/components-pickers.js',
                            G.static + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            G.static + 'assets/admin/layout/css/summernote.css'
                        ]
                    }]);
                }]
            }
        })
     /**
      * 工作室管理
      * **/
        .state('studioAuditList',{
            url: '/studioAuditList',
            templateUrl: G.static + "apps/modules/studio/studioAuditList.html" + version,
            data: {pageTitle: '工作室审核列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/studio/studioAuditList.js' + version,
                            G.static+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static+'assets/admin/pages/scripts/components-pickers.js',
                            G.static+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('intentSign',{
            url: '/intentSign',
            templateUrl: G.static + "apps/modules/studio/intentSign.html" + version,
            data: {pageTitle: '意向签单列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/studio/intentSign.js' + version,
                            G.static+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static+'assets/admin/pages/scripts/components-pickers.js',
                            G.static+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('studioList',{
            url: '/studioList',
            templateUrl: G.static + "apps/modules/studio/studioList.html" + version,
            data: {pageTitle: '工作室列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/studio/studioList.js' + version,
                            G.static+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static+'assets/admin/pages/scripts/components-pickers.js',
                            G.static+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /**
         * 合伙人管理
         * **/
        .state('partnerList',{
            url: '/partnerList',
            templateUrl: G.static + "apps/modules/partner/partnerList.html" + version,
            data: {pageTitle: '合伙人列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            G.static + 'apps/modules/partner/partnerList.js' + version,
                            G.static+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            G.static+'assets/admin/pages/scripts/components-pickers.js',
                            G.static+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
 }]);
/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", function($rootScope, settings, $state) {
    $rootScope.$state = $state; // state to be accessed from view
    // $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    //     console.log("success")
    //     console.log(event);
    //     console.log(toState);
    //     console.log(toParams);
    //     console.log(fromState);
    //     console.log(fromParams);
    // });
    // $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
    //     console.log(event);
    //     console.log(toState);
    //     console.log(toParams);
    //     console.log(fromState);
    //     console.log(fromParams);
    //     console.log(options);
    // })
}]);

//公用函数服务
MetronicApp.factory('tools',['$state', '$http',function($state, $http){
    var LabelBox = function (selector) {
        this.selector = selector;
    }
    LabelBox.prototype.getTmp = function(value){
        var tmp = '<div class="form-group col-sm-12">' +
            '<div class="col-sm-10"><input type="text" class="form-control" value="'+ value +'" ></div>' +
            '<div class="col-sm-1" style="padding-top: 5px;color: #ff0000"><span class="glyphicon glyphicon-remove js_label_del"></span></div>' +
            '</div>';
        return tmp;
    }
    LabelBox.prototype.init = function (defaultValue) {
        var js_cot = $(this.selector).find('.js_label_cot'),that = this;
        if(Array.isArray(defaultValue) && defaultValue.length > 0){
            js_cot.html('');
            for(var i = 0;i<defaultValue.length;i++){
                js_cot.append(this.getTmp(defaultValue[i]));
            }
        }
        $(this.selector).off('click','.js_label_add');
        $(this.selector).on('click','.js_label_add',function () {
            js_cot.append(that.getTmp(''));
        });
        $(this.selector).off('click','.js_label_del');
        $(this.selector).on('click','.js_label_del',function () {
            $(this).parent().parent().remove();
        });
    }
    LabelBox.prototype.getValue = function () {
        var js_cot = $(this.selector).find('.js_label_cot');
        var value = [];
        js_cot.find('input').each(function () {
            var val = $(this).val();
            if(val.length > 0){
                value.push(val);
            }
        })
        return value;
    }
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
        //退出登录
        clearCookie : function(){
            $.get("/ghsso/logout.shtml").then(function(data){
                if(data.success){
                    $.cookie("userRole",'', { expires: -1 });
                    $.cookie("realName",'', { expires: -1 });
                    $.cookie("year",'', { expires: -1 });
                    location.href = '/admin/login.html';
                }else{
                    alert(data.msg);
                }
            })
        },
        //获取年份
        getYears: function(){
            if(!$.cookie("year")) this.clearCookie();
            var year = $.cookie("year"),thisYear = new Date().getFullYear(),arr = [],n;
            if(!isNaN(year)){
                if(thisYear > year){
                    n = thisYear - year + 5;
                }else{
                    n = 5;
                }
                for(var i = 0;i<n;i++){
                    arr.push(parseInt(thisYear) - i);
                }
                return arr;
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
         * 数字千分位 格式化
         * **/
        formatNumber: function(num){
            if (isNaN(num)) {
                throw new TypeError("num is not a number");
            }

            return ("" + num).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
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
        /*美化alert*/
        interalert: function (data) {
            $("#js_dialog_permission .js_content").html('<span class="ui_red">'+data+'</span>');
            $("#js_dialog_permission").modal("show");
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
                progress = '<span style="width:66px; height: 66px; border-radius: 33px;  display: inline-block; overflow: hidden;"><img src="assets/global/img/loading2.gif" style="width:66px;">'
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
            if(!data.success){
                if(data.errorcode == "101") return this.clearCookie();
                if(data.callback && typeof data.callback == "function"){
                    data.callback();
                }
                $("#js_dialog_permission .js_content").html('<span class="ui_red">'+data.msg+'</span>');
                $("#js_dialog_permission").modal("show");
                return false;
            }else{
                return true;
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
            var form = $("#js_form"), originalAction = form.attr("action");
            form.attr({"action": $(obj).attr("action"), "method": "post"}).submit();
            form.attr({"action": originalAction, "method": ""});
        },
        /*
        * 将excel的日期转成yyyymmdd格式
        * */
        changeExcelDate: function(num){
            var a = new Date("1900-01-01");
            a = a.valueOf();
            a = a + (num-2) * 24 * 60 * 60 * 1000;
            return this.toJSYMD(a);
        },
        /*
        * 模糊查询人员
        * */
        mohuSearch : function(inputname,obj,callback){
            var likeSearch = $(".js_likeSearch");
            likeSearch.parent().css("position","relative").append('<ul class="list-group searchContent" style="position: absolute;top: 60px;left: 15px;width: 90%;background: #fff;z-index: 9"></ul>');
            $(document).off("keyup",".js_likeSearch");
            $(document).on("keyup",".js_likeSearch",function(){
                var _this = $(this);
                var val = _this.val();
                if(val != ""){
                    $.ajax({
                        url: '/staff/queryList',
                        method: 'post',
                        data: {keywords : val}
                    }).then(function(data){
                        if(!tools.interceptor(data)) return;
                        var str = [];
                        if(data.data){
                            for(var i in data.data){
                                str.push('<li class="list-group-item" data-id="'+ data.data[i].ID +'" state="'+ data.data[i].STATE +'" staffName="'+ data.data[i].STAFFNAME +'">'+ data.data[i].STAFFNAME +'</li>');
                            }
                        }else{
                            str.push('<li class="list-group-item">没有相关数据</li>');
                        }
                        _this.parent().find(".searchContent").html(str.join(""));
                    })
                }
            });
            $(document).off("click",".searchContent .list-group-item");
            $(document).on("click",".searchContent .list-group-item",function(){
                if($(this).attr("data-id")){
                    obj[inputname] = $(this).attr("data-id");
                    likeSearch.val($(this).attr("staffName"));
                    if(typeof callback == "function"){
                        callback($(this).attr("state"));
                    }
                    $(this).parent().html("");
                }
            })
        },
        /*
        * 检测工时最小为0.1天
        * */
        checkWorkDays : function(str){
            str = str.toString();
            var result = true;
            if(str.indexOf(".") > -1 && str.split(".")[1].length > 1) {
                result = false;
            }
            return result;
        },
        /*
        * 批量提交前排重
        * */
        delRepeat : function(arr,param){
            var err = [],temp = 0;
            var isRepeat = function(obj,index){
                for(var i=index;i<arr.length;i++){
                    temp = 0;
                    for(var m in param){
                        if(obj[param[m]] == arr[i][param[m]]) {
                            temp++;
                        }
                    }
                    if(param.length == temp){
                        err.push(i);
                        return true;
                    }
                }
                return false;
            }
            if(arr.length>1){
                for(var i=0;i<arr.length;i++){
                    if(isRepeat(arr[i],i+1)){
                        err.push(i);
                    }
                }
            }
            var result = err.map(function(i){return i+1}).sort();
            if(result.length>0){
                alert("第"+result.join("、")+"行相互有重复，请检查");
                return false;
            }else{
                return true;
            }
        },
        /*
        * 项目编号显示后6位
        * */
        showLit: function(str){
          return str.toString().substr(str.length - 6);
        },
         /*
        * 根据工时信息汇总个人所有项目的工时
        * */
        showTime: function(arr){
            var result = [];
            result.push("<span>项目编号</br>工作天数</span>");
            for(var i in arr){
                result.push("<span>"+ this.showLit(arr[i].PROJECTID)+"</br>"+arr[i].WORKDAYS+"</span>");
            }
            return result.join("");
        },
        /*
        * 根据工时信息汇总个人本月所有工时
        * */
        showTotal: function(arr){
            var result = 0;
            for(var i in arr){
                result += arr[i].WORKDAYS;
            }
            return result;
        },
        /*
        *根据key值，来显示name名字，比如[{projectName:"test",value:1},{projectName:"test",value:2}] 求value:2的name值
        * inputKey inputValues 输入的键名和键值,inputValues为逗号隔开的字符串，如"1,2,3"
        * */
        showName: function(inputKey,inputValues,outKey,list){
            var val = inputValues.split(","),result = [];
            for(var i in val){
                for(var item in list){
                    if(list[item][inputKey] == val[i]){
                        result.push(list[item][outKey]);
                        break;
                    }
                }
            }
            return result.join('；');
        },
        /*
        * 汇总统计，把各项参数绑定到项目上
        * */
        addData : function(target,source,type){
            if(!target || !source || target.length == 0 || source.length == 0) return;
            for(var i in target){
                if(!target[i].RESULT) target[i].RESULT = {};
                for(var m in source){
                    if(source[m].PROJECTID == target[i].PROJECTID){
                        target[i].RESULT[type] = source[m].RESULT;
                    }
                }
            }
            return target;
        },
        /*
         * 汇总统计，加计扣除
         * */
        addDeduct : function(target,source,type){
            if(!target || !source || source.length == 0) return;
            for(var i in source){
                if(source[i].PROJECTID != target.PROJECTID){
                    continue;
                }else{
                    target[type] = source[i].RESULT.deduct;
                }
            }
            return target;
        },
        /*
        * 汇总统计，加计扣除
        * */
        totalDeduct : function(obj,type){
            var total = 0;
            for(var i in type){
                if(obj[type[i]]) {
                    if(typeof obj[type[i]] == "object"){
                        for(var m in obj[type[i]]){
                            if(m == "研发人员补充保险和补充住房公积金") continue;
                            if(typeof obj[type[i]][m] == "object"){
                                for(var n in obj[type[i]][m]){
                                    total += parseFloat(obj[type[i]][m][n]);
                                }
                            }else{
                                total += parseFloat(obj[type[i]][m]);
                            }
                        }
                    }
                }
            }
            return total;
        },
        /*
        * 年度汇总，把各栏目每个月的值汇总起来
        * */
        concatMonth: function(obj){
            var total = [],result=[];
            var hasProject = function(PROJECTID,arr){
                var r = false;
                if(arr.length == 0) return false;
                for(var i in arr){
                    if(arr[i].PROJECTID == PROJECTID){
                        r = true;
                        break;
                    }
                }
                return r;
            };
            var concatObj = function(target,source){
                var sum = function(arr){
                    var total = 0;
                    if(Array.isArray(arr)){
                        if(arr.length > 0){
                            for(var i in arr){
                                total += parseFloat(arr[i]);
                            }
                        }
                    }else{
                        total = arr;
                    }
                    return total;
                };
                var doe = function(name){
                    if(typeof source[name] == "object"){
                        if(Array.isArray(source[name])){
                            if(target[name] == undefined){
                                target[name] = sum(source[name]).toFixed(2);
                            }else{
                                target[name] = (parseFloat(target[name]) + sum(parseFloat(source[name]))).toFixed(2);
                            }
                        }else{
                            for(var i in source[name]){
                                if(typeof source[name][i] == "object"){
                                    if(target[name][i] == undefined || target[name][i].length == 0){
                                        target[name][i] = sum(source[name][i]).toFixed(2);
                                    }else{
                                        target[name][i] = (parseFloat(sum(target[name][i])) + parseFloat(sum(source[name][i]))).toFixed(2);
                                    }
                                }else{
                                    if(target[name][i] == undefined){
                                        target[name][i] = source[name][i].toFixed(2);
                                    }else{
                                        target[name][i] = (parseFloat(target[name][i]) + parseFloat(source[name][i])).toFixed(2);
                                    }
                                }
                            }
                        }
                    }else{
                        if(target[name] == undefined){
                            target[name] = source[name].toFixed(2);
                        }else{
                            target[name] = (parseFloat(target[name]) + parseFloat(source[name])).toFixed(2);
                        }
                    }
                };
                doe("happened");
                doe("highTech");
                doe("deduct");
            }
            if(obj && obj.length > 0){
                for(var i in obj){
                    if(!this.interceptor(obj[i][0])) return;
                    if(obj[i][0].data.length == 0) continue;
                    for(var m in obj[i][0].data){
                        total.push(obj[i][0].data[m]);
                    }
                }
            }
            if(total.length > 0){
                for(var i in total){
                    //判断项目是否重复
                    if(hasProject(total[i].PROJECTID,result)){
                        for(var m in result){
                            if(result[m].PROJECTID == total[i].PROJECTID){
                                concatObj(result[m].RESULT,total[i].RESULT);
                                break;
                            }
                        }
                    }else{
                        result.push($.extend({},total[i],true));
                    }
                }
            }
            return result;
        },
        /*
        * 标签控件
        * */
        labelBox: function (selector,defaultValue) {
            return new LabelBox(selector,defaultValue);
        }
    };
    return tools;
}]);


//转化数组求和显示
MetronicApp.filter('arrSum',function(){
   return function(input){
       var result = 0;
       if(!Array.isArray(input)){
           if(input && !isNaN(input)){
               return parseFloat(input).toFixed(2);
           }else{
               return "0.00";
           }
       }else if(input.length == 0){
           return "0.00";
       }else{
           for(var i in input){
               result += parseFloat(input[i]);
           }
           return result.toFixed(2);
       }
   }
});
//如果没有值则显示0.00
MetronicApp.filter('toMoney',function(){
    return function(input){
        if(input == "" || input == undefined){
            return "0.00";
        }
        if(typeof input == "number"){
            return input.toFixed(2);
        }
        return input;
    }
});
