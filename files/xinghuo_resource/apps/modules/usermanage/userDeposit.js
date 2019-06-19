'use strict';
function userDepositController($scope,getSelectListFactory,$timeout, $modal, tools,DTOptionsBuilder, DTColumnBuilder,$q){
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    var dateYear=new Date().getFullYear();
    var dateMonth=new Date().getMonth()+1;
    var dateDate=new Date().getDate();
    $scope.form.createtimeEnd=tools.toJSDate(Date.parse(dateYear+'-'+dateMonth+'-'+dateDate+' '+'23:59:59'));
    $scope.form.createtimeStart=tools.toJSDate((Date.parse(dateYear+'-'+dateMonth+'-'+dateDate))-14*3600*24*1000-8*3600*1*1000);
    //$scope.form.completeTimeEnd=tools.toJSYMD(Date.parse(dateYear+'-'+dateMonth+'-'+dateDate));
    //$scope.form.completeTimeStart=tools.toJSYMD((Date.parse(dateYear+'-'+dateMonth+'-'+dateDate))-14*3600*24*1000);

    /*
    * 获取枚举类型2
    * */
    //存管类型：AccountType,操作类型：AccountSubtype,状态：AccountState,代付类型:AccountPaytype
    var defer = $q.defer();
    $.ajax({
        url: siteVar.serverUrl+'/xinghuopageapi/getEnumValues.json',
        method: 'POST',
        data: {
            keyNames:"AccountSubtype,AccountType,AccountPaytype",
            packageName:"com.creditease.xinghuo.service.user.api.enums"
        }
    }).then(function(data){
        defer.resolve(data);
        $scope.select.channel = data.data.AccountType;
        $scope.select.subtype = data.data.AccountSubtype;
        //$scope.select.state = data.data.AccountState;
        $scope.select.AccountPaytype = data.data.AccountPaytype;
        var initTypes=[];
        for(var k=0;k<$scope.select.subtype.length;k++){
            initTypes[k]={"text": $scope.select.subtype[k].value, "value": $scope.select.subtype[k].key, "default": false}
        }
        $('#multi_select').multiSel({
            'data':initTypes
        });
    },function(error){
        defer.reject(error);
    });
    //获取accountState，区别其他获取package
    $.ajax({
        url: siteVar.serverUrl+'/xinghuopageapi/getEnumValues.json',
        method: 'POST',
        data: {
            keyNames:"AccountState",
            packageName:"com.creditease.xinghuo.parameter.enums"
        }
    }).then(function(data){
        defer.resolve(data);
        $scope.select.state = data.data.AccountState;
    },function(error){
        defer.reject(error);
    });

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/account/queryAccountDetailList.shtml',
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
        DTColumnBuilder.newColumn('bizno').withTitle('操作编号').withOption('sWidth','260px').notSortable().renderWith(function (data,type,full) {
            return '<a href="javascript:;" class="bizNoPop"  keyId="'+data+'">'+data+'</a>';
            //return data;
        }),
        DTColumnBuilder.newColumn('username').withTitle('用户姓名').withOption('sWidth','60px').notSortable().renderWith(function (data,type,full) {
            return '<a href="javascript:;" class="js_see_info" kye_sys="null" key="'+data+'" keyId="'+full.userid+'">'+data+'</a>';
        }),
        DTColumnBuilder.newColumn('channelDesc').withTitle('存管类型').withOption('sWidth','150px').notSortable(),
        DTColumnBuilder.newColumn('amount').withTitle('操作金额').withOption('sWidth','90px').renderWith(function (data,type,full) {
            return tools.formatNumber(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('subtypeDesc').withTitle('操作类型').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('createtime').withTitle('操作时间').withOption('sWidth','130px').notSortable().renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('completeTime').withTitle('完成时间').withOption('sWidth','130px').notSortable().renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('stateDesc').withTitle('状态').withOption('sWidth','100px').notSortable(),
        DTColumnBuilder.newColumn('remark').withTitle('备注').withOption('sWidth','240px').notSortable(),
        DTColumnBuilder.newColumn('accBalance').withTitle('历史可用余额').withOption('sWidth','90px').renderWith(function (data,type,full) {
            return tools.formatNumber(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('frozenBalance').withTitle('历史冻结金额').withOption('sWidth','90px').renderWith(function (data,type,full) {
            return tools.formatNumber(data);
        }).notSortable(),
        DTColumnBuilder.newColumn('txid').withTitle('结算中心编号').withOption('sWidth','210px').notSortable(),
        DTColumnBuilder.newColumn('payType').withTitle('代付类型').withOption('sWidth','80px').renderWith(function (data,type,full) {
            //return data?(Number(data)==2?'是':'否'):'--';
            if($scope.select.AccountPaytype){
                for(var i=0;i<$scope.select.AccountPaytype.length;i++){
                    if($scope.select.AccountPaytype[i].key==data){
                        return $scope.select.AccountPaytype[i].value;
                    }
                }
            }else{
                return '--';
            }
        }).notSortable()
    ];


    $scope.action = {
        reset: function(){
            for(var prop in $scope.form){
                if(prop !== 'isShow') delete $scope.form[prop];
            }
            $("#js_form").find("input[name='p_status']").val('');
            $("#multi_select").find("[readonly]").val("");
            $("#multi_select").find(".multiSel_unit").prop("checked",false);
            $.uniform.update($("#multi_select").find(".multiSel_unit"));
            vm.dtInstance.rerender();
        },
        search: function(){
            if(Number($scope.form.amountMin)>Number($scope.form.amountMax)){tools.interalert('输入金额范围有误');return;}
            //if(Date.parse($scope.form.endTime)<Date.parse($scope.form.startTime)){tools.interalert('输入时间范围有误');return;}
            $scope.form.subtypes = $("#js_form").find("input[name='p_status']").val();
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
            //console.log(window.ajaxDataInfo.info);
            if(window.ajaxDataInfo.info){
                $scope.inAmount=tools.formatNumber(window.ajaxDataInfo.info.inAmount||0);
                $scope.outAmount=tools.formatNumber(window.ajaxDataInfo.info.outAmount||0);
            }else{
                $scope.inAmount='---';
                $scope.outAmount='---';
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
         * [查看操作编号]
         * @param  {object}   [description]
         * @return {[type]}   [description]
         */
        $("#dataTables tbody").on("click", ".bizNoPop", function(){
            //var bizSysRoute = $(this).attr("key_sys") == "null" ? 0 : $(this).attr("key_sys");
            var url = "/account/queryAccountUserDetail.shtml";
            var data = {
                "bizNo": $(this).attr("keyId")
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