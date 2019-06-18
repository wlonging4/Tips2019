'use strict';
function intentSignController($scope, tools, DTOptionsBuilder, DTColumnBuilder, $http, $modal, EnumeratorCollection) {
    $scope.form = {
        startTime: tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30),
        endTime:tools.toJSYMD(new Date().getTime())
    };

    $scope.select = {};

    /**
     * 枚举
     * **/

    EnumeratorCollection.getSelectList('SignedContractStatusEnum,SignedRoleEnum').then(function (data) {
        $scope.select = data.data;
    });


    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: G.server + '/studio/getSignedContractList.json',
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
        DTColumnBuilder.newColumn('contractNo').withTitle('合同编号').withOption('sWidth','160px').renderWith(function(data, type, full) {
            return '<a class="detailInfo" data-contractNo="' + data + '" href="javascript:void(0)">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('userId').withTitle('合伙人ID').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('customerChineseName').withTitle('客户姓名').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('createTime').withTitle('提交日期').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('productTypeIdStr').withTitle('产品类型').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('productName').withTitle('产品名称').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('signedAmount').withTitle('签单金额').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('documentTypeStr').withTitle('客户证件类型').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('statusStr').withTitle('签单状态').withOption('sWidth','80px').renderWith(function(data, type, full) {
            return '<span class="status">' + data + '</span>';
        }),
        DTColumnBuilder.newColumn('signedRoleStr').withTitle('签单角色').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('remark').withTitle('备注').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('contractNo').withTitle('操作').withOption('sWidth','70px').renderWith(function(data, type, full) {
            return '<a href="javascript:void(0)"  data-placement="left" data-contractNo="' + data + '" data-flag=0 class="changeStatus">更改状态</a>';
        })
    ];
    $scope.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        $scope.form.startTime = tools.toJSYMD(new Date().getTime() - 60*60*24*1000*30);
        $scope.form.endTime = tools.toJSYMD(new Date().getTime());
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
    function fnDrawCallback(){
        var table = $("#dataTables");
        table.off("click").on("click", ".changeStatus", function () {
            var self = $(this), flag = parseInt(self.attr("data-flag"));
            if(flag === 0){
                var statusList = $scope.select.SignedContractStatusEnum, len = statusList.length, html = '<div class="btn-group-vertical statusPop" role="group" aria-label="...">', contractNo = $(this).attr("data-contractNo");
                for(var i = 0; i < len; i++){
                    var item = statusList[i];
                    html += '<button type="button" class="btn btn-default" data-contractNo="' + contractNo + '" data-status="' + item.key + '">' + item.value + '</button>';
                }
                html += '</div><div style="text-align:right;border-top:1px solid #ccc;padding-top:10px;margin-top:10px;"><button class="btn btn-sm btn-danger changeStatusConfirm">确定更改</button> <button class="btn btn-sm changeStatusCancel">取消更改</button>';
                self.popover({
                    html: true,
                    title : '状态更改',
                    content : html

                }).popover('show');
                self.attr("data-flag", 1);
            }
            return false;
        });
        $(".changeStatus").on('shown.bs.popover', function(){
            var siblingPop = $(this).next(".popover");
            $(".popover").each(function(){
                if($(this).attr("id") !== siblingPop.attr("id")){
                    $(this).popover('hide');
                }
            });
        });
        table.on("click", ".statusPop button", function(){
            var btns = $(this).parent().find("button");
            btns.removeAttr("current").removeClass("btn-primary");
            $(this).attr("current", true).addClass("btn-primary");
        });
        table.on("click",".changeStatusConfirm",function(){
            var self = $(this),
                parentTr = self.parents("tr"),
                parentTd = self.parents("td"),
                popup = parentTd.find(".changeStatus"),
                currentBtn = self.parents(".popover-content").find('[current=true]');
            if(currentBtn.length < 1){
                alert('请选择一个状态或取消更改');
                return ;
            };
            var contractNo = currentBtn.attr("data-contractNo"),
                status = parseInt(currentBtn.attr("data-status")),
                txt = currentBtn.html(),
                data = {
                    contractNo : contractNo,
                    status : status
                };
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: G.server + "/studio/modifySignedStatus.json",
                data: data,
                dataType: "json",
                success: function(res){
                    tools.ajaxOpened(self);
                    if(!res.success){
                        alert(res.msg);
                    }
                    popup.popover("hide");
                    parentTr.find(".status").html(txt)
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
            return false;
        });
        table.on("click", ".changeStatusCancel",function(){
            var self = $(this),
                parentTd = self.parents("td"),
                popup = parentTd.find(".changeStatus");
            popup.popover("hide");
        });


        /**
         * 意向签单详情
         * **/
        table.on("click", ".detailInfo", function () {
            var contractNo = $(this).attr("data-contractNo");

            $http({
                method: "POST",
                url: G.server + "/studio/getContractDetail.json",
                data:$.param({
                    contractNo:contractNo
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
            })

        });

        function detailCtrl($scope, $modalInstance, info, $q) {
            $scope.info = info;
            $scope.G = G;
            $scope.info.documentPathList = $scope.info.documentPath ? $scope.info.documentPath.split("|"): [];
            $scope.info.otherPathList = $scope.info.otherPath ? $scope.info.otherPath.split("|"): [];

            $scope.close = function() {
                $modalInstance.close();
            };

        }

    }


}
