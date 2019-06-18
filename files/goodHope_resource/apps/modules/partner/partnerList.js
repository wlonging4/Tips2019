'use strict';
function partnerListController($scope, tools, DTOptionsBuilder, DTColumnBuilder, $http, $modal) {
    $scope.form = {
        createTimeBeg: tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30),
        createTimeEnd:tools.toJSYMD(new Date().getTime())
    };


    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/user/queryUserByParam.json',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('realName').withTitle('合伙人姓名').withOption('sWidth','100px').renderWith(function(data, type, full) {
            return data ? '<a class="detailInfo" data-id="' + full.userId + '" href="javascript:void(0)">' + data + '</a>' : '';
        }),
        DTColumnBuilder.newColumn('userId').withTitle('合伙人ID').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('createTime').withTitle('注册时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('recommUserId').withTitle('推荐人ID').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('studioStatus').withTitle('是否注册工作室').withOption('sWidth','100px').renderWith(function(data, type, full) {
            return data === 0 ?'未开作工室':'已开工作室';
        }),
        DTColumnBuilder.newColumn('lastLoginTime').withTitle('上次登录时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('industry').withTitle('从事行业').withOption('sWidth','80px')
    ];
    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        $scope.form.createTimeBeg = tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30);
        $scope.form.createTimeEnd = tools.toJSYMD(new Date().getTime());
        vm.dtInstance.rerender();
    };
    $scope.search = function(){
        for(var prop in $scope.form){
            if(!$scope.form[prop]) delete $scope.form[prop];
        }
        var keysArr = Object.keys($scope.form);
        if(keysArr.length === 0){
            return tools.interalert('查询条件不能为空!')
        }
        vm.dtInstance.rerender();
    };

    $scope.export = function (e) {
        var target = e.target, $target = $(target);
        tools.export($target)
    };

    function fnDrawCallback(){
        var table = $("#dataTables");

        table.off("click").on("click", ".detailInfo", function () {
            var userId = $(this).attr("data-id");
            $http({
                method: "POST",
                url: G.server + "/user/getUserInfo.json",
                data:$.param({
                    userId:userId
                }),
            }).then(function (data) {
                var info = data.data;
                if(!info.success) {
                    return alert(info.msg);
                };
                $modal.open({
                    backdrop: true,
                    backdropClick: true,
                    dialogFade: false,
                    keyboard: true,
                    templateUrl : 'detailModal.html',
                    controller : detailCtrl,
                    resolve:{
                        info:function () {
                            return info.data
                        }
                    }
                });
            });

        });

        function detailCtrl($scope, $modalInstance, info) {
            $scope.info = info;
            $scope.G = G;
            $scope.info.birthdayStr = info.birthday ? tools.toJSYMD(info.birthday) : '';
            $scope.info.createTimeStr = info.createTime ? tools.toJSDate(info.createTime) : '';
            $scope.info.lastLoginTimeStr = info.lastLoginTime ? tools.toJSDate(info.lastLoginTime) : '';
            $scope.close = function() {
                $modalInstance.close();
            };
        }

    }
}
