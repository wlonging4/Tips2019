'use strict';
function datacodeanalysi($scope, $location, $modal, $http, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.info = {};
    $scope.select = {};
    $scope.action = {};
    var id = $location.$$search.id;
    getSelectListFactory.getSelectList(['invited_code_status']).then(function(data){
        $scope.select.invited_code_status = data.appResData.retList[0].invited_code_status;
    });
    if(id){
        $scope.form.invitedCodeId = id;
        $http({
            method: "POST",
            url: siteVar.serverUrl + "/xinghuopageapi/datacodeanalysi.json",
            data: $.param({data:JSON.stringify({appReqData : {id: id}})}),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'X-Requested-With' :'XMLHttpRequest'
            }
        }).success(function(data, status) {
            $scope.info = data.appResData;
        }).error(function(data, status) {
            alert("获取信息失败，请与管理员联系。");
            return;
        });
    };

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuoinvitecode/datacodeanalysiTable.shtml',
            type: 'POST',
            data: $scope.form
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
        DTColumnBuilder.newColumn('code').withTitle('邀请码ID').withOption('sWidth', '120px'),
        DTColumnBuilder.newColumn('endDate').withTitle('有效期至').withOption('sWidth','100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSYMD(data);
        }),
        DTColumnBuilder.newColumn('useDate').withTitle('使用时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('terminal').withTitle('使用设备').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('realName').withTitle('用户姓名').withOption('sWidth', '100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0)" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + full.userId + '" class="infoDetail">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('mobile').withTitle('注册手机号').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('statusStr').withTitle('使用状态').withOption('sWidth', '100px')
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if((prop !== 'isShow') && (prop !== 'invitedCodeId')) delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    ;(function(){
        tools.createModal();
        tools.createModalProgress();
        $("#js_red_export").on("click", function(){
            tools.export(this);
        });
    })();

    var ModalCtrl = function($scope, $modalInstance) {
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");
        $scope.modalTitle = "导入邀请码";
        $scope.showFlag = true;
        $scope.ok = function() {
            var self = $("#confirmBtn"), formDom = $("#js_datacodeanalysi_form"), inputfile = formDom.find("input[name='inputfile']");
            var data = new FormData(formDom[0])
            if(!inputfile.val()){
                return alert("请上传文件")
            };

            if(!tools.ajaxLocked(self)) return;

            //

            $.ajax({
                url : siteVar.serverUrl + "/xinghuoinvitecode/importinvitecode.shtml",
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
                        if(data.data && data.data.wrongmsg){
                            $scope.$apply(function(){
                                $scope.showFlag = false;
                                $scope.msg = data.data.wrongmsg;
                            });
                        }else{
                            $modalInstance.close();
                        }
                        return vm.dtInstance.rerender();
                    };
                    $modalInstance.close();
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }

            });
        };
        $scope.cancel = function() {
            $modalInstance.close();
        };
    };
    $scope.action.import = function(e){


        $modal.open({
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : 'myModalContent.html',
            windowClass:'modal-640',
            controller : ModalCtrl
            //resolve:{
            //    "form": function(){
            //        return data;
            //    }
            //}
        });
    };
    function fnDrawCallback(){


        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $(".js_export").on("click", function(){
            tools.export(this);
        });

        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
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

    }
}
