'use strict';
function otherQuota($scope, tools, $modal, $compile, DTOptionsBuilder, DTColumnBuilder, getSelectListFactory) {
    $scope.form = {
        accessMode:"kuaijie"
    };
    $scope.select = {};
    $scope.action = {};
    $scope.accessMode = {};
    function addAttr(scope, el, attrName, attrValue) {
        el.replaceWith($compile(el.clone().attr(attrName, attrValue))(scope));
    }
    getSelectListFactory.getSelectList(['accessmode']).then(function (data) {
        $scope.select.accessmode = data.appResData.retList[0].accessmode;
        for(var i = 0; i < $scope.select.accessmode.length; i++){
            var item = $scope.select.accessmode[i], k = item["value"], v = item["value2"];
            if(!$scope.accessMode[k]){
                $scope.accessMode[k] = v;
            }
        }
        addAttr($scope, angular.element("#dataTables"), "datatable", true);
    });

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/payBankManager/queryPayBankInfo.json',
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
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('name').withTitle('银行').withOption('sWidth', '25%'),
        DTColumnBuilder.newColumn('upperLimit').withTitle('首次限额').withOption('sWidth','25%').renderWith(function(data, type, full) {
            if(!data) return "";
            var v = Number(data);
            if(v > -1){
                return Number(('' + tools.div(v, 10000)).replace(/^(\d+\.\d{1})\d*/, '$1')) + "万";
            }else{
                return "无限额";
            }
        }),
        DTColumnBuilder.newColumn('upperLimitSecond').withTitle('二次限额').withOption('sWidth','25%').renderWith(function(data, type, full) {
            if(!data) return "";
            var v = Number(data);
            if(v > -1){
                return Number(('' + tools.div(v, 10000)).replace(/^(\d+\.\d{1})\d*/, '$1')) + "万";
            }else{
                return "无限额";
            }
        }),
        DTColumnBuilder.newColumn('singleDayLimit').withTitle('单日限额').withOption('sWidth','25%').renderWith(function(data, type, full) {
            if(!data) return "";
            var v = Number(data);
            if(v > -1){
                return Number(('' + tools.div(v, 10000)).replace(/^(\d+\.\d{1})\d*/, '$1')) + "万";
            }else{
                return "无限额";
            }
        }),
        DTColumnBuilder.newColumn('name').withTitle('操作').withOption('sWidth','25%').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0)" data-info="' + encodeURIComponent(JSON.stringify(full)) + '" class="editQuota">修改限额</a>';
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            delete $scope.form[prop];
        }
        $scope.form.accessMode = "kuaijie";
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };


    function editCtrl($scope, $modalInstance, form, accessMode, $timeout) {
        $scope.form = form;
        $scope.accessMode = accessMode;
        if($scope.form.upperLimit === -1){
            $scope.isUpperLimit = true;
        }
        if($scope.form.upperLimitSecond === -1){
            $scope.isUpperLimitSecond = true;
        }
        if($scope.form.singleDayLimit === -1){
            $scope.isSingleDayLimit = true;
        }
        $scope.div = tools.div;
        $scope.compute = function (v) {
            return Number(('' + $scope.div(v, 10000)).replace(/^(\d+\.\d{1})\d*/, '$1'));
        };

        $scope.limit = function (name) {
            var el = angular.element("#" + name + "Checkbox");
            if($(el).prop("checked")){
                this.form[name] = -1;
            }else{
                this.form[name] = "";
            }
        };
        $scope.ok = function () {
            var self = $("#saveBtn");
            if(!$scope.form.upperLimit){
                return alert("请输入首次限额")
            }
            if(!$scope.form.upperLimitSecond){
                return alert("请输入二次限额")
            }
            if(!$scope.form.singleDayLimit){
                return alert("请输入单次限额")
            }
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/payBankManager/updatePayBankInfo.json",
                // data: $scope.form,
                data: {
                    id:$scope.form.id,
                    name:$scope.form.name,
                    upperLimit:$scope.form.upperLimit,
                    upperLimitSecond:$scope.form.upperLimitSecond,
                    singleDayLimit:$scope.form.singleDayLimit,
                    accessMode:$scope.form.accessMode
                },
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert("修改成功！");
                        $modalInstance.close();
                        vm.dtInstance.rerender();
                    }

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        };
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.check = function (v, name) {
            v = v.replace(/[^\d\.]/g, '')
                .replace(/^\./g, '').replace(/\.{2,}/g, '.')
                .replace('.', '$#$').replace(/\./g, '')
                .replace('$#$', '.').replace(/(\.\d{1}).*/g, '$1')
                .replace(/^0+([1-9]+)/g,'$1')
                .replace(/^0{2,}\./g, '0.');
           $scope.form[name] = v;
        };
        $timeout(function () {
            var form = $("#editFrom");
            form.find("input[type='checkbox']").uniform();
        }, 0);
    }

    function fnDrawCallback() {
        var table = $("#dataTables");
        table.off("click").on("click", ".editQuota", function(){
            var self = $(this), info = self.attr("data-info");
            info = JSON.parse(decodeURIComponent(info));
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'editModal.html',
                controller : editCtrl,
                windowClass:'modal-640',
                resolve:{
                    "form":function(){
                        return info;
                    },
                    "accessMode":function () {
                        return $scope.accessMode
                    }
                }
            });
        });
        $(document).on("click", "#export", function(){
            tools.export(this);
        });
    }
}
