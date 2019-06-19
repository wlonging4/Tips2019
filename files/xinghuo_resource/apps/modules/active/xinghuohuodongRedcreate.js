'use strict';
function xinghuohuodongRedcreateController($scope,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false,
    };
    $scope.select = {};
    $scope.action = {};
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuohuodong/tableRedcreate.shtml',
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
        DTColumnBuilder.newColumn('prizename').withTitle('红包名称').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_redCreate_info ui_ellipsis" key_id="'+full.prizeid+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('prizeamount').withTitle('金额').withOption('sWidth','30px'),
        DTColumnBuilder.newColumn('starttime').withTitle('有效期').withOption('sWidth','200px').renderWith(function(data,type,full){
            return tools.toJSDate(data).split(" ")[0]+"&nbsp;至&nbsp;"+tools.toJSDate(full.endtime).split(" ")[0];
        }),
        DTColumnBuilder.newColumn('introducer').withTitle('说明').withOption('sWidth','180px').renderWith(function(data,type,full){
            if(!data) return "";
            return '<span class="ui_ellipsis" style="width: 180px;" title="'+data+'">'+data+'</span>';
        }),
        DTColumnBuilder.newColumn('createtime').withTitle('创建日期').withOption('sWidth','120px').renderWith(function(data,type,full){
            return tools.toJSDate(data).split(" ")[0];
        }),
        DTColumnBuilder.newColumn('statusstr').withTitle('状态').withOption('sWidth','60px'),
        DTColumnBuilder.newColumn('prizeid').withTitle('操作').withOption('sWidth','80px').renderWith(function(data,type,full){
            return '<div class="col-lg-12 col-xs-12 ui_center"><a href="#/xinghuohuodong-redadd.html?prizeid='+data+'" class="btn btn-success btn-xs">编辑</a></div>';
        })
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
        }
    };
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.createModal();
        /**
         * [查看红包详情]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#dataTables tbody").on("click", ".js_redCreate_info", function(){

            var data ={
                "prizeid": $(this).attr("key_id")
            }

            var self = this;
            if(!tools.ajaxLocked(self)) return;

            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuohuodong/redcreateInfo.shtml",
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
            });

        });
    }
    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();
}