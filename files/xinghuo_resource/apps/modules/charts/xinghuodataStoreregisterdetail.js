'use strict';
function xinghuodataStoreregdetailController($scope,$location, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false,
    };
    $scope.select = {};
    var urlStr = $location.url().split("?")[1];
    if(urlStr) {
        $.extend($scope.form,tools.serializeUrl(urlStr));
    }
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['validatestatus']);
    selectList.then(function(data){
        $scope.select.p_isrealnamevalidate = data.appResData.retList[0].validatestatus;
    });
    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuodata/queryStoreRegisterDetail.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d,$scope.form);
                try{
                    var order_index = vm.dtInstance.DataTable.context[0].aaSorting[0][0];
                    d.orderColumn = vm.dtInstance.DataTable.context[0].aoColumns[order_index]['mData'];
                    d.orderType = vm.dtInstance.DataTable.context[0].aaSorting[0][1];
                }catch(e){
                    //console.log(e)
                }
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
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('userid').withTitle('注册用户ID').withOption('sWidth', '100px').notSortable(),
        DTColumnBuilder.newColumn('realname').withTitle('注册用户姓名').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('mobile').withTitle('注册用户手机号').withOption('sWidth','100px').notSortable(),
        DTColumnBuilder.newColumn('registertime').withTitle('注册时间').withOption('sWidth','140px').notSortable(),
        DTColumnBuilder.newColumn('isrealnamevalidate').withTitle('是否实名认证').withOption('sWidth', '110px'),
        DTColumnBuilder.newColumn('docvaltime').withTitle('实名认证时间').withOption('sWidth', '140px').notSortable(),
        DTColumnBuilder.newColumn('isHadStore').withTitle('是否开店').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('documentNo').withTitle('身份证号').withOption('sWidth','130px').notSortable(),
        DTColumnBuilder.newColumn('msstatus').withTitle('结算状态').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('mstime').withTitle('结算时间').withOption('sWidth','140px').notSortable()
    ];
    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        },
        search: function(){
            vm.dtInstance.rerender();
        },
        load: function(){
            ComponentsPickers.init();
        }
    };
    function fnDrawCallback() {
        if (!tools.interceptor(window.ajaxDataInfo)) return;
    }
    (function(){
        /**
         * [导出店铺红包明细]
         * @param  {[type]}   [description]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $("#js_data_storered_export_btn").on("click", function(){
            tools.export(this);
        });
    })();
}
