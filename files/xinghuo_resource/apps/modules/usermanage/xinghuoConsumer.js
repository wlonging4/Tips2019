'use strict';
function xinghuoConsumerController($scope,getSelectListFactory,$timeout, $modal, tools,DTOptionsBuilder, DTColumnBuilder) {
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    $scope.cgbShow=0;
    /*
     获取枚举类型
     */
    var selectList = getSelectListFactory.getSelectList(['documenttype','yixinstatus','regfrom','biz_sys_route','cgbType','cgbChannel','cgbStatus']);
    selectList.then(function(data){
        $scope.select.documenttype = data.appResData.retList[0].documenttype;
        $scope.select.islocalreg = data.appResData.retList[1].yixinstatus;
        $scope.select.regfrom = data.appResData.retList[2].regfrom;
        //过滤业务系统来源
        var arr = [];
        var biz_sys_route = data.appResData.retList[3].biz_sys_route;
        for(var i in biz_sys_route){
            if(i != 3 && i != 4){
                arr.push(biz_sys_route[i]);
            }
        }
        $scope.select.bizSysRoute = arr;
        arr = [];
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
        .withOption('order', [5, 'desc']);
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth','100px').renderWith(function(data,type,full){
            return '<a href="javascript:;" class="js_see_info" key="'+data+'" key_sys="'+full.bizSysRoute+'">'+data+'</a>';
        }).notSortable(),
        DTColumnBuilder.newColumn('realname').withTitle('姓名').withOption('sWidth','70px').notSortable(),
        DTColumnBuilder.newColumn('documentno').withTitle('证件号码').withOption('sWidth','140px').notSortable(),
        DTColumnBuilder.newColumn('mobile').withTitle('手机号').withOption('sWidth','100px').notSortable(),
        DTColumnBuilder.newColumn('regfromstr').withTitle('注册来源').withOption('sWidth','70px').notSortable(),
        DTColumnBuilder.newColumn('createtime').withTitle('注册时间').withOption('sWidth','140px').renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('financialId').withTitle('理财师ID').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('financialName').withTitle('理财师姓名').withOption('sWidth','90px').notSortable(),
        DTColumnBuilder.newColumn('id').withTitle('查看交易').withOption('sWidth','60px').renderWith(function(data,type,full){
            if($("#biz_sys_route").val() == "1"){
                return '<a href="#/caiyideal-trade.html?lenderid='+data+'" target="_blank">查看交易</a>';
            }else if($("#biz_sys_route").val() == "4"){
                return '<a href="#/caierdeal-page.html?lenderid='+data+'" target="_blank">查看交易</a>';
            }else{
                return '<a href="#/xinghuodeal-trade.html?lenderid='+data+'" target="_blank">查看交易</a>';
            }
        }).notSortable(),
        DTColumnBuilder.newColumn('fundAccountStatus').withTitle('基金账户').withOption('sWidth','130px').renderWith(function(data,type,full){
            if(!data || data === "0"){
                return "";
            } else if(data === "1") {
                return "<div class='js_switch_bankCard' data-id='"+full.id+"' style='cursor: pointer;'>已开户<input type='checkbox' style='vertical-align: top;'/></div>"
            } else {
                return "<div>已开户（可修改）<input type='checkbox' checked style='vertical-align: top;' disabled/></div>";
            }
        }).notSortable()
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

    /*
        * 产品联动
        * */
    $(document).on('change',"#js_cgb1",function(){
        var nowCgbType=$(this).val();
        //console.log(nowCgbType);
        if(nowCgbType.toString()==''){
            $scope.cgbShow=0;
            $('#js_cgb2').val('');
            delete $scope.form.cgbType;
            delete $scope.form.cgbChannel;
        }else{
            $scope.cgbShow=1;
        }
        $scope.$apply();
    });

    function exportCtrl($scope, $modalInstance) {
        var now = (new Date()).getTime(), yesterday = now - 24*60*60*1000;
        $scope.startTime = tools.toJSYMD(yesterday);
        $scope.endTime = tools.toJSYMD(now);
        $timeout(function () {
            $('.date-picker').datepicker({
                rtl: Metronic.isRTL(),
                orientation: "left",
                autoclose: true,
                language:"zh-CN"
            });
        }, 0);
        $scope.ok = function () {
            if(!$scope.startTime){
                return alert("请选择开始时间！")
            }
            if(!$scope.endTime){
                return alert("请选择结束时间！")
            }
            var timeDiff  = tools.DateMinus($scope.startTime,$scope.endTime);
            if(timeDiff > 31){
                return alert("选取的时间范围不能超过31天");
            }
            var form = $("#exportForm");
            form.attr("action", siteVar.serverUrl + "/xinghuouser/exportnewUser.shtml").submit();
            $scope.close();
        };
        $scope.close = function() {
            $modalInstance.close();
        };
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
        // consumer
        /**
         * [普通用户导入模板]
         * @param  {[type]}  [description]
         * @param  {[type]}  [description]
         * @return {[type]}  [description]
         */
        $("#js_consumer_import").off("click").on("click", function(){
            var postUrl = $(this).attr("action");
            if(!$("#js_file").val()) return alert("请选择导入文件");
            var nameArr = $("#js_file").val().split(".");
            if(!/xls/gi.test(nameArr[nameArr.length-1])) return alert("文件必须是excel文件，后缀名为xls或者xlsx!");
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            $("#js_dialog_progress").modal({backdrop: 'static', keyboard: false});
            // tools.ajaxForm({
            //     "ele": $("#js_consumer_form"),
            //     "action": siteVar.serverUrl + postUrl,
            //     onComplete: function(data){
            //         tools.ajaxOpened(self);
            //         $("#js_dialog_progress").modal("hide");
            //         if(!tools.interceptor(data)) return;
            //         if(data.success){
            //             alert("宜信员工总数："+data.data+" 个！");
            //             return $(".js_search").trigger("click");
            //         }
            //     }
            // });

            var data = new FormData($("#js_consumer_form")[0]);
            $.ajax({
                url : siteVar.serverUrl + postUrl,
                type:"POST",
                data : data,
                processData: false,
                contentType: false,
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    };
                    tools.ajaxOpened(self);
                    $("#js_dialog_progress").modal("hide");
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert("宜信员工总数：" + data.data + " 个！");
                        return vm.dtInstance.rerender();
                    }
                }

            });
        });

        /**
         * [是否允许修改银行卡]
         */
        $("#dataTables tbody").on("click", ".js_switch_bankCard", function () {

            var self = this;
            if(!tools.ajaxLocked(self)) return;
            var userid = $(self).data().id;

            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/toChangeFundCard.shtml",
                data: {},
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        var strHtml = ['<div class="modal-content"><div class="modal-header">',
                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>',
                            '<h4 class="modal-title fn-ms">确定允许用户修改银行卡？</h4></div>',
                            '<div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">取消</button>',
                            '<button type="button" class="btn btn-success fn-ms" data-userid="'+userid+'" id="js_switch_bankCard_sure">确认</button></div></div>'].join("");

                        $("#js_dialog .js_content").css({"width": "35%"}).html(strHtml);
                        $("#js_dialog").modal("show");
                        $('#js_dialog').on('hidden.bs.modal', function (e) {
                            $(self).find("input[type='checkbox']").prop("checked", false);
                        });
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });

        /**
         * [允许修改银行卡]
         */
        $("#js_dialog").on("click", "#js_switch_bankCard_sure", function () {
            var self = this;
            if(!tools.ajaxLocked(self)) return;
            var data = $(self).data();
            $("#js_dialog").modal("hide");

            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuouser/changeFundCard.shtml",
                data: data,
                dataType: "json",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    if(data.success){
                        alert(data.msg);
                        vm.dtInstance.rerender();
                    }
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
        });

        /**
         * [普通用户下载模板]
         * @param  {[type]}  [description]
         * @return {[type]}  [description]
         */
        $("#js_consumer_download").on("click", function(){
            $("#js_consumer_form").attr("action", siteVar.serverUrl + $(this).attr("action")).submit();
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
