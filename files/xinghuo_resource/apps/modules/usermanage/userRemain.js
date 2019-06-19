'use strict';
function userRemainController($scope,getSelectListFactory,$timeout, $modal, tools,DTOptionsBuilder, DTColumnBuilder,$q){
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    var dateYear=new Date().getFullYear();
    var dateMonth=new Date().getMonth()+1;
    var dateDate=new Date().getDate();
    $scope.form.updatetimeEnd=tools.toJSYMD(Date.parse(dateYear+'-'+dateMonth+'-'+dateDate));
    $scope.form.updatetimeStart=tools.toJSYMD((Date.parse(dateYear+'-'+dateMonth+'-'+dateDate))-14*3600*24*1000);

    /*
    * 获取枚举类型2
    * */
    //存管类型：AccountType,操作类型：AccountSubtype,状态：AccountState
    var defer = $q.defer();
    $.ajax({
        url: siteVar.serverUrl+'/xinghuopageapi/getEnumValues.json',
        method: 'POST',
        data: {
            keyNames:"AccountType",
            packageName:"com.creditease.xinghuo.service.user.api.enums"
        }
    }).then(function(data){
        defer.resolve(data);
        $scope.select.channel = data.data.AccountType;
    },function(error){
        defer.reject(error);
    });


    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/account/queryUsersBalanceList.shtml',
            type: 'POST',
            data: $scope.form
        })
        .withDataProp('data')
        .withOption('searching',false)
        //设置是否排序
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("test"+data.id)
        })
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('full_numbers');
    //.withOption('order', [2, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('userid').withTitle('出借人ID').withOption('sWidth','90px').notSortable().renderWith(function (data,type,full) {
            return data;
        }),
        DTColumnBuilder.newColumn('username').withTitle('出借人姓名').withOption('sWidth','80px').notSortable().renderWith(function (data,type,full) {
            return '<a href="javascript:;" class="js_see_info" kye_sys="null" key="'+data+'" keyId="'+full.userid+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('channel').withTitle('存管类型').withOption('sWidth','150px').notSortable().renderWith(function (data,type,full) {
            for(var k=0;k<$scope.select.channel.length;k++){
                if(data==$scope.select.channel[k].key){
                    return $scope.select.channel[k].value;
                }
            }
        }),
        DTColumnBuilder.newColumn('totalBalance').withTitle('存管余额').withOption('sWidth','90px').renderWith(function (data,type,full) {
            return tools.formatNumber(data);

        }).notSortable(),
        DTColumnBuilder.newColumn('accBalance').withTitle('存管可用余额').withOption('sWidth','90px').renderWith(function (data,type,full) {
            return tools.formatNumber(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('frozenBalance').withTitle('存管冻结余额').withOption('sWidth','90px').renderWith(function (data,type,full) {
            return tools.formatNumber(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('updatetime').withTitle('更新时间').withOption('sWidth','130px').notSortable().renderWith(function(data,type,full){
            return tools.toJSDate(data);
        })
    ];


    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            /*$("#js_form").find("input[name='p_status']").val('');
            $("#multi_select").find("[readonly]").val("");
            $("#multi_select").find(".multiSel_unit").prop("checked",false);
            $.uniform.update($("#multi_select").find(".multiSel_unit"));*/
            vm.dtInstance.rerender();
        },
        search: function(){
            if(Number($scope.form.amountMin)>Number($scope.form.amountMax)){tools.interalert('输入金额范围有误');return;}
            //if(Date.parse($scope.form.endTime)<Date.parse($scope.form.startTime)){tools.interalert('输入时间范围有误');return;}
            //$scope.form.subtypes = $("#js_form").find("input[name='p_status']").val();
            vm.dtInstance.rerender();
        },
        export:function () {
            $modal.open({
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'exportModal.html',
                controller : exportCtrl,
                windowClass:'modal-640'
            });
        }
    };


    function fnDrawCallback(){
        tools.createModal();
        tools.createModalProgress();
        if(!tools.interceptor(window.ajaxDataInfo)) return;
        //获取表头数据
        $scope.$apply(function(){
            $scope.tableinfo = window.ajaxDataInfo.info;
            if(window.ajaxDataInfo.info.accountUsersBalance){
                $scope.inAmount=tools.formatNumber(window.ajaxDataInfo.info.accountUsersBalance.totalBalance||0);
                $scope.outAmount=tools.formatNumber(window.ajaxDataInfo.info.accountUsersBalance.accBalance||0);
            }else{
                $scope.inAmount='0';
                $scope.outAmount='0';
            }
        });

        /**
         * [查看用户信息]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables tbody").on("click", ".js_see_info", function(){
            //var bizSysRoute = $(this).attr("key_sys") == "null" ? 0 : $(this).attr("key_sys");
            var url = "/xinghuouser/userinfo.shtml";
            var data = {
                "id": $(this).attr("keyId"),
                "userType": "consumer",
                "bizSysRoute": 0
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
                    console.log($('#js_dialog'))
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
         * [导出数据]
         * @param  {[type]}     [description]
         * @return {[type]}     [description]
         */
        $("#js_consumer_export").on("click", function(){
            $scope.form.subtypes = $("#js_form").find("input[name='p_status']").val();
            $scope.$apply();
            tools.export(this);
        });
    }
    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();

}