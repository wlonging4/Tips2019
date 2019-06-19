'use strict';
function bxdDuizhang($scope, $http, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};

    $scope.form.ifRight = 0;
    $scope.form.confirm = 1;
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/bxdduizhang/bxdDuizhangTable.shtml',
            type: 'POST',
            data: function(d){

                $.extend(d, $scope.form);
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
        DTColumnBuilder.newColumn('no').withTitle('上级交易单号').withOption('sWidth', '160px'),
        DTColumnBuilder.newColumn('oneCashAmount').withTitle('上级已变现到期本息').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('twoOrignalAmount').withTitle('下级原始到期本息之和').withOption('sWidth','150px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="#bxdduizhang-bxdSingleDuizhang.html?no=' + full.no + '" target="_blank">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('unconfirmAmount').withOption('sWidth','200px').withTitle('未确认下级原始到期本息之和'),
        DTColumnBuilder.newColumn('ifRight').withTitle('是否有误').withOption('sWidth','60px').renderWith(function(data, type, full) {
            return data == 0 ? "<span style='color:red;'>是</span>" : "否";
        }),
        DTColumnBuilder.newColumn('confirm').withTitle("<div class='text-center'><label><input type='checkbox' class='duizhang_all'>全选</label></div>").withOption('sWidth', '80px').renderWith(function(data, type, full) {
            if(full.ifRight == 0){
                return data == 0 ? "<div class='text-center'>已确认</div>" : "<div class='text-center'><label><input type='checkbox' class='duizhang_item_confirm' data-no=" + full.no + ">未确认</label></div>";
            }else{
                return "";
            };
        })
    ];
    $scope.action.reset = function() {
        for (var prop in $scope.form) {
            if (prop !== 'isShow') delete $scope.form[prop];
            $scope.form.ifRight = 0;
            $scope.form.confirm = 1;
        };
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };

    $scope.isError = function(){
        if($scope.form.ifRight == 1){
            delete $scope.form["confirm"];
        }else{
            $scope.form.confirm = 1;
        };
    };
    ;(function(){
        $("#js_trade_bxdduizhang_export").on("click", function(){
            if($scope.form.ifRight != 0){
                return alert("不可导出无误的订单！");
            };
            tools.export(this);
        });
    })();
    function fnDrawCallback(){

        var table = $("#dataTables"), tbody = table.find("tbody");
        $(".duizhang_all, .duizhang_item_confirm").uniform();
        table.off("click");

        var result = [];
        $(".duizhang_all").on("change", function(){
            var self = $(this), value = self.prop("checked"), itemCheckBox = tbody.find(".duizhang_item_confirm");
            if(value){
                itemCheckBox.each(function(index, item){
                    var no = $(this).attr("data-no");
                    $(this).prop("checked", true).uniform();
                    if(!isexisted(no, result)){
                        result.push(no);
                    }
                });
            }else{
                itemCheckBox.prop("checked", false).uniform();
                result = [];
            };
        });
        function isexisted(item, arr){
            return arr.indexOf(item) > -1;
        };
        function deleteexisted(item, arr){
            if(arr.indexOf(item) > -1){
                var index = arr.indexOf(item);
                arr.splice(index, 1);
            }
        }
        $(".duizhang_item_confirm").on("change", function(){
            var self = $(this), value = self.prop("checked"), no = $(this).attr("data-no");
            if(value){
                if(!isexisted(no, result)){
                    result.push(no);
                };
            }else{
                deleteexisted(no,result);
            };
        });
        $("#js_confirm_deal").on("click", function(){
            var self = $(this), url = self.attr("action"), data;
            if(!result.length){
                return;
            };
            data = result.toString();
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: {
                    dealNos:data
                },
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert(data.msg);
                        result = [];
                        vm.dtInstance.rerender();
                    };

                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });
    }

}
