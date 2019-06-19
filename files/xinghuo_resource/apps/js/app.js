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
/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);
var siteVar = {
    basicUrl : 'http://xh.creditease.corp/newadmin2/',
    serverUrl: 'http://xh.creditease.corp'
};


var version = "?20171107";
//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);

MetronicApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
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
MetronicApp.controller('AppController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $scope.$on('$viewContentLoaded', function() {
        Metronic.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive
        if(!jQuery.ajaxSettings.xhrFields){
            jQuery.ajaxSettings.xhrFields = {withCredentials: true};
        }
        if(!jQuery.ajaxSettings.error){
            jQuery.ajaxSettings.error = function(XMLHttpRequest){

                if(XMLHttpRequest.readyState == 0){
                    $.cookie("xinghuoadmin_uid",'', { expires: -1 });
                    //$.cookie("xinghuoadmin_token",'', { expires: -1 });
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
                    $("body").append('<div id="xinghuoLoading"><img src="' + siteVar.basicUrl + '/assets/admin/layout/img/xinghuoloading.gif" /></div>');
                }
            }
        }
        if(!jQuery.ajaxSettings.complete) {
            jQuery.ajaxSettings.complete = function(XMLHttpRequest){
                loadingArr.pop();
                if(loadingArr.length == 0 && $("#xinghuoLoading").length > 0){
                    $("#xinghuoLoading").remove();
                }
            }
        }
    });
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope', function($scope) {
    $scope.realname = $.cookie("realname");
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
        $scope.loginOut = function(){
            $.cookie("xinghuoadmin_uid",'', { expires: -1 });
            //$.cookie("xinghuoadmin_token",'', { expires: -1 });
            $.cookie("realname",'', { expires: -1 });
            localStorage.removeItem("menuinfo");
            location.href = siteVar.serverUrl+"/xinghuo/logout.shtml";
        }
    });
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope','$rootScope', function($scope) {
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
/*
 获取枚举列表服务
 */
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
            url: siteVar.serverUrl+'/xinghuopageapi/getSelectOption.json',
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

/*p2p枚举*/
     service.getselectp2p = function (str) {
        var defer = $q.defer();
        $.ajax({
            url: siteVar.serverUrl+'/xinghuopageapi/getEnumValues.json',
            method: 'POST',
            data: {
                keyNames:str
            }
        }).then(function(data){
            defer.resolve(data);
        },function(error){
            defer.reject(error);
        });
        return defer.promise;
    };

    service.getHuodong = function(obj,interface){
        var defer = $q.defer();
        var reqData = {
            'appReqData': obj
        };
        $.ajax({
            url: siteVar.serverUrl+interface,
            method: 'POST',
            data: {
                data: JSON.stringify(reqData)
            }
        }).then(function(data){
            //if(!tools.interceptor(data)) return;
            defer.resolve(data);
        },function(error){
            defer.reject(error);
        });
        return defer.promise;
    };
    return service;
}]);
/*
获取产品列表联动服务
 */
MetronicApp.factory('getProListFactory',['$q','tools',function($q,tools){
    var service = {
        //获取一级产品
        getProFirstList : function(option){
            var defer = $q.defer();
            var reqData = {
                'appReqData': option
            };
            $.ajax({
                url: siteVar.serverUrl+'/xinghuopageapi/getProList.json',
                method: 'POST',
                data: {
                    data: JSON.stringify(reqData)
                }
            }).then(function(data){
                //if(!tools.interceptor(data)) return;
                defer.resolve(data);
            },function(error){
                defer.reject(error);
            });
            return defer.promise;
        },
        //获取二级和三级产品 传值category, series, source
        getProOtherList: function(option){
            var defer = $q.defer();
            $.ajax({
                url: siteVar.serverUrl+'/xinghuoproduct/productSelector.shtml',
                method: 'POST',
                data: option
            }).then(function(data){
                //if(!tools.interceptor(data)) return;
                defer.resolve(data);
            },function(error){
                defer.reject(error);
            });
            return defer.promise;
        },
        //根据产品id查询子产品列表 传值productid,status,querytype
        getProThirdList: function(option){
            var defer = $q.defer();
            $.ajax({
                url: siteVar.serverUrl+'/xinghuoproduct/subprducts/'+ option.id +'.shtml',
                method: 'POST',
                data: option
            }).then(function(data){
                //if(!tools.interceptor(data)) return;
                defer.resolve(data);
            },function(error){
                defer.reject(error);
            });
            return defer.promise;
        },
        //获取理财经理级别
        getUserLevel: function(){
            var defer = $q.defer();
            $.ajax({
                url: siteVar.serverUrl+'/xinghuopageapi/getUserlevel.json',
                method: 'POST'
            }).then(function(data){
                //if(!tools.interceptor(data)) return;
                defer.resolve(data);
            },function(error){
                defer.reject(error);
            });
            return defer.promise;
        }
    };
    return service;
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
                        name: 'MetronicApp'
                    }])
                }]
            },
            controller:function($scope){
                $.ajax({
                    url:siteVar.serverUrl + '/xinghuopageapi/checkLogin.json',
                    type: "post",
                    dataType: "json",
                    success: function(data){
                        console.log('是否登录',data)
                        if(data.appResData && data.appResData.isLogin == 0){
                            $.cookie("xinghuoadmin_uid",'', { expires: -1 });
                            localStorage.removeItem("menuinfo");
                            $.cookie("realname",'', { expires: -1 });
                            window.location.href = siteVar.serverUrl + "/xhsso/index.shtml";
                        }

                    },
                    error: function(err){
                        window.location.href = siteVar.serverUrl + "/xhsso/index.shtml";
                    }

                })
            }
        })
    /**
     * 交易管理
     */
        .state('xinghuodeal-trade',{
            url: '/xinghuodeal-trade.html',
            templateUrl: siteVar.basicUrl+'apps/modules/deal/trade.html'+ version,
            data: {pageTitle: '交易单管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/deal/tradeController.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }])
                }]
            }
        })
        .state('caiyideal-trade',{
            url: '/caiyideal-trade.html',
            templateUrl: siteVar.basicUrl+'apps/modules/deal/caiyideal-trade.html'+ version,
            data: {pageTitle: '交易单管理-宜信财富'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/deal/caiyiTradeController.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }])
                }]
            }
        })
        .state('qichedeal-trade',{
            url: '/qichedeal-trade.html',
            templateUrl: siteVar.basicUrl+'apps/modules/deal/qichedeal-trade.html'+ version,
            data: {pageTitle: '交易单管理-财一4S店'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/deal/qicheTradeController.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }])
                }]
            }
        })
        .state('insuranceTransaction',{
            url: '/insuranceTransaction.html',
            templateUrl: siteVar.basicUrl+'apps/modules/deal/insuranceTransaction.html'+ version,
            data: {pageTitle: '保险交易单管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/deal/insuranceTransaction.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }])
                }]
            }
        })
    /**
     * 好望角
     */
        .state('xinghuogoodhope-subject',{
            url: '/xinghuogoodhope-subject.html',
            templateUrl: siteVar.basicUrl+"apps/modules/goodhope/subject.html"+ version,
            data: {pageTitle: '好望角项目'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/goodhope/subjectController.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuogoodhope-apply',{
            url: '/xinghuogoodhope-apply.html',
            templateUrl: siteVar.basicUrl+"apps/modules/goodhope/apply.html"+ version,
            data: {pageTitle: '申请单管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/goodhope/applyController.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuogoodhope-add',{
            url: '/xinghuogoodhope-add.html',
            templateUrl: siteVar.basicUrl+"apps/modules/goodhope/editProject.html"+ version,
            data: {pageTitle: '好望角项目-新增项目'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/goodhope/editProject.js'+ version,
                            siteVar.basicUrl + 'assets/admin/layout/css/summernote.css'
                        ]
                    }]);
                }]
            }
        })
        /*
        * 好望角资料管理
        * */
        .state('xinghuogoodhope-dataManage',{
            url: '/xinghuogoodhope-dataManage.html',
            templateUrl: siteVar.basicUrl+"apps/modules/goodhope/dataManage.html"+ version,
            data: {pageTitle: '好望角项目-项目列表-资料管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/goodhope/dataManage.js'+ version,
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuogoodhope-dataAdd',{
            url: '/xinghuogoodhope-dataAdd.html',
            templateUrl: siteVar.basicUrl+"apps/modules/goodhope/dataAdd.html"+ version,
            data: {pageTitle: '好望角项目-项目列表-资料新增/编辑'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/goodhope/dataAdd.js'+ version,
                            siteVar.basicUrl + 'assets/admin/layout/css/summernote.css'
                        ]
                    }]);
                }]
            }
        })
    /**
     * 支付单管理
     */
        .state('xinghuodeal-payment',{
            url: '/xinghuodeal-payment.html',
            templateUrl: siteVar.basicUrl + "apps/modules/payment/xinghuodeal-payment.html"+ version,
            data: {pageTitle: '支付单管理'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/payment/xinghuodealPaymentController.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('caiyideal-payment',{
            url: '/caiyideal-payment.html',
            templateUrl: siteVar.basicUrl + "apps/modules/payment/caiyideal-payment.html"+ version,
            data: {pageTitle: '宜信财富-支付单管理'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/payment/caiyidealPaymentController.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuopay-refund',{
            url: '/xinghuopay-refund.html',
            templateUrl: siteVar.basicUrl + "apps/modules/payment/refund.html"+ version,
            data: {pageTitle: '退款单管理'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/payment/refund.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
    /**
     * 赎回管理
     */
        .state('xinghuodeal-redemption',{
            url: '/xinghuodeal-redemption.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/redeem/redemption.html'+ version,
            data: {pageTitle: '赎回单管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/redeem/redemptionController.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }])
                }]
            }
        })
        /*
        * 赎回单管理-散标管理
        * */
        .state('xinghuodeal-sanbiaoRedeem',{
            url: '/xinghuodeal-sanbiaoRedeem.html',
            templateUrl: siteVar.basicUrl+"apps/modules/redeem/sanbiaoRedeem.html"+ version,
            data: {pageTitle: '赎回单管理-散标'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/redeem/sanbiaoRedeem.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuodeal-tradingRedemption',{
            url: '/xinghuodeal-tradingRedemption.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/redeem/tradingRedemption.html'+ version,
            data: {pageTitle: '赎回单管理-交易中心'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/redeem/tradingRedemptionController.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }])
                }]
            }
        })
        .state('singlepayment-page',{
            url: '/singlepayment-page.html',
            templateUrl: siteVar.basicUrl+'apps/modules/redeem/page.html'+ version,
            data: {pageTitle: '回款单管理-银行卡'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/redeem/pageController.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }])
                }]
            }
        })
        .state('singlepayment-wallet',{
            url: '/singlepayment-wallet.html',
            templateUrl: siteVar.basicUrl+'apps/modules/redeem/wallet.html'+ version,
            data: {pageTitle: '回款单管理-星火钱包'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/redeem/walletController.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }])
                }]
            }
        })
        .state('xinghuodeal-fundRedeem',{
            url: '/xinghuodeal-fundRedeem.html',
            templateUrl: siteVar.basicUrl+'apps/modules/redeem/fundRedeem.html'+ version,
            data: {pageTitle: '交易单管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/redeem/fundRedeemController.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }])
                }]
            }
        })
        /**
         * 产品管理
         */
        .state('xinghuoproduct-goods',{
            url: '/xinghuoproduct-goods.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/product/goods.html'+ version,
            data: {pageTitle: '产品管理-零投'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/product/goods.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }])
                }]
            }
        })
        .state('xinghuoproduct-productCenterManage',{
            url: '/xinghuoproduct-productCenterManage.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/product/productCenterManage.html'+ version,
            data: {pageTitle: '产品管理-产品中心'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/product/productCenterManage.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }])
                }]
            }
        })
        /*
        * 产品管理-散标管理
        * */
        .state('xinghuoproduct-sanbiao',{
            url: '/xinghuoproduct-sanbiao.html',
            templateUrl: siteVar.basicUrl+"apps/modules/product/sanbiaoManage.html"+ version,
            data: {pageTitle: '产品管理-散标'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/product/sanbiaoManage.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuoproduct-tradingCenterManage',{
            url: '/xinghuoproduct-tradingCenterManage.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/product/tradingCenterManage.html'+ version,
            data: {pageTitle: '产品管理-交易中心'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/product/tradingCenterManage.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }])
                }]
            }
        })
        .state('xinghuoproduct-extendProduct',{
            url: '/xinghuoproduct-extendProduct.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/product/extendProduct.html'+ version,
            data: {pageTitle: '产品管理-保险产品'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/product/extendProduct.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }])
                }]
            }
        })
        .state('xinghuoproduct-saleSite',{
            url: '/xinghuoproduct-saleSite.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/product/saleSite.html'+ version,
            data: {pageTitle: '保险产品-销售配置'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/product/saleSite.js'+ version
                        ]
                    }])
                }]
            }
        })
        .state('xinghuoproduct-recommend',{
            url: '/xinghuoproduct-recommend.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/product/recommend.html'+ version,
            data: {pageTitle: '产品推荐'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/product/recommend.js'+ version
                        ]
                    }])
                }]
            }
        })
        .state('xinghuoproduct-cash',{
            url: '/xinghuoproduct-cash.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/product/cash.html'+ version,
            data: {pageTitle: '产品管理-变现贷'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/product/cash.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }])
                }]
            }
        })
        /**
         * 费率管理
         */
        .state('xinghuoproduct-rate',{
            url: '/xinghuoproduct-rate.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/rate/rate.html'+ version,
            data: {pageTitle: '销售配置列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/rate/rate.js'+ version
                        ]
                    }])
                }]
            }
        })
        /**
         * 产品管理 私人定制
         */
        .state('xinghuoproduct-custom',{
            url: '/xinghuoproduct-custom.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/product/xinghuoproduct-custom.html'+ version,
            data: {pageTitle: '产品管理_私人定制'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/rate/rate.js'+ version,
                            siteVar.basicUrl + 'apps/modules/product/xinghuoproductCustom.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }])
                }]
            }
        })
        .state('xinghuoproductrate-toPersonRateList',{
            url: '/xinghuoproductrate-toPersonRateList.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/rate/toPersonRateList.html'+ version,
            data: {pageTitle: '个别费率列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/rate/toPersonRateList.js'+ version
                        ]
                    }])
                }]
            }
        })
        .state('xinghuoproductrate-intoProductRatePage',{
            url: '/xinghuoproductrate-intoProductRatePage.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/rate/intoProductRatePage.html'+ version,
            data: {pageTitle: '销售配置-费率管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/rate/intoProductRatePage.js'+ version
                        ]
                    }])
                }]
            }
        })
        .state('xinghuoproduct-ratetemplate',{
            url: '/xinghuoproduct-ratetemplate.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/rate/ratetemplate.html'+ version,
            data: {pageTitle: '销售配置-费率模板'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/rate/ratetemplate.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }])
                }]
            }
        })
        .state('xinghuodefaultrate-tabLevel',{
            url: '/xinghuodefaultrate-tabLevel.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/rate/tabLevel.html'+ version,
            data: {pageTitle: '销售配置-默认费率设置'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/rate/tabLevel.js'+ version
                        ]
                    }])
                }]
            }
        })
        .state('xinghuodefaultrate-tabPerson',{
            url: '/xinghuodefaultrate-tabPerson.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/rate/tabPerson.html'+ version,
            data: {pageTitle: '销售配置-默认费率设置'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/rate/tabPerson.js'+ version
                        ]
                    }])
                }]
            }
        })
        .state('xinghuoproductrate-toProductRateVipList',{
            url: '/xinghuodefaultrate-toProductRateVipList.html',
            templateUrl: siteVar.basicUrl + 'apps/modules/rate/toProductRateVipList.html'+ version,
            data: {pageTitle: 'VIP用户列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad){
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/rate/toProductRateVipList.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }])
                }]
            }
        })
        /*
         用户管理
         */
        .state('xinghuouser-consumer',{
            url: '/xinghuouser-consumer.html',
            templateUrl: siteVar.basicUrl+"apps/modules/usermanage/xinghuo-Consumer.html"+ version,
            data: {pageTitle: '普通用户'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/usermanage/xinghuoConsumer.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuouser-addUsers',{
            url: '/xinghuouser-addUsers.html',
            templateUrl: siteVar.basicUrl+"apps/modules/usermanage/addUsers.html"+ version,
            data: {pageTitle: '添加用户'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/usermanage/addUsers.js' + version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('caiyiuser-consumer',{
            url: '/caiyiuser-consumer.html',
            templateUrl: siteVar.basicUrl+"apps/modules/usermanage/caiyiuser-Consumer.html"+ version,
            data: {pageTitle: '普通用户-宜信财富'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/usermanage/caiyiuserConsumer.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('caieruser-consumer',{
            url: '/caieruser-consumer.html',
            templateUrl: siteVar.basicUrl+"apps/modules/usermanage/caieruser-Consumer.html"+ version,
            data: {pageTitle: '普通用户-宜信财富'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/usermanage/caieruserConsumer.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuouser-deposit',{
            url: '/xinghuouser-deposit.html',
            templateUrl: siteVar.basicUrl+"apps/modules/usermanage/userDeposit.html"+ version,
            data: {pageTitle: '存管余额管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/usermanage/userDeposit.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuouser-remain',{
            url: '/xinghuouser-remain.html',
            templateUrl: siteVar.basicUrl+"apps/modules/usermanage/userRemain.html"+ version,
            data: {pageTitle: '用户存管余额管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/usermanage/userRemain.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /*
            理财经理
         */
        .state('xinghuouser-director',{
            url: '/xinghuouser-director.html',
            templateUrl: siteVar.basicUrl+"apps/modules/director/xinghuo-director.html"+ version,
            data: {pageTitle: '理财经理管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/director/xinghuoDirector.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('caiyiuser-director',{
            url: '/caiyiuser-director.html',
            templateUrl: siteVar.basicUrl+"apps/modules/director/caiyi-director.html"+ version,
            data: {pageTitle: '理财经理管理-宜信财富'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/director/caiyiDirector.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('qicheuser-director',{
            url: '/qicheuser-director.html',
            templateUrl: siteVar.basicUrl+"apps/modules/director/qicheDirector.html"+ version,
            data: {pageTitle: '理财经理管理-财一4S店'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/director/qicheDirector.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('caiermanager-director',{
            url: '/caiermanager-director.html',
            templateUrl: siteVar.basicUrl+"apps/modules/director/caierDirector.html"+ version,
            data: {pageTitle: '理财经理管理-财富二部'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/director/caierDirector.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuouser-rank',{
            url: '/xinghuouser-rank.html',
            templateUrl: siteVar.basicUrl+"apps/modules/director/xinghuouserRank.html"+ version,
            data: {pageTitle: '级别管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/director/xinghuouserRank.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuouser-directorRecommendBatch',{
            url: '/xinghuouser-directorRecommendBatch.html',
            templateUrl: siteVar.basicUrl+"apps/modules/director/directorRecommendBatch.html"+ version,
            data: {pageTitle: 'PC首页理财师推荐'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/director/directorRecommendBatch.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('directorRecommend',{
            url: '/directorRecommend.html',
            templateUrl: siteVar.basicUrl+"apps/modules/director/directorRecommend.html"+ version,
            data: {pageTitle: 'PC首页理财师推荐'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/director/directorRecommend.js'+ version
                        ]
                    }]);
                }]
            }
        })
        /*
            审核管理
         */
        .state('xinghuoaudit-audit-applyshop',{
            url: '/xinghuoaudit-audit-applyshop.html',
            templateUrl: siteVar.basicUrl+"apps/modules/audit/xinghuo-applyshop.html"+ version,
            data: {pageTitle: '开店申请'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/audit/xinghuoApplyshop.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuoaudit-audit-modifyshop',{
            url: '/xinghuoaudit-audit-modifyshop.html',
            templateUrl: siteVar.basicUrl+"apps/modules/audit/xinghuo-modifyshop.html"+ version,
            data: {pageTitle: '修改店铺'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/audit/xinghuoModifyshop.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuoaudit-audit-custom',{
            url: '/xinghuoaudit-audit-custom.html',
            templateUrl: siteVar.basicUrl+"apps/modules/audit/xinghuo-custom.html"+ version,
            data: {pageTitle: '私人定制'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/audit/xinghuoCustom.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
    /**
     *内容管理
     **/
        .state('xinghuocontent-content',{
            url: '/xinghuocontent-content.html',
            templateUrl: siteVar.basicUrl + "apps/modules/content/xinghuoContent.html"+ version,
            data: {pageTitle: '内容管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/content/xinghuoContent.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuocontent-editContent',{
            url: '/xinghuocontent-editContent.html',
            templateUrl: siteVar.basicUrl + "apps/modules/content/editContent.html"+ version,
            data: {pageTitle: '内容管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/content/editContent.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css',
                            siteVar.basicUrl + 'assets/admin/layout/css/summernote.css'
                        ]
                    }]);
                }]
            }
        })
        .state('caiyicontent-content',{
            url: '/caiyicontent-content.html',
            templateUrl: siteVar.basicUrl + "apps/modules/content/caiyicontent.html"+ version,
            data: {pageTitle: '内容管理-宜信财富'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/content/caiyicontent.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuocategory-categoryList',{
            url: '/xinghuocategory-categoryList.html',
            templateUrl: siteVar.basicUrl + "apps/modules/content/categoryList.html"+ version,
            data: {pageTitle: '分类管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/content/categoryList.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuocategory-categoryListTable',{
            url: '/xinghuocategory-categoryListTable.html',
            templateUrl: siteVar.basicUrl + "apps/modules/content/categoryListTable.html"+ version,
            data: {pageTitle: '分类管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/content/categoryListTable.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuocategory-editCategoryList',{
            url: '/xinghuocategory-editCategoryList.html',
            templateUrl: siteVar.basicUrl + "apps/modules/content/editCategoryList.html"+ version,
            data: {pageTitle: '分类管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/content/editCategoryList.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuocontent-ad',{
            url: '/xinghuocontent-ad.html',
            templateUrl: siteVar.basicUrl + "apps/modules/content/ad.html"+ version,
            data: {pageTitle: '广告管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/content/ad.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuocontent-editAd',{
            url: '/xinghuocontent-editAd.html',
            templateUrl: siteVar.basicUrl + "apps/modules/content/editAd.html"+ version,
            data: {pageTitle: '广告管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/content/editAd.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /*
        * 星火公开课管理
        * */
        .state('xinghuocontent-openClass',{
            url: '/xinghuocontent-openClass.html',
            templateUrl: siteVar.basicUrl + "apps/modules/content/openClass.html"+ version,
            data: {pageTitle: '星火公开课管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/content/openClass.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('editOpenClass',{
            url: '/editOpenClass.html',
            templateUrl: siteVar.basicUrl + "apps/modules/content/editOpenClass.html"+ version,
            data: {pageTitle: '星火公开课管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/content/editOpenClass.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        /**
         *结算管理
         **/
        .state('xinghuosettle-yixinNoSettle',{
            url: '/xinghuosettle-yixinNoSettle.html',
            templateUrl: siteVar.basicUrl + "apps/modules/settlement/noSettle.html"+ version,
            data: {pageTitle: '宜信员工未结算-1'},
            params:{isYX : true},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/settlement/noSettle.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosettle-noSettle',{
            url: '/xinghuosettle-noSettle.html',
            templateUrl: siteVar.basicUrl + "apps/modules/settlement/noSettle.html"+ version,
            data: {pageTitle: '非宜信员工未结算'},
            params:{isYX : false},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/settlement/noSettle.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosettle-yixinSettled',{
            url: '/xinghuosettle-yixinSettled.html',
            templateUrl: siteVar.basicUrl + "apps/modules/settlement/settled.html"+ version,
            data: {pageTitle: '宜信员工已结算-1'},
            params:{isYX : true},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/settlement/settled.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosettle-settled',{
            url: '/xinghuosettle-settled.html',
            templateUrl: siteVar.basicUrl + "apps/modules/settlement/settled.html"+ version,
            data: {pageTitle: '非宜信员工已结算'},
            params:{isYX : false},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/settlement/settled.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosettle-settleinfo',{
            url: '/xinghuosettle-settleinfo.html',
            templateUrl: siteVar.basicUrl + "apps/modules/settlement/settleinfo.html"+ version,
            data: {pageTitle: '店铺交易明细'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/settlement/settleinfo.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosettle-insuranceSettleInfo',{
            url: '/xinghuosettle-insuranceSettleInfo.html',
            templateUrl: siteVar.basicUrl + "apps/modules/settlement/insuranceSettleInfo.html"+ version,
            data: {pageTitle: '保险佣金明细'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/settlement/insuranceSettleInfo.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosettle-wltnoSettle',{
            url: '/xinghuosettle-wltnoSettle.html',
            templateUrl: siteVar.basicUrl + "apps/modules/settlement/wltnoSettle.html"+ version,
            data: {pageTitle: '万里通未结算'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/settlement/wltnoSettle.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosettle-wltsettled',{
            url: '/xinghuosettle-wltsettled.html',
            templateUrl: siteVar.basicUrl + "apps/modules/settlement/wltsettled.html"+ version,
            data: {pageTitle: '万里通已结算'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/settlement/wltsettled.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosettle-commissionRecord',{
            url: '/xinghuosettle-commissionRecord.html',
            templateUrl: siteVar.basicUrl + "apps/modules/settlement/commissionRecord.html"+ version,
            data: {pageTitle: '佣金修改记录'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/settlement/commissionRecord.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /**
         *配置中心
         **/
        .state('xinghuosite-quota',{
            url: '/xinghuosite-quota.html',
            templateUrl: siteVar.basicUrl + "apps/modules/configCenter/quota.html"+ version,
            data: {pageTitle: '交易单取消锁定'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/configCenter/quota.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosite-dealPay',{
            url: '/xinghuosite-dealPay.html',
            templateUrl: siteVar.basicUrl + "apps/modules/configCenter/dealPay.html"+ version,
            data: {pageTitle: '交易单状态修改'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/configCenter/dealPay.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosite-dealPayEdit',{
            url: '/xinghuosite-dealPayEdit.html',
            templateUrl: siteVar.basicUrl + "apps/modules/configCenter/dealPayEdit.html"+ version,
            data: {pageTitle: '更新交易单状态'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/configCenter/dealPayEdit.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'

                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosite-structure',{
            url: '/xinghuosite-structure.html',
            templateUrl: siteVar.basicUrl + "apps/modules/configCenter/structure.html"+ version,
            data: {pageTitle: '结构性产品配置'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/configCenter/structure.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosite-structureEdit',{
            url: '/xinghuosite-structureEdit.html',
            templateUrl: siteVar.basicUrl + "apps/modules/configCenter/structureEdit.html"+ version,
            data: {pageTitle: '编辑结构性活动配置'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/configCenter/structureEdit.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'

                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosite-site',{
            url: '/xinghuosite-site.html',
            templateUrl: siteVar.basicUrl + "apps/modules/configCenter/site.html"+ version,
            data: {pageTitle: '站点配置'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/configCenter/site.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosite-params',{
            url: '/xinghuosite-params.html',
            templateUrl: siteVar.basicUrl + "apps/modules/configCenter/params.html"+ version,
            data: {pageTitle: '参数配置'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/configCenter/params.js'+ version
                        ]
                    }]);
                }]
            }
        })
        //app版本控制
        .state('xinghuosite-appVersionNav',{
            url: '/xinghuosite-appVersionNav.html',
            templateUrl: siteVar.basicUrl + "apps/modules/configCenter/appVersionNav.html"+ version,
            data: {pageTitle: 'APP版本管理导航页'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/configCenter/appVersionNav.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosite-appVersionManage',{
            url: '/xinghuosite-appVersionManage.html',
            templateUrl: siteVar.basicUrl+"apps/modules/configCenter/appVersionManage.html"+ version,
            data: {pageTitle: 'APP版本管理页'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/configCenter/appVersionManage.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosite-appVersionAndriod',{
            url: '/xinghuosite-appVersionAndriod.html',
            templateUrl: siteVar.basicUrl+"apps/modules/configCenter/appVersionAndriod.html"+ version,
            data: {pageTitle: 'APP版本编辑页—安卓'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/configCenter/appVersionAndriod.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosite-appVersionIos',{
            url: '/xinghuosite-appVersionIos.html',
            templateUrl: siteVar.basicUrl+"apps/modules/configCenter/appVersionIos.html"+ version,
            data: {pageTitle: 'APP版本编辑页—IOS'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/configCenter/appVersionIos.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
     /**
      * 其他
      * **/
        .state('xinghuoother-userinfo',{
            url: '/xinghuoother-userinfo.html',
            templateUrl: siteVar.basicUrl + "apps/modules/other/userinfo.html"+ version,
            data: {pageTitle: '用户查询'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/other/userinfo.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuoother-quota',{
            url: '/xinghuoother-quota.html',
            templateUrl: siteVar.basicUrl + "apps/modules/other/quota.html"+ version,
            data: {pageTitle: '银行限额表管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/other/quota.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('caiyiuser-reservation',{
            url: '/caiyiuser-reservation.html',
            templateUrl: siteVar.basicUrl + "apps/modules/other/reservation.html"+ version,
            data: {pageTitle: '预约管理-宜信财富'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/other/reservation.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'

                        ]
                    }]);
                }]
            }
        })
        .state('caiyiuser-cooperateOrgan',{
            url: '/caiyiuser-cooperateOrgan.html',
            templateUrl: siteVar.basicUrl + "apps/modules/other/cooperateOrgan.html"+ version,
            data: {pageTitle: '合作机构-宜信财富'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/other/cooperateOrgan.js'+ version

                        ]
                    }]);
                }]
            }
        })
        .state('xinghuosite-managerRec',{
            url: '/xinghuosite-managerRec.html',
            templateUrl: siteVar.basicUrl + "apps/modules/other/managerRec.html"+ version,
            data: {pageTitle: '绑定管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/other/managerRec.js'+ version

                        ]
                    }]);
                }]
            }
        })
        .state('caierreport-report',{
            url: '/caierreport-report.html',
            templateUrl: siteVar.basicUrl + "apps/modules/other/report.html"+ version,
            data: {pageTitle: '报表发送管理-财富二部'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/other/report.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('bxdduizhang-bxdDuizhang',{
            url: '/bxdduizhang-bxdDuizhang.html',
            templateUrl: siteVar.basicUrl + "apps/modules/other/bxdDuizhang.html"+ version,
            data: {pageTitle: '变现贷——对账'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/other/bxdDuizhang.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('bxdduizhang-bxdSingleDuizhang',{
            url: '/bxdduizhang-bxdSingleDuizhang.html',
            templateUrl: siteVar.basicUrl + "apps/modules/other/bxdSingleDuizhang.html"+ version,
            data: {pageTitle: '变现贷——对账单条查询结果'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/other/bxdSingleDuizhang.js'+ version
                        ]
                    }]);
                }]
            }
        })
    /*
    * 活动管理
    * */
        .state('xinghuohuodong-huodong',{
            url: '/xinghuohuodong-huodong.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/xinghuohuodongHuodong.html"+ version,
            data: {pageTitle: '活动管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/xinghuohuodongHuodong.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuohuodong-addhuodong',{
            url: '/xinghuohuodong-addhuodong.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/xinghuohuodongAddhuodong.html"+ version,
            data: {pageTitle: '活动管理-添加活动'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/xinghuohuodongAddhuodong.js'+ version,
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuohuodong-huodongSetting',{
            url: '/xinghuohuodong-huodongSetting.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/xinghuohuodongHuodongSetting.html"+ version,
            data: {pageTitle: '活动管理-添加活动'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/xinghuohuodongHuodongSetting.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuohuodong-addAward',{
            url: '/xinghuohuodong-addAward.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/xinghuohuodongAddaward.html"+ version,
            data: {pageTitle: '活动管理-添加活动'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/xinghuohuodongAddaward.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuohuodong-redcreate',{
            url: '/xinghuohuodong-redcreate.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/xinghuohuodongRedcreate.html"+ version,
            data: {pageTitle: '创建红包'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/xinghuohuodongRedcreate.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuohuodong-redadd',{
            url: '/xinghuohuodong-redadd.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/xinghuohuodongAddred.html"+ version,
            data: {pageTitle: '创建红包'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/xinghuohuodongAddred.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuohuodong-red',{
            url: '/xinghuohuodong-red.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/xinghuohuodongRed.html"+ version,
            data: {pageTitle: '红包记录'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/xinghuohuodongRed.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuohuodong-huodongTrade',{
            url: '/xinghuohuodong-huodongTrade.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/xinghuohuodongTrade.html"+ version,
            data: {pageTitle: '活动交易单'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/xinghuohuodongTrade.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuohuodong-effectStatistical',{
            url: '/xinghuohuodong-effectStatistical.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/xinghuohuodongEffect.html"+ version,
            data: {pageTitle: '效果分析'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/xinghuohuodongEffect.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuohuodong-huodongaudit',{
            url: '/xinghuohuodong-huodongaudit.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/xinghuohuodongAudit.html"+ version,
            data: {pageTitle: '活动审核'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/xinghuohuodongAudit.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuoinviteuser-statistics',{
            url: '/xinghuoinviteuser-statistics.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/statistics.html"+ version,
            data: {pageTitle: '邀请活动统计'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/statistics.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuoinviteuser-record',{
            url: '/xinghuoinviteuser-record.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/record.html"+ version,
            data: {pageTitle: '邀请活动记录'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/record.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuoinviteuser-reward',{
            url: '/xinghuoinviteuser-reward.html',
            templateUrl: siteVar.basicUrl + "apps/modules/active/reward.html"+ version,
            data: {pageTitle: '活动奖励'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/active/reward.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuoother-activity',{
            url: '/xinghuoother-activity.html',
            templateUrl: siteVar.basicUrl + "apps/modules/redEnvelopes/xinghuoOtherActivity.html"+ version,
            data: {pageTitle: '其他活动管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/redEnvelopes/xinghuoOtherActivity.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
    /*
    数据统计
     */
        .state('xinghuodata-all',{
            url: '/xinghuodata-all.html',
            templateUrl: siteVar.basicUrl + "apps/modules/charts/xinghuodataAll.html"+ version,
            data: {pageTitle: '汇总统计'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/charts/xinghuodataAll.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl+'assets/global/plugins/echarts/echarts.common.min.js'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuodata-month',{
            url: '/xinghuodata-month.html',
            templateUrl: siteVar.basicUrl + "apps/modules/charts/xinghuodataMonth.html"+ version,
            data: {pageTitle: '月统计'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/charts/xinghuodataMonth.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/echarts/echarts.common.min.js'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuodata-hour',{
            url: '/xinghuodata-hour.html',
            templateUrl: siteVar.basicUrl + "apps/modules/charts/xinghuodataHour.html"+ version,
            data: {pageTitle: '小时统计'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/charts/xinghuodataHour.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/echarts/echarts.common.min.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuodata-day',{
            url: '/xinghuodata-day.html',
            templateUrl: siteVar.basicUrl + "apps/modules/charts/xinghuodataDay.html"+ version,
            data: {pageTitle: '天统计'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/charts/xinghuodataDay.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/echarts/echarts.common.min.js'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuodata-daynow',{
            url: '/xinghuodata-daynow.html',
            templateUrl: siteVar.basicUrl + "apps/modules/charts/xinghuodataDaynow.html"+ version,
            data: {pageTitle: '当天实时数量'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/charts/xinghuodataDaynow.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/echarts/echarts.common.min.js'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuodata-dealcount',{
            url: '/xinghuodata-dealcount.html',
            templateUrl: siteVar.basicUrl + "apps/modules/charts/xinghuodataDealcount.html"+ version,
            data: {pageTitle: '交易笔数分类'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/charts/xinghuodataDealcount.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/echarts/echarts.common.min.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuodata-product',{
            url: '/xinghuodata-product.html',
            templateUrl: siteVar.basicUrl + "apps/modules/charts/xinghuodataProduct.html"+ version,
            data: {pageTitle: '产品统计'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/charts/xinghuodataProduct.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuodata-redActivity',{
            url: '/xinghuodata-redActivity.html',
            templateUrl: siteVar.basicUrl + "apps/modules/charts/xinghuodataRed.html"+ version,
            data: {pageTitle: '红包活动'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/charts/xinghuodataRed.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuodata-storeRed',{
            url: '/xinghuodata-storeRed.html',
            templateUrl: siteVar.basicUrl + "apps/modules/charts/xinghuodataStorered.html"+ version,
            data: {pageTitle: '店铺红包明细'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/charts/xinghuodataStorered.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuodata-storeregisterdetail',{
            url: '/xinghuodata-storeregisterdetail.html',
            templateUrl: siteVar.basicUrl + "apps/modules/charts/xinghuodataStoreregisterdetail.html"+ version,
            data: {pageTitle: '用户注册明细明细'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/charts/xinghuodataStoreregisterdetail.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuodata-storeregister',{
            url: '/xinghuodata-storeregister.html',
            templateUrl: siteVar.basicUrl + "apps/modules/charts/xinghuodataStoreregister.html"+ version,
            data: {pageTitle: '店铺首页注册'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/charts/xinghuodataStoreregister.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                        ]
                    }]);
                }]
            }
        })
    /**
     * 邀请码管理
     * **/
        .state('xinghuoinvitecode-inviteindex',{
            url: '/xinghuoinvitecode-inviteindex.html',
            templateUrl: siteVar.basicUrl + "apps/modules/invitecode/inviteindex.html"+ version,
            data: {pageTitle: '邀请码记录'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/invitecode/inviteindex.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuoinvitecode-editinvitecode',{
            url: '/xinghuoinvitecode-editinvitecode.html',
            templateUrl: siteVar.basicUrl + "apps/modules/invitecode/editinvitecode.html"+ version,
            data: {pageTitle: '创建邀请码'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/invitecode/editinvitecode.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuoinvitecode-datacodeanalysi',{
            url: '/xinghuoinvitecode-datacodeanalysi.html',
            templateUrl: siteVar.basicUrl + "apps/modules/invitecode/datacodeanalysi.html"+ version,
            data: {pageTitle: '数据分析'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/invitecode/datacodeanalysi.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
    /**
     * 非P2P项目管理
     * **/
        .state('xinghuogoldrainbow-subject',{
            url: '/xinghuogoldrainbow-subject.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/subject.html"+ version,
            data: {pageTitle: '非P2P项目列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/subject.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuogoldrainbow-subjectApply',{
            url: '/xinghuogoldrainbow-subjectApply.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/subjectApply.html"+ version,
            data: {pageTitle: '非P2P项目申请列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/subjectApply.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuogoldrainbow-editSubject',{
            url: '/xinghuogoldrainbow-editSubject.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/editSubject.html"+ version,
            data: {pageTitle: '编辑非P2P项目'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/editSubject.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuogoldrainbow-subjectEmailinfo',{
            url: '/xinghuogoldrainbow-subjectEmailinfo.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/subjectEmailinfo.html"+ version,
            data: {pageTitle: '理财师获取资料列表'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/subjectEmailinfo.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('sesame-subjectList',{
            url: '/sesame-subjectList.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/subjectList.html"+ version,
            data: {pageTitle: '非P2P项目列表-产品中心'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/notp2p/subjectList.js'+ version
                        ]
                    }]);
                }]
            }
        })

	.state('sesame-applyList',{
            url: '/sesame-applyList.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/applyList.html"+ version,
            data: {pageTitle: '非P2P项目预约订单'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/notp2p/applyList.js'+ version
                        ]
                    }]);
                }]
            }
        })
	.state('subject-informationBlank',{
            url: '/subject-informationBlank.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/informationBlank.html"+ version,
            data: {pageTitle: '项目资料管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/notp2p/informationBlank.js'+ version,
			    siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css',
                            siteVar.basicUrl + 'assets/admin/layout/css/summernote.css'
                        ]
                    }]);
                }]
            }
        })
        .state('subject-addInformation',{
            url: '/subject-addInformation.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/addInformation.html"+ version,
            data: {pageTitle: '项目资料管理-新增资料'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/notp2p/addInformation.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css',
                            siteVar.basicUrl + 'assets/admin/layout/css/summernote.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuogoldrainbow-fixationProduct',{
            url: '/xinghuogoldrainbow-fixationProduct.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/fixationProduct.html"+ version,
            data: {pageTitle: '类固收交易管理-产品中心'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/fixationProduct.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /*
        * 增加银产交交易录单
        * */
        .state('fixationProductAddYinchuan',{
            url: '/fixationProductAddYinchuan.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/fixationProductAddYinchuan.html"+ version,
            data: {pageTitle: '类固收交易管理-新增交易单'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/fixationProductAddYinchuan.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',

                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl+'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        /*
        * 项目来源管理
        * */
        .state('sourceManage',{
            url: '/sourceManage.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/sourceManage.html"+ version,
            data: {pageTitle: '项目来源管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/sourceManage.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuogoldrainbow-fixationToBuyRefund',{
            url: '/xinghuogoldrainbow-fixationToBuyRefund.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/fixationToBuyRefund.html"+ version,
            data: {pageTitle: '认购退款管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/fixationToBuyRefund.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuogoldrainbow-fixationNoBuyRefund',{
            url: '/xinghuogoldrainbow-fixationNoBuyRefund.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/fixationNoBuyRefund.html"+ version,
            data: {pageTitle: '无认购退款管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/fixationNoBuyRefund.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('notp2p-incomeDistribution',{
            url: '/notp2p-incomeDistribution.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/incomeDistribution.html"+ version,
            data: {pageTitle: '收益分配明细'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/incomeDistribution.js'+ version
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuogoldrainbow-addToBuyRefund',{
            url: '/xinghuogoldrainbow-addToBuyRefund.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/addToBuyRefund.html"+ version,
            data: {pageTitle: '认购退款管理-新增退款申请'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/addToBuyRefund.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuogoldrainbow-addNoBuyRefund',{
            url: '/xinghuogoldrainbow-addNoBuyRefund.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/addNoBuyRefund.html"+ version,
            data: {pageTitle: '无认购退款管理-新增退款申请'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/addNoBuyRefund.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /**
         * 银行卡变更管理
         * **/
        .state('sesame-changeBank',{
            url: '/sesame-changeBank.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/changeBank.html"+ version,
            data: {pageTitle: '银行卡变更管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/changeBank.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('sesame-newChangeBank',{
            url: '/sesame-newChangeBank.html',
            templateUrl: siteVar.basicUrl + "apps/modules/notp2p/newChangeBank.html"+ version,
            data: {pageTitle: '银行卡变更管理-新增变更申请'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/notp2p/newChangeBank.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })

    /**
     * 预约管理
     * **/
        .state('xinghuogoldrainbow-bookingManagement',{
            url: '/xinghuogoldrainbow-bookingManagement.html',
            templateUrl: siteVar.basicUrl + "apps/modules/booking/bookingManagement.html"+ version,
            data: {pageTitle: '预约管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/booking/bookingManagement.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('xinghuogoldrainbow-roadShow',{
            url: '/xinghuogoldrainbow-roadShow.html',
            templateUrl: siteVar.basicUrl + "apps/modules/booking/roadShow.html"+ version,
            data: {pageTitle: '路演活动预约'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/booking/roadShow.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /**
         *积分管理
         * **/
        .state('xinghuo-pointsRecord',{
            url: '/xinghuo-pointsRecord.html',
            templateUrl: siteVar.basicUrl + "apps/modules/points/pointsRecord.html"+ version,
            data: {pageTitle: '积分管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/points/pointsRecord.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css'
                        ]
                    }]);
                }]
            }
        })
        /*
    *redEnvelopes
    * 1.manage 2.creat 3.popConfirm
    * 2.author:longguangwu
    * 3.
    * */
        /*
        * 红包-管理
        *
        * */
        .state('redEnvelopesManage',{
            url: '/redEnvelopesManage.html',
            templateUrl: siteVar.basicUrl + "apps/modules/redEnvelopes/redEnvelopesManage.html"+ version,
            data: {pageTitle: '红包管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/redEnvelopes/redEnvelopesManage.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css'
                        ]
                    }]);
                }]
            }
        })

        .state('redEnvelopesCreate',{
            url:'/redEnvelopesCreate.html',
            templateUrl:siteVar.basicUrl+"apps/modules/redEnvelopes/redEnvelopesCreate.html"+version,
            data:{
                pageTitle:'红包创建'
            },
            resolve:{
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/redEnvelopes/redEnvelopesCreate.js'+ version,
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl+'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl+'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
    /**
     *服务费管理-新建
     * **/
        .state('serviceCharge-create',{
            url: '/serviceCharge-create.html',
            templateUrl: siteVar.basicUrl + "apps/modules/serviceCharge/serviceCharge-create.html"+ version,
            data: {pageTitle: '服务费管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/serviceCharge/serviceCharge-create.js'+ version
                        ]
                    }]);
                }]
            }
        })
    /**
     *服务费管理-查询
     * **/
        .state('serviceCharge-query',{
            url: '/serviceCharge-query.html',
            templateUrl: siteVar.basicUrl + "apps/modules/serviceCharge/serviceCharge-query.html"+ version,
            data: {pageTitle: '服务费管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/serviceCharge/serviceCharge-query.js'+ version
                        ]
                    }]);
                }]
            }
        })
    /**
     *服务费管理-列表
     * **/
        .state('serviceCharge-manage',{
            url: '/serviceCharge-manage.html',
            templateUrl: siteVar.basicUrl + "apps/modules/serviceCharge/serviceCharge-manage.html"+ version,
            data: {pageTitle: '服务费管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/serviceCharge/serviceCharge-manage.js'+ version
                        ]
                    }]);
                }]
            }
        })
        /**
         *白名单管理-白名单管理
         * **/
        .state('whiteList-manage',{
            url: '/whiteList-manage.html',
            templateUrl: siteVar.basicUrl + "apps/modules/whiteList/whiteList.html"+ version,
            data: {pageTitle: '白名单管理'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/whiteList/whiteList.js'+ version
                        ]
                    }]);
                }]
            }
        })
        /**
         *白名单管理-理财师邀请记录
         * **/
        .state('whiteList-invitedRecode',{
            url: '/whiteList-invitedRecode.html',
            templateUrl: siteVar.basicUrl + "apps/modules/whiteList/invitedRecode.html"+ version,
            data: {pageTitle: '理财师邀请记录'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/whiteList/invitedRecode.js'+ version
                        ]
                    }]);
                }]
            }
        })
    /*
    * 钱包开户
    * */
        .state('wallet-account',{
            url: '/wallet-account.html',
            templateUrl: siteVar.basicUrl + "apps/modules/wallet/walletAccount.html"+ version,
            data: {pageTitle: '钱包开户'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/wallet/walletAccount.js'+ version
                        ]
                    }]);
                }]
            }
        })
        /*
         * 钱包明细
         * */
        .state('wallet-detail',{
            url: '/wallet-detail.html',
            templateUrl: siteVar.basicUrl + "apps/modules/wallet/walletDetail.html"+ version,
            data: {pageTitle: '钱包明细'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl+'apps/modules/wallet/walletDetail.js'+ version
                        ]
                    }]);
                }]
            }
        })

    /*
    * 理财师等级
    * */
        .state('xinghuoother-licaishidengji',{
            url: '/xinghuoother-licaishidengji.html',
            templateUrl: siteVar.basicUrl + "apps/modules/other/licaishidengji.html"+ version,
            data: {pageTitle: '理财师等级'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/other/licaishidengji.js'+ version,
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
    * 随心宝持有资产
    * */
        .state('usermanage-sxbasset',{
            url: '/usermanage-sxbasset.html',
            templateUrl: siteVar.basicUrl + "apps/modules/usermanage/sxb-Asset.html"+ version,
            data: {pageTitle: '随心宝持有资产'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/usermanage/sxbAsset.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })/**
         * 红包管理-常规活动管理
         * **/
        .state('redEnvelopes-conventionalActivity',{
            url: '/redEnvelopes-conventionalActivity.html',
            templateUrl: siteVar.basicUrl + "apps/modules/redEnvelopes/conventionalActivity.html" + version,
            data: {pageTitle: '红包管理-新建活动'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/redEnvelopes/conventionalActivity.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        /**
         * 红包管理-新建活动第一步
         * **/
        .state('redEnvelopes-editActivitiesBasicInfo',{
            url: '/redEnvelopes-editActivitiesBasicInfo.html',
            templateUrl: siteVar.basicUrl + "apps/modules/redEnvelopes/editActivitiesBasicInfo.html" + version,
            data: {pageTitle: '红包管理-新建活动'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/redEnvelopes/editActivitiesBasicInfo.js'+ version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
                        ]
                    }]);
                }]
            }
        })
        /**
         * 红包管理-新建活动第二步
         * **/
        .state('redEnvelopes-editActivitiesParticipants',{
            url: '/redEnvelopes-editActivitiesParticipants.html',
            templateUrl: siteVar.basicUrl + "apps/modules/redEnvelopes/editActivitiesParticipants.html" + version,
            data: {pageTitle: '红包管理-新建活动'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/redEnvelopes/editActivitiesParticipants.js' + version
                        ]
                    }]);
                }]
            }
        })
        /**
         * 红包管理-新建活动第三步
         * **/
        .state('redEnvelopes-editActivitiesAssociated',{
            url: '/redEnvelopes-editActivitiesAssociated.html',
            templateUrl: siteVar.basicUrl + "apps/modules/redEnvelopes/editActivitiesAssociated.html" + version,
            data: {pageTitle: '红包管理-新建活动'},
            resolve: {
                deps: ['$ocLazyLoad',function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'MetronicApp',
                        files: [
                            siteVar.basicUrl + 'apps/modules/redEnvelopes/editActivitiesAssociated.js' + version,
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            siteVar.basicUrl + 'assets/admin/pages/scripts/components-pickers.js',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
                            siteVar.basicUrl + 'assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
                            siteVar.basicUrl + 'assets/global/css/components-rounded.css'
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
        //if(!$.cookie("xinghuoadmin_uid") && !$.cookie("xinghuoadmin_token")) {
        //    location.href = siteVar.serverUrl+"/xhsso/index.shtml";
        //    return ;
        //}
        //没登陆跳登录
        if(!$.cookie("xinghuoadmin_uid")) {
            location.href = siteVar.serverUrl+"/xhsso/index.shtml";
            return ;
        }
        //如果过期，重新获取
        if(!$.cookie("realname")) {
            localStorage.removeItem("menuinfo");
            $.ajax({
                url: siteVar.serverUrl+'/xinghuo/getMenu.json',
                method: 'post',
                crossDomain: true,
            }).then(function(data){
                if(data.result == "SUCCESS"){
                    localStorage.menuinfo = JSON.stringify(data.appResData.menuinfo);
                    $.cookie("realname",data.appResData.realname,{ expires: 1 });
                    location.reload();
                }else{
                    alert(data.errMsg);
                }
            })
        }
        if(!!$.cookie('realname') && !localStorage.getItem('menuinfo')){
            $.ajax({
                url: siteVar.serverUrl+'/xinghuo/getMenu.json',
                method: 'post',
                crossDomain: true,
            }).then(function(data){
                if(data.result == "SUCCESS"){
                    localStorage.menuinfo = JSON.stringify(data.appResData.menuinfo);
                    $.cookie("realname",data.appResData.realname,{ expires: 1 });
                    location.href = "index.html";
                }else{
                    alert(data.errMsg);
                }
            })
        }
    })
}]);


//公用函数服务
MetronicApp.factory('tools',function(){
    function padding0(num) {
        var str = '';
        while (num--) {
            str += '0';
        }return str;
    }function padding0(num) {
        var str = '';
        while (num--) {
            str += '0';
        }return str;
    }

    function split(number) {
        var str = void 0;
        if (number < 1e-6) {
            str = noExponent(number);
        } else {
            str = number + '';
        }
        var index = str.lastIndexOf('.');
        if (index < 0) {
            return [str, 0];
        } else {
            return [str.replace('.', ''), str.length - index - 1];
        }
    }
    /**
     * 计算
     * @param {*} l 操作数1
     * @param {*} r 操作数2
     * @param {*} sign 操作符
     * @param {*} f 精度
     */
    function operate(l, r, sign, f) {
        switch (sign) {
            case '+':
                return (l + r) / f;
            case '-':
                return (l - r) / f;
            case '*':
                return l * r / (f * f);
            case '/':
                return l / r;
        }
    }

    /**
     * 解决小数精度问题
     * @param {*} l 操作数1
     * @param {*} r 操作数2
     * @param {*} sign 操作符
     * fixedFloat(0.3, 0.2, '-')
     */
    function fixedFloat(l, r, sign) {
        var arrL = split(l);
        var arrR = split(r);
        var fLen = Math.max(arrL[1], arrR[1]);

        if (fLen === 0) {
            return operate(Number(l), Number(r), sign, 1);
        }
        var f = Math.pow(10, fLen);
        if (arrL[1] !== arrR[1]) {
            if (arrL[1] > arrR[1]) {
                arrR[0] += padding0(arrL[1] - arrR[1]);
            } else {
                arrL[0] += padding0(arrR[1] - arrL[1]);
            }
        }
        return operate(Number(arrL[0]), Number(arrR[0]), sign, f);
    }


    var tools = {
        //加法
        add:function add(l, r) {
            return fixedFloat(l, r, '+');
        },
        //减法
        sub:function sub(l, r) {
            return fixedFloat(l, r, '-');
        },
        //乘法
        mul:function mul(l, r) {
            return fixedFloat(l, r, '*');
        },
        //除法
        div: function div(l, r) {
            return fixedFloat(l, r, '/');
        },
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
        ajaxError403: function ( err ) {
            console.log(err);
            if(err.status == 403){
                alert("没有权限！！");
                //$("#xinghuoLoading").remove();
                //var timer = setTimeout(function(){
                //    alert("没有权限！！");
                //    clearTimeout(timer);
                //}, 0);
            }
        },
        /**
         * [toJSDate 日期格式转换]
         * @param  {[String]} s [后台传来的时间格式]
         * @return {[String]}   [本地日期格式]
         */
        toJSDate: function(s){
            var self = this;
            if(!s) return "";
            var D = new Date(+s);
            var date = [D.getFullYear(), self.twoNum(D.getMonth()+1), self.twoNum(D.getDate())];
            var time = D.toTimeString().split(" ")[0];
            return date.join("-")+" "+time;
        },
        /**
         * [toJSDate 日期格式转换没有时间]
         * @param  {[String]} s [后台传来的时间格式]
         * @return {[String]}   [本地日期格式]
         */
        toJSYMD: function(s){
            var self = this;
            if(!s) return "";
            var D = new Date(+s);
            var date = [D.getFullYear(), self.twoNum(D.getMonth()+1), self.twoNum(D.getDate())];
            //var time = D.toTimeString().split(" ")[0];
            return date.join("-");
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
        /**
         * [ajaxForm formAJAX提交]
         * @param  {[Object]} conf.ele [提交Form元素]
         * @param  {[String]} conf.action [提交地址]
         * @param  {[Function]} conf.onStart []
         * @param  {[Function]} conf.onComplete [提交回掉函数]
         * @return {[type]}      [description]
         */
        ajaxForm: function (conf) {
            var settings = {
                "ele": null,
                "action": '',
                onStart: function() { },
                onComplete: function(response) { },
                onCancel: function() { }
            }

            var uploading_file = false;

            if ( conf ) {
                $.extend(true, settings, conf);
            }

            if(!settings.ele || !settings.action) return console.log("error: application");
            if(settings.action && settings.action.indexOf("http") != 0){
                settings.action = siteVar.serverUrl + settings.action;
            };
            $element = $(settings.ele);

            // if($element.data('ajaxUploader-setup') === true) return;

            var handleResponse = function(loadedFrame, element) {

                var response, responseStr = $(loadedFrame).contents().find('body').text();

                try {
                    //response = $.parseJSON($.trim(responseStr));
                    response = JSON.parse(responseStr);
                } catch(e) {
                    response = responseStr;
                }

                uploading_file = false;

                // 返回回掉
                settings.onComplete.apply(loadedFrame, [response, settings.params]);
            };


            var wrapElement = function(element) {

                var frame_id = 'ajaxUploader-iframe-' + Math.round(new Date().getTime() / 1000);

                if($("body iframe").length && /ajaxUploader-iframe/g.test($("body iframe").attr("id"))){
                    frame_id = $("body iframe").attr("id");
                }else{
                    $('body').after('<iframe width="0" height="0" style="display:none;" name="'+frame_id+'" id="'+frame_id+'"/>');
                }

                $('#'+frame_id).get(0).onload = function() {
                    handleResponse(this, element);
                };

                $element.attr({"target": frame_id, "action": settings.action, "method": "POST", "enctype": "multipart/form-data"});
            }


            var upload_file = function() {

                uploading_file = true;

                wrapElement($element);

                var ret = settings.onStart.apply($element, [settings.params]);

                if(ret !== false) {
                    $element.submit(function(e) {
                        if(e.stopPropagation) {
                            e.stopPropagation();
                        }
                        e.cancelBubble = true;
                        e.returnValue = false;
                    }).submit();
                }
            };

            if (!uploading_file) {
                upload_file();
            }

            // Mark this element as setup
            // $element.data('ajaxUploader-setup', true);

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
                    if(toData.errorcode == "101") return window.location.href = toData.data;
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
        /*美化alert*/
        interalert: function (data) {
            $("#js_dialog_permission .js_content").html('<span class="ui_red">'+data+'</span>');
             $("#js_dialog_permission").modal("show");
        },
        /**
         * [getALLNums 表格头部总信息]
         * @param  {[json]} data [服务器返回数据]
         * @return {[type]}      [description]
         */
        getALLNums: function(data){

            var type = $("#js_form").attr("dtype");

            if(data.success && data.info ){

                if(type == "trade"){
                    $("#js_panel_head").html('交易总额：<span class="ui_red">'+data.info.totalTradeAmount+'</span> 佣金总额：<span class="ui_red">'+data.info.totalFeeAmount+'</span>');
                }else if(type == "payment"){
                    $("#js_panel_head").html('交易总额：<span class="ui_red">'+data.info.totalPaysum+'</span>');
                }else if(type == "settled" && $("#js_yixinstatus").length && $("#js_yixinstatus").val() == "1"){
                    $("#js_panel_head").html('<span class="ui_red">'+$("#js_month").val()+'</span>&nbsp;宜信员工已结算总额(税前)：<span class="ui_red">'+data.info.fmsumunsettled+'</span>元&nbsp;&nbsp;交易总额：<span class="ui_red">'+data.info.fmsumamount+'</span>元');
                }else if(type == "settled" && $("#js_yixinstatus").length && $("#js_yixinstatus").val() == "0"){
                    $("#js_panel_head").html('<span class="ui_red">'+$("#js_month").val()+'</span>&nbsp;非宜信员工已结算总额(税前)：<span class="ui_red">'+data.info.fmsumunsettled+'</span>元&nbsp;&nbsp;交易总额：<span class="ui_red">'+data.info.fmsumamount+'</span>元');
                }else if(type == "nosettle" && $("#js_yixinstatus").length && $("#js_yixinstatus").val() == "1"){
                    $("#js_panel_head").html('<span class="ui_red">'+$("#js_month").val()+'</span>&nbsp;宜信员工未结算总额(税前)：<span class="ui_red">'+data.info.fmsumunsettled+'</span>元');
                }else if(type == "nosettle" && $("#js_yixinstatus").length && $("#js_yixinstatus").val() == "0"){
                    $("#js_panel_head").html('<span class="ui_red">'+$("#js_month").val()+'</span>&nbsp;非宜信员工未结算总额(税前)：<span class="ui_red">'+data.info.fmsumunsettled+'</span>元');
                }else if(type == "dataproduct"){
                    $("#js_panel_head").html('总销售额：<span class="ui_red">'+data.info.fmsumamount+'</span>元,&nbsp;&nbsp;已到期销售额：<span class="ui_red">'+data.info.fmsumcalltime+'</span>元,&nbsp;&nbsp;未到期销售额：<span class="ui_red">'+data.info.fmsumuncalltime+'</span>元');
                }else if(type == "datared"){
                    $("#js_panel_head").html('红包总额：<span class="ui_red">'+data.info.fmallred+'</span>元,&nbsp;&nbsp;新注册交易用户数：<span class="ui_red">'+data.info.validdealnum+'</span>');
                }else if(type == "storeRegister"){
                    $("#js_panel_head").html('红包总额：<span class="ui_red">'+data.info.allred+'</span>元,&nbsp;&nbsp;理财经理数：<span class="ui_red">'+data.info.storeuserNum+'</span>,&nbsp;&nbsp;店铺首页注册用户数：<span class="ui_red">'+data.info.shopindexRegNum+'</span>,&nbsp;&nbsp;实名认证用户数：<span class="ui_red">'+data.info.realnamevalidateNum+'</span>');
                }else if(type == "redempt" || type == "redemptSuixinbao"){
                    // var cash = data.info? data.info: 0;
                    $("#js_panel_head").html('赎回总金额：<span class="ui_red">'+data.info.totalRedeemSum+'</span>元');
                }else if(type == "settledInfo"){
                    $("#js_panel_head").find(".js_trade").html(data.info.totalTradeAmount+"元");
                    $("#js_panel_head").find(".js_fee").html(data.info.totalFeeAmount+"元");
                }else if(type == "fundRedeem") {
                    $("#js_panel_head").html('赎回总金额：<span class="ui_red">'+data.info+'</span>元');
                }

            }
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
                    "style": "width: 700px; left: 50%; margin-left: -350px; top: 20%;overflow:hidden!importanr"
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

                //
                progress = '<span style="width:66px; height: 66px; border-radius: 33px;  display: inline-block; overflow: hidden;"><img src="'+ siteVar.basicUrl +'assets/global/img/loading2.gif" style="width:66px;">'
                $("body").append($("<div>",{
                    "id": "js_dialog_progress",
                    "class": "modal fade",
                    "tabindex": "-1"
                }).html('<div class="modal-dialog js_content" style="width: 500px; text-align: center;">'+progress+'</div>'));

            }
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
         * [linkSelect 产品联动Select]
         * @param  {[type]} obj [配置参数]
         * @return {[type]}     [description]
         */
        linkSelect: function (obj) {

            var self = this;
            var config = {
                "p": $("#js_selelct_productid"),
                "subp": $("#js_select_subproductid"),
                "pname": $("#productname"),
                "subpname": $("#subproductname")
            };
            $.extend(true, config, obj);

            var objPname = config.p.parents("form").find(config.pname.selector),
                objSubPname = config.p.parents("form").find(config.subpname.selector);

            config.p.on("change", function(){

                if(objPname.length){
                    if(!$(this).val()){
                        objPname.val("");
                        objSubPname.val("");
                    }else{
                        objPname.val( this.options[this.selectedIndex].text );
                    }
                }

                var data = {};

                if(config.subp.attr("status")){
                    $.extend(true, data, {"status": config.subp.attr("status")});
                }

                if(config.subp.attr("querytype")){
                    $.extend(true, data, {"querytype": config.subp.attr("querytype")});
                }
                $.ajax({
                    type: "post",
                    url: "/xinghuoproduct/subprducts/"+$(this).val()+".shtml",
                    data: data,
                    dataType: "json",
                    success: function(data){
                        self.interceptor(data);
                        if(data.success){
                            var str = '<option value="">请选择</option>';
                            $.each(data.data, function (i, e) {
                                str += '<option value="'+e.key+'">'+e.value+'</option>';
                            });
                            config.subp.html(str);
                        }

                    },
                    error: function(err){
                        self.ajaxError(err);
                    }
                })
            });

            config.subp.on("change", function(){

                // 交易管理 不传子产品名称
                if($(this).parents("#js_form").length && $(this).parents("#js_form").attr("dtype") == "trade") return;

                if(objSubPname.length){
                    if(!$(this).val()){
                        objSubPname.val("");
                    }else{
                        objSubPname.val( this.options[this.selectedIndex].text );
                    }
                }
            })
        },
        /**
         * [linkSelectThree 新产品联动Select(三联动)]
         * @param  {[type]} obj [配置参数]
         * @return {[type]}     [description]
         */
        linkSelectThree: function (obj) {

            var self = this;
            var config = {
                "type": $("#js_new_select_type"),
                "sery": $("#js_new_select_sery"),
                "product": $("#js_new_select_product"),
                "typeStr": $("#new_typeStr"),
                "seryStr": $("#new_seryStr"),
                "productStr": $("#new_productStr"),
                "soruceStr" :$("#new_soruce")
            };

            $.extend(true, config, obj);

            var typeStr = config.type.parents("form").find(config.typeStr.selector),
                seryStr = config.type.parents("form").find(config.seryStr.selector),
                productStr = config.type.parents("form").find(config.productStr.selector),
                soruceStr =config.type.parents("form").find(config.soruceStr.selector);

            config.type.on("change", function(){

                if(typeStr.length){
                    if(!$(this).val()){
                        typeStr.val("");
                        seryStr.val("");
                        productStr.val("");
                        soruceStr.val("");
                    }else{
                        typeStr.val( this.options[this.selectedIndex].text );
                        soruceStr.val($(config.type).find ("option:selected").attr("source"));
                    }
                }

                var data = {
                    "category" : config.type.val(),
                    "series" : config.sery.val(),
                    "source" : $(config.type).find ("option:selected").attr("source"),
                }
                $.ajax({
                    type: "post",
                    url: "/xinghuoproduct/productSelector.shtml",
                    data: data,
                    dataType: "json",
                    success: function(data){
                        self.interceptor(data);
                        if(data.success){
                            if(data.data.seriesList && data.data.seriesList.length){
                                var str = '<option value="">请选择</option>';
                                $.each(data.data.seriesList, function (i, e) {
                                    str += '<option value="'+e.key+'">'+e.value+'</option>';
                                });
                                config.sery.html(str);
                                config.product.html("");
                            }else{
                                config.sery.html("");
                                config.product.html("");
                            }
                        }

                    },
                    error: function(err){
                        self.ajaxError(err);
                    }
                })
            });

            config.sery.on("change", function(){

                if(typeStr.length){
                    if(!$(this).val()){
                        seryStr.val("");
                        productStr.val("");
                    }else{
                        typeStr.val( this.options[this.selectedIndex].text );
                    }
                }

                var data = {
                    "category" : config.type.val(),
                    "series" : config.sery.val(),
                }

                $.ajax({
                    type: "post",
                    url: "/xinghuoproduct/productSelector.shtml",
                    data: data,
                    dataType: "json",
                    success: function(data){
                        self.interceptor(data);
                        if(data.data.nameList && data.data.nameList.length){
                            var str = '<option value="">请选择</option>';
                            $.each(data.data.nameList, function (i, e) {
                                str += '<option value="'+e.key+'">'+e.value+'</option>';
                            });
                            config.product.html(str);
                        }else{
                            config.product.html("");
                        }

                    },
                    error: function(err){
                        self.ajaxError(err);
                    }
                })
            });

            config.product.on("change", function(){

                // 交易管理 不传子产品名称
                // if($(this).parents("#js_form").length && $(this).parents("#js_form").attr("dtype") == "trade") return;

                if(productStr.length){
                    if(!$(this).val()){
                        productStr.val("");
                    }else{
                        productStr.val( this.options[this.selectedIndex].text );
                    }
                }
            })
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
         * [addRateTemplate 添加费率模板]
         * @param {Function} callback [添加成功的回掉]
         */
        addRateTemplate: function (callback) {
            var self = this;
            $("#js_dialog").off("click");
            $("#js_dialog").on("click", "#js_add_rate_ran", function(){

                if($(this).attr("key") == "open") return ;
                $(this).attr("key", "open");

                var trs =  $("#js_save_raterang_table tbody").find("tr"),
                    firstVlaue = 0;
                if(trs.length){
                    var str = trs.eq(trs.length-1).find('td').eq(1).text();
                    firstVlaue = str.substring(1, str.length);
                }

                var tr = $("<tr>");
                var td1 = $("<td>").html('<input type="text" class="form-control" readonly value="'+firstVlaue+'">');
                var td2 = $("<td>").html('<input type="text" class="form-control js_need_validator">');
                var td3 = $("<td>").html('<div class="col-xs-10"><input type="text" class="form-control js_need_validator"></div><span class="fn-ms" style="line-height: 34px; color: #cc0000;">%</span>');
                var td4 = $("<td>").html('<div class="col-lg-12 col-xs-12 ui_center"><a href="javascript:;" class="btn btn-success btn-xs js_add">保存</a>'+
                    '<a href="javascript:;" class="btn btn-danger btn-xs js_delete" style="margin-left:10%">删除</a></div>');

                tr.append(td1).append(td2).append(td3).append(td4);

                $("#js_save_raterang_table tbody").append(tr);

                tr.find(".js_need_validator").eq(0).Validator({hmsg: "请输入推荐费基数", regexp: /^([1-9]{1}[0-9]{0,8})$|0/, showok: false, style: {placement: "top"}, emsg: "推荐费基数不能为空", rmsg: "推荐费基数不能超过9位整数",
                    fn: function (v, tag) {return (td1.find("input").val()*1 < v*1);}, fnmsg: "最高推荐费基数必须大与起始推荐基数"});

                tr.find(".js_need_validator").eq(1).Validator({hmsg: "请输入费率系数", regexp: /^((10|10\.00)|([1-9]{1})|([0-9]{1}\.[0-9]{1,2}))$/, showok: false, style: {placement: "top"}, emsg: "费率系数不能为空", rmsg: "费率系数必须小于等于10，小数只保留2位小数"});
            });

            $("#js_dialog").on("click", "#js_save_raterang_table .js_delete", function(){

                var p = $(this).parents("tr");

                if(p.index() != p.parent().find("tr").length-1 ) return $("#js_dialog #js_add_rate_ran").attr("key","close");

                p.remove();
                return $("#js_dialog #js_add_rate_ran").attr("key","close");

            });

            $("#js_dialog").on("click", "#js_save_raterang_table .js_add", function(){
                var p = $(this).parents("tr");
                var inputs = p.find("input");
                if(false == self.Validator( p.find(".js_need_validator") )) return false;

                var str = '<tr class="js_rate_template_row"><td val="'+inputs[0].value+'">&gt;='+inputs[0].value+'</td><td val="'+inputs[1].value+'">&lt;'+inputs[1].value+'</td><td val="'+inputs[2].value+'">'+inputs[2].value+'%</td><td><a href="javascript:;" class="btn btn-danger btn-sm js_delete">删除</a></td></tr>'

                $(this).parents("tbody").append(str);
                p.remove();
                return $("#js_dialog #js_add_rate_ran").attr("key","close");
            });

            $("#js_dialog").on("click", "#js_save_ratetemplate_submit", function(){

                var templateRow = [];
                $("#js_save_raterang_table .js_rate_template_row").each(function (i, e) {
                    var tds = $(this).find("td");
                    templateRow.push({"startamount": tds.eq(0).attr("val"), "endamount": tds.eq(1).attr("val"), "chargerate": tds.eq(2).attr("val")});
                });

                if(false == self.Validator($("#js_dialog #js_save_template_form [name]"))) return false;
                if(!templateRow.length) return alert("费率不能为空！");

                var data = self.getFormele({}, $("#js_dialog #js_save_template_form"));

                $.extend(true, data, {"rateRangeList": templateRow});

                var _this = this;
                if(!self.ajaxLocked(_this)) return;

                $.ajax({
                    type: "post",
                    url: "/xinghuoproduct/addRatetemplate.shtml",
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: 'application/json',
                    mimeType: 'application/json',
                    success: function(data){
                        if(data.success && typeof callback == "function"){
                            $("#js_dialog").modal("hide");
                            self.ajaxOpened(_this)
                            callback(data);

                        }else if(!data.success){
                            if(data.errorcode == "101") return window.location.reload();
                            alert(data.msg);
                            self.ajaxOpened(_this)
                        }
                    },
                    error: function(err){
                        self.ajaxOpened(_this);
                        self.ajaxError(err);
                    }
                })

            })
        },
        /**
         * [resetCmsSelect 发布内容的三个select、动态添加的]
         * @param  {[Object]} obj [description]
         * @return {[type]}     [description]
         */
        resetCmsSelect: function (obj) {

            /**
             * [productStr 产品select]
             * @type {String}
             */
            var productStr = '<option value="">请选择</option>';
            $.each(obj.products, function (i, e) {
                productStr += '<option value="'+e.key+'">'+e.value+'</option>';
            });
            $("#js_webcms_add_form #selectProduct").html(productStr);

            /**
             * [subTypeStr 子类select]
             * @type {String}
             */
            var subTypeStr = '<option value="">请选择</option>';
            $.each(obj.subtypes, function (i, e) {
                subTypeStr += '<option value="'+e.key+'">'+e.value+'</option>';
            });
            $("#js_webcms_add_form #subCmsType").html(subTypeStr);

            /**
             * [levelStr 级别select]
             * @type {String}
             */
            var levelStr = '<option value="">请选择</option>';
            $.each(obj.userlevels, function (i, e) {
                levelStr += '<option value="'+e.id+'">'+e.levelname+'</option>';
            });
            $("#js_webcms_add_form #js_webcms_levelid").html(levelStr);

        },
        /**
         * [chartNumFormat 图表数据去小数点]
         * @param  {[Array]} 	 [原始数据]
         * @return {[Array]}     [格式化完的数据]
         */
        chartNumFormat: function (strArr) {

            var arr = [];

            $.each(strArr, function (i, e) {

                arr.push((e*1).toFixed(0))

            });

            return arr
        },
        /**
         * json按键名排序
         * 如{"3":"投资汇款中","2":"准备资料中","1":"客户签约中","0":"提交申请","6":"终止","5":"完成","4":"递交移民局"};
         * 转成{0: "提交申请", 1: "客户签约中", 2: "准备资料中", 3: "投资汇款中", 4: "递交移民局", 5: "完成", 6: "终止"}
         * @param obj
         */
        objOrderByKey: function(obj){
            var arr1 = [],newObj={};
            for(var key in obj){
                arr1.push(key);
            }
            arr1.sort();
            for(var i in arr1){
                newObj[arr1[i]] = obj[arr1[i]];
            }
            return newObj;
        },
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
        /* 日期相减获得天数 */
        DateMinus: function(date1,date2){//date1:小日期   date2:大日期
            var sdate = new Date(date1);
            var now = new Date(date2);
            var days = now.getTime() - sdate.getTime();
            var day = parseInt(days / (1000 * 60 * 60 * 24));
            return day;
        }
    };
    return tools;
});
