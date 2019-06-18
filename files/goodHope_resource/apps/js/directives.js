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