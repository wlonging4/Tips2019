'use strict';
function pointsRecord($scope, $modal, tools, DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };

    $scope.select = {};
    $scope.action = {};




    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url:  siteVar.serverUrl + '/integral/queryUserIntegral.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d, tools.getFormele({}, form));
            }

        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',false)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('userId').withTitle('理财师ID').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + data + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('phone').withTitle('理财经理手机号').withOption('sWidth','120px'),
        DTColumnBuilder.newColumn('integral').withTitle('积分数量').withOption('sWidth', '120px'),
        DTColumnBuilder.newColumn('endTime').withTitle('有效期').withOption('sWidth', '140px'),
        DTColumnBuilder.newColumn('lastDay').withTitle('获取时间').withOption('sWidth', '140px'),
        DTColumnBuilder.newColumn('source').withTitle('来源').withOption('sWidth','100px')
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    var ModalCtrl = function($scope, $modalInstance) {
        tools.createModalUser();
        $scope.form = {};
        $scope.ok = function() {
            var self = $("#confirmBtn");
            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            var data = new FormData($("#importPointsForm")[0]);
            $.ajax({
                url : siteVar.serverUrl + "/integral/importIntegral.shtml",
                type:"POST",
                data : data,
                processData: false,
                contentType: false,
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    };
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        var errorMsg = "", str;
                        if(data.data && data.data.wrongsize > 0){
                            errorMsg += '--->错误信息如下:' + '<br>' + data.data.wrongmsg;
                        };
                        str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                            '<span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">导入积分</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;">' + data.msg + '<br>' + 'excel导入总笔数: '+
                            data.data.allsize+'<br>' + '导入成功笔数: ' + data.data.rightsize+'<br>' + '失败笔数:'+data.data.wrongsize + errorMsg + '</div></div>';

                        $("#js_dialog_passport .js_content").html(str);
                        $("#js_dialog_passport").modal({backdrop: 'static', keyboard: false});

                        vm.dtInstance.rerender();
                    }

                }

            });
        };
        $scope.close = function() {
            $modalInstance.close();
        };
    };
    $scope.action.import = function(){
        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'myModalContent.html',
            controller : ModalCtrl,
            windowClass:'modal-640'
        });
    }

    function fnDrawCallback(data){
        $scope.$apply(function(){
            $scope.info = data.json.info;
        });
        tools.createModal();
        //tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url:siteVar.serverUrl +  url,
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    popUpLayerContent.html(data);
                    popUpLayer.modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });

        $("#js_download").on("click", function(){
            tools.export(this);
        });
        $("#js_export").on("click", function(){
            tools.export(this);
        });


    }
}
