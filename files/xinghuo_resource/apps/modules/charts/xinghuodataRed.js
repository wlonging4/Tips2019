'use strict';
function xinghuodataRedController($scope, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false,
        p_activitytype: 1
    };
    $scope.select = {};
    $scope.action = {};
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodata/queryRedActivity.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d,{
                    "orderColumn" : d.columns[d.order[0]["column"]]["data"],
                    "orderType" : d.order[0]["dir"]
                },$scope.form);
            }
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching',false)
        .withOption('ordering',true)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers')
        .withOption('order', [0, 'asc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('storeuserid').withTitle('理财经理ID').withOption('sWidth', '100px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="js_data_director" key_id="'+data+'">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('realname').withTitle('理财经理姓名').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('mobile').withTitle('理财经理手机号').withOption('sWidth','100px').notSortable(),
        DTColumnBuilder.newColumn('activityname').withTitle('活动类型').withOption('sWidth','70px').notSortable(),
        DTColumnBuilder.newColumn('fmamount').withTitle('新注册用户交易金额(元)').withOption('sWidth', '160px').renderWith(function(data, type, full) {
            if(!data) return 0;
            return data;
        }).notSortable(),
        DTColumnBuilder.newColumn('validdealnum').withTitle('新注册交易用户数').withOption('sWidth', '120px'),
        DTColumnBuilder.newColumn('dealrenumber').withTitle('交易红包数量').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('registerre').withTitle('注册红包(元)').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('allred').withTitle('红包总额(元)').withOption('sWidth','90px').renderWith(function(data, type, full) {
            return full.fmallred;
        }),
        DTColumnBuilder.newColumn('updatetime').withTitle('活动时间').withOption('sWidth','150px').notSortable(),
        DTColumnBuilder.newColumn('status').withTitle('活动状态').withOption('sWidth','70px').notSortable()
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        /*
         刷新统计数据
         */
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info;
        });
        tools.createModal();
        tools.createModalProgress();
        $("#dataTables tbody").on("click", ".js_data_director", function(){
            var data = {
                "id": $(this).attr("key_id"),
                "userType": "director"
            }
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/userinfo.shtml",
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    $("#js_dialog .js_content").html(data);
                    $("#js_dialog").modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        })
    }
    (function(){
        /**
         * [导出红包活动]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_data_red_export_btn").on("click", function(){
            tools.export(this);
        });
    })();
}
