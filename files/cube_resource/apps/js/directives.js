/***
GLobal Directives
***/

// Route State Load Spinner(used on page or content load)
MetronicApp.directive('ngSpinnerBar', ['$rootScope',
    function($rootScope) {
        return {
            link: function(scope, element, attrs) {
                // by defult hide the spinner bar
                element.addClass('hide'); // hide spinner bar by default

                // display the spinner bar whenever the route changes(the content part started loading)
                $rootScope.$on('$stateChangeStart', function() {
                    element.removeClass('hide'); // show spinner bar
                });

                // hide the spinner bar on rounte change success(after the content loaded)
                $rootScope.$on('$stateChangeSuccess', function() {
                    element.addClass('hide'); // hide spinner bar
                    $('body').removeClass('page-on-load'); // remove page loading indicator
                    Layout.setSidebarMenuActiveLink('match'); // activate selected link in the sidebar menu
                   
                    // auto scorll to page top
                    setTimeout(function () {
                        Metronic.scrollTop(); // scroll to the top on content load
                    }, $rootScope.settings.layout.pageAutoScrollOnLoad);     
                });

                // handle errors
                $rootScope.$on('$stateNotFound', function() {
                    element.addClass('hide'); // hide spinner bar
                });

                // handle errors
                $rootScope.$on('$stateChangeError', function() {
                    element.addClass('hide'); // hide spinner bar
                });
            }
        };
    }
])

// Handle global LINK click
MetronicApp.directive('a', function() {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                elem.on('click', function(e) {
                    e.preventDefault(); // prevent link click for above criteria
                });
            }
        }
    };
});
// Handle Dropdown Hover Plugin Integration
MetronicApp.directive('dropdownMenuHover', function () {
  return {
    link: function (scope, elem) {
      elem.dropdownHover();
    }
  };  
});
// 查询条件的展开和收起
MetronicApp.directive('formShow',function(){
    return {
        template: '<a href="javascript:;" class="btn btn-success btn-sm">收起</a>',
        restrict: 'A',
        replace: true,
        scope: {
            formShow: '@'
        },
        link: function(scope,elem,attrs){
            elem.on('click',function(){
                var text = elem.html();
                if(text==="收起"){
                    elem.html("展开");
                    $("#form-cot").hide();
                }else {
                    elem.html("收起");
                    $("#form-cot").show();
                };
            });

        }
    }
});
MetronicApp.directive('sidebarMenu',function(){
    var template = "<ul class=\"page-sidebar-menu\" data-keep-expanded=\"false\" data-auto-scroll=\"true\" data-slide-speed=\"200\" ng-class=\"{'page-sidebar-menu-closed': settings.layout.pageSidebarClosed}\">" +
            "<li class=\"bigmenu\" ng-repeat=\"item in menu\">" +
            "<a href=\"javascript:;\"> <i class=\"{{item.menuImage}}\" ng-if=\"item.menuImage\" /><span class=\"title\">{{item.menuName}}</span> <span class=\"arrow\"></span> </a>" +
            "<ul class=\"sub-menu\"> <li ng-repeat=\"index in item.childMenus\"> <a ng-href=\"#/{{index.resUrl}}\">{{index.resName}} </a> </li> </ul>" +
            "</li>" +
            "</ul>";
    return {
        restrict: 'A',
        template: template
    }
});
/**
 * 通知栏
 * **/
MetronicApp.filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);

MetronicApp.directive("notificationBar", [function () {
    return {
        restrict:"A",
        template:'<div ng-class="noticeClass"><i></i>通知栏</div><div class="notification-content" ng-if="showFlag"><div  ng-if="notices.length > 0"><dl ng-repeat="item in notices"><dt class="text-left">【{{item.title}}】</dt><dd><p ng-bind-html="item.content | to_trusted"></p><p class="text-right">{{item.time}}</p></dd></dl></div><div ng-if="notices.length == 0" class="no-notice">暂无信息</div></div>',
        link: function (scope, element, attributes) {
            $(element).on("click", '.notification-title', function(){
                scope.$apply(function(){
                    scope.action.toggle();
                });
            });
            $(element).on("click", "a", function(e){
                scope.action.viewInfo(e);
            });
        },
        controller:function($scope,$rootScope,tools, $http, $interval, $state, $sce){
            $scope.showFlag = false;
            $scope.notices = [];
            $scope.noticeClass = 'notification-title';
            $scope.action = {
                toggle: function () {
                    $scope.showFlag  = !$scope.showFlag;
                },
                getNotices:function(){
                    $http({
                        method: "POST",
                        url: siteVar.serverUrl + "customerClue/queryNoticeCustomerClue.json",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                        }
                    }).success(function(data, status) {
                        if(!tools.interceptor(data)) return;
                        if(data.success){
                            //$rootScope.clientData= data.data;
                            if(data.data && data.data.length > 0){
                                $scope.noticeClass = 'notification-title active';
                                var list = data.data;
                                $scope.notices = list.map(function(item, index){
                                    var obj = {};
                                    if(item.noticeType == "noticeTransfer"){
                                        obj.title = "转交客户通知";
                                        obj.content = item.firstScreenUser + ' 向您转交了' + item.screenCommuDetail.firstScreenFilterResLab + '的客户' + item.userName + '，请<a target="_blank" href="#/editWealthManager.html?clueId='+ item.clueId +'" data-id="'+ item.clueId +'" data-type="secondScreen">点击查看</a>，或刷新客户线索池列表查看。';
                                    }else{
                                        obj.title = "后续沟通提醒";
                                        if(item.noticeType == "noticeScreen"){
                                            obj.content = '请在' + item.noticeTime + '与客户' + item.userName + '联系，请<a target="_blank" href="#/editScreen.html?clueId=' + item.clueId+ '" data-id="'+ item.clueId +'" data-type="firstScreen">点击查看</a>，或刷新客户线索池列表查看。';
                                        }else{
                                            obj.content = '请在' + item.noticeTime + '与客户' + item.userName + '联系，请<a target="_blank" href="#/editWealthManager.html?clueId='+ item.clueId +'" data-id="'+ item.clueId +'" data-type="secondScreen">点击查看</a>，或刷新客户线索池列表查看。';
                                        };
                                    };
                                    obj.time = item.noticeTime;
                                    return obj;
                                });
                            };
                        }

                    }).error(function(data, status) {
                        //alert("获取通知失败，请与管理员联系。");
                        return;
                    });
                },
                viewInfo:function(e){
                    var target = e.currentTarget, id = $(target).attr("data-id"), type = $(target).attr("data-type");
                    $http({
                        method: "POST",
                        url: siteVar.serverUrl + "customerClue/updateIsRead.json",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                        },
                        data:$.param({
                            clue_id : id,
                            type : type
                        })
                    }).success(function(data, status) {
                        $scope.action.getNotices();
                    }).error(function(data, status) {
                        alert("获取通知详情失败，请与管理员联系。");
                        return;
                    });
                }
            };
            $scope.action.getNotices();
            $interval(function(){
                $scope.action.getNotices();
            }, 1000*60*5)
        }
    }
}]);