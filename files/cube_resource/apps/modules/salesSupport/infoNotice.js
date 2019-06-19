'use strict';
function infoNoticeController($scope,getSelectListFactory,$timeout, $modal, tools,DTOptionsBuilder, DTColumnBuilder,$q){
    $scope.form = {
        isShow: ($("#js_form").find(".form-group").length>6) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    $scope.pageNum=1;

    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder
        .newOptions().withOption('ajax',{
            url: siteVar.serverUrl + 'messageRemind/list.json',
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
        DTColumnBuilder.newColumn('typeStr').withTitle('消息类型').withOption('sWidth','90px').notSortable().renderWith(function (data,type,full) {
            return data+(!full.readStatus?' <em style="display: inline-block;vertical-align:center;width: 6px;height:6px;background: red;border-radius: 3px;transform: translateY(-2px);"></em>':'');
        }),
        DTColumnBuilder.newColumn('content').withTitle('消息内容').withOption('sWidth','280px').notSortable().renderWith(function (data,type,full) {
            return data;
        }),
        DTColumnBuilder.newColumn('remindTime').withTitle('提示时间').withOption('sWidth','60px').notSortable().renderWith(function(data,type,full){
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('subtypeDesc').withTitle('操作').withOption('sWidth','40px').renderWith(function (data, type, full) {
            if (full.type !== 3) {
                //用户开户记录
                if(full.type&&full.type==1){
                    return "<a href='javascript:;' data-href='"+siteVar.basicUrl+"#/userAddManage.html?&registerTimeStart="+full.newUserBeginTime+"&registerTimeEnd="+full.newUserEndTime+"' style='width:100px;height: 30px;padding:0;border-radius: 10px;line-height: 30px;' class='btn btn-primary infoItem' data-id='" + full.id + "'>查看详情</a>";
                }
                //交易失败记录
                if(full.type&&full.type==2){
                    return "<a href='javascript:;' data-href='"+siteVar.basicUrl+"#/tradeSheet.html?&lenderId="+full.lenderId+"&createTime="+tools.toJSDate(full.createTime)+"' style='width: 100px;height: 30px;padding:0;border-radius: 10px;line-height: 30px;' class='btn btn-primary infoItem' data-id='" + full.id + "'>查看详情</a>";
                }
            } else{
                //创建私人订制
                return "<a href='javascript:;' data-href='' style='width: 100px;height: 30px;padding:0;border-radius: 10px;line-height: 30px;' class='btn btn-primary infoItem'" +
                    " data-id='" + full.id + "'>"+(full.readStatus==1?'<span style="display: block;width: 100%;height:100%;background: #ccc">已读</span>':'标为已读')+"</a>";
            }
        })
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


    function fnDrawCallback(data){
        $scope.pageNum=data._iDisplayStart/data._iDisplayLength+1;
        console.log($scope.pageNum);
        tools.createModal();
        tools.createModalProgress();
        if(!tools.interceptor(window.ajaxDataInfo)) return;

        $('.infoItem').click(function () {
            var nowHref=$(this).attr('data-href');
            var nowId=$(this).attr('data-id');
            //console.log(nowHref);console.log(nowId);
            $.ajax({
                url: siteVar.serverUrl + "messageRemind/updateReadStatus.json",
                type: "POST",
                data: {'messageRemindId':nowId},
                success: function (data) {
                    if (data.success) {
                        console.log("请求成功");
                        if(nowHref){
                            window.open(nowHref);
                        }
                        //先刷新其他页面再刷新当前页才能trigger刷新
                        if($scope.pageNum&&$scope.pageNum==1){
                            vm.dtInstance.rerender();
                        }
                        if($scope.pageNum&&$scope.pageNum>1){
                            $('#redirect').val($scope.pageNum-1);
                            $('#pagination_btn_go').trigger('click');
                            $('#redirect').val($scope.pageNum);
                            $('#pagination_btn_go').trigger('click');
                            console.log('已修改状态且刷新页面')
                        }
                    } else {
                        console.log("请求失败");
                    }
                }
            });
        })
    }
    (function(){
        $("[ui-view]").append("<style>table.dataTable,table.dataTable.no-footer {width: 100% !important;}</style>");
    })();

}