'use strict';
function xinghuoConsumerController($scope,getSelectListFactory,tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false,
        bizSysRoute: 1
    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['documenttype','regfrom']);
    selectList.then(function(data){
        $scope.select.documenttype = data.appResData.retList[0].documenttype;
        $scope.select.regfrom = data.appResData.retList[1].regfrom;
    });
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuouser/datatable.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d,{
                    "orderColumn" : d.columns[d.order[0]["column"]]["data"],
                    "orderType" : d.order[0]["dir"]
                },$scope.form);
            }
        })
        .withDataProp('data')
        .withOption('searching',false)
        .withOption('ordering',true)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers')
        .withOption('order', [6, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_see_info" key="'+data+'" key_sys="'+full.bizSysRoute+'">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('realname').withTitle('姓名').withOption('sWidth','100px').notSortable(),
        DTColumnBuilder.newColumn('documentno').withTitle('证件号码').withOption('sWidth','140px').notSortable(),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','100px').notSortable(),
        DTColumnBuilder.newColumn('bizSysRouteStr').withTitle('注册平台').withOption('sWidth','80px').notSortable(),
        DTColumnBuilder.newColumn('regfromstr').withTitle('注册来源').withOption('sWidth','60px').notSortable(),
        DTColumnBuilder.newColumn('createtime').withTitle('注册时间').withOption('sWidth','140px').renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('fundAccountStatus').withTitle('基金账户').withOption('sWidth','130px').renderWith(function(data,type,full){
            if(!data || data === "0"){
                return "";
            } else if(data === "1") {
                return "<div class='js_switch_bankCard' data-id='"+full.id+"' style='cursor: pointer;'>已开户<input type='checkbox' style='vertical-align: top;'/></div>"
            } else {
                return "<div>已开户（可修改）<input type='checkbox' checked style='vertical-align: top;' disabled/></div>";
            }
        }).notSortable(),
        DTColumnBuilder.newColumn('id').withTitle('查看交易').withOption('sWidth','60px').renderWith(function(data,type,full){
            return '<a href="#/caiyideal-trade.html?lenderid='+data+'" target="_blank">查看交易</a>';
        }).notSortable()
    ];
    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow' && prop !== 'bizSysRoute') delete $scope.form[prop];
            }
            vm.dtInstance.rerender();
        },
        search: function(){
            vm.dtInstance.rerender();
        }
    }
    function fnDrawCallback(){
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        tools.createModal();
        tools.createModalProgress();
        /**
         * [查看用户信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables tbody").on("click", ".js_see_info", function(){
            var bizSysRoute = $(this).attr("key_sys") == "null" ? 0 : $(this).attr("key_sys");
            var url = "/xinghuouser/userinfo.shtml";
            var data = {
                "id": $(this).attr("key"),
                "userType": "consumer",
                "bizSysRoute": bizSysRoute
            };
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
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
        /**
         * [普通用户导出数据]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#js_consumer_export").on("click", function(){
            tools.export(this);
        });
    }
    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();
}