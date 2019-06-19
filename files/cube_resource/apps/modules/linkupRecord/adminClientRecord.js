/**
 * Created by yanzhong1 on 2017/4/18.
 */
'use strict';
function adminLinkUpController($scope,$rootScope,tools,$modal,DTOptionsBuilder, DTColumnBuilder) {
    var form = $("#js_form"), conditionItem = form.find(".form-group");
    $scope.form = {
        isShow: (conditionItem.length>6) ? true : false
    };
    /*
     * 沟通标签
     * */
    $scope.select = {
        fLab : [
            {"text": "（空）", "value": "（空）", "default": false},
            {"text": "需要理财师对接", "value": "需要理财师对接", "default": false},
            {"text": "客户忙需要时间另约", "value": "客户忙需要时间另约", "default": false},
            {"text": "发资料先了解", "value": "发资料先了解", "default": false},
            {"text": "宜信同事", "value": "宜信同事", "default": false},
            {"text": "不需要", "value": "不需要", "default": false},
            {"text": "客户已有绑定理财师", "value": "客户已有绑定理财师", "default": false},
            {"text": "贷款需求", "value": "贷款需求", "default": false},
            {"text": "小额投资", "value": "小额投资", "default": false},
            {"text": "无人接听", "value": "无人接听", "default": false},
            {"text": "交流障碍", "value": "交流障碍", "default": false},
            {"text": "空号", "value": "空号", "default": false},
            {"text": "挂断/网络繁忙", "value": "挂断/网络繁忙", "default": false},
            {"text": "财富管理同行", "value": "财富管理同行", "default": false},
            {"text": "信贷同行", "value": "信贷同行", "default": false}
        ],
        mLab : [
            {"text": "（空）", "value": "（空）", "default": false},
            {"text": "合格潜客", "value": "合格潜客", "default": false},
            {"text": "发资料先了解", "value": "发资料先了解", "default": false},
            {"text": "客户忙需要花时间另约", "value": "客户忙需要花时间另约", "default": false},
            {"text": "宜信同事", "value": "宜信同事", "default": false},
            {"text": "不需要", "value": "不需要", "default": false},
            {"text": "贷款需求", "value": "贷款需求", "default": false},
            {"text": "财富管理同行", "value": "财富管理同行", "default": false},
            {"text": "信贷同行", "value": "信贷同行", "default": false},
            {"text": "小额投资", "value": "小额投资", "default": false},
            {"text": "无人接听", "value": "无人接听", "default": false},
            {"text": "挂断/网络繁忙", "value": "挂断/网络繁忙", "default": false}
        ],
        mLabResult : [
            {"text": "（空）", "value": "（空）", "default": false},
            {"text": "合格潜客", "value": "合格潜客", "default": false},
            {"text": "疑似合格潜客", "value": "疑似合格潜客", "default": false},
            {"text": "放弃（同行）", "value": "放弃（同行）", "default": false},
            {"text": "放弃（小额投资）", "value": "放弃（小额投资）", "default": false},
            {"text": "其他（请备注）", "value": "其他（请备注）", "default": false},
        ]
    };

    $scope.username = $(".username").text().replace(/(^\s*)|(\s*$)/g,"");

    /*
    * 客户线索池 --创建表格
    * 2017-04-25
    * */
    var vm = this;
    vm.dtInstance={};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
        url:siteVar.serverUrl +'customerClue/queryCustomerClueList.json',
        type:'POST',
        data: function(d){
            jQuery.extend(d,tools.getFormele({},form))
        }
    })
        .withDataProp('data')
        .withOption('createdRow',function(row,data,dataIndex){
            angular.element(row).addClass("rows"+data.id);
        })
        .withOption('searching',false)
        .withOption('ordering',false)
        .withOption('serverSide',true)
        .withOption('processing',false)
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback',fnDrawCallback)
        .withPaginationType('simple_numbers');
    var dtColumns = [
        DTColumnBuilder.newColumn('clueId').withTitle('线索ID').withOption('sWidth','140px').renderWith(function(data,type,full){
            return '<a href="#recordInfo.html?clueId=' + data +'" target="_blank">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('clueType').withTitle('线索类型').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('userName').withTitle('客户姓名').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('userMobile').withTitle('手机号').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('importTime').withTitle('导入时间').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('deleteHandle').withTitle('管理员操作').withOption('sWidth','80px').renderWith(function(data,type,full){
            if(full.firstScreenUser == '未分配'){
                return '<a href="javascript:;" class="deleteClue" data-href="customerClue/deleteCustomerClueByClueId.json?clueId='+full.clueId+'">删除</a>'
            }else{
                return '<span style="color:#ccc">删除</span>'
            }
        }),
        DTColumnBuilder.newColumn('firstScreenTime').withTitle('初筛分配时间').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('firstScreenUser').withTitle('初筛人').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('id').withTitle('初筛人操作').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(full.isDistribution == 1 && full.firstScreenUser == $scope.username){
                return '<a href="#recordInfo.html?clueId=' + full.clueId +'" target="_blank">查看</a> <a href="javascript:;" class="changeClientFrist" action="#editScreen.html?clueId=' + full.clueId +'" target="_blank">修改</a>';
            }else{
                return '<a href="#recordInfo.html?clueId=' + full.clueId +'" target="_blank">查看</a> <span style="color:#ccc;">修改</span>';
            }
        }),
        DTColumnBuilder.newColumn('firstScreenFirstLab').withTitle('初筛第一次沟通标签').withOption('sWidth','160px').renderWith(function(data,type,full){
            return full.screenCommuDetail.firstScreenFirstLab;
        }),
        DTColumnBuilder.newColumn('firstScreenSecondLab').withTitle('初筛第二次沟通标签').withOption('sWidth','160px').renderWith(function(data,type,full){
            return full.screenCommuDetail.firstScreenSecondLab;
        }),
        DTColumnBuilder.newColumn('firstScreenThirdLab').withTitle('初筛第三次沟通标签').withOption('sWidth','160px').renderWith(function(data,type,full){
            return full.screenCommuDetail.firstScreenThirdLab;
        }),
        DTColumnBuilder.newColumn('firstScreenFilterResLab').withTitle('初筛结果标签').withOption('sWidth','160px').renderWith(function(data,type,full){
            return full.screenCommuDetail.firstScreenFilterResLab;
        }),
        DTColumnBuilder.newColumn('financial').withTitle('理财师沟通人').withOption('sWidth','90px'),
        DTColumnBuilder.newColumn('id').withTitle('理财师操作').withOption('sWidth','100px').renderWith(function(data,type,full){
            if(full.isTrans == 1 && full.financial == $scope.username){
                return '<a href="#recordInfo.html?clueId=' + full.clueId +'" target="_blank">查看</a> <a href="javascript:;" class="changeClientFinancial" action="#editWealthManager.html?clueId=' + full.clueId +'" target="_blank">修改</a>';

            }else{
                return '<a href="#recordInfo.html?clueId=' + full.clueId +'" target="_blank">查看</a> <span style="color:#ccc;">修改</span>';
            }
        }),
        DTColumnBuilder.newColumn('secondScreenFilterResLab').withTitle('最终确认').withOption('sWidth','160px').renderWith(function(data,type,full){
            return full.finanCommuDetail.secondScreenFilterResLab
        }),

    ];
    vm.dtColumns = dtColumns;
    //$scope.$watch('tableinfo.recordsFiltered', function(newValue, oldValue){
    //    console.log(newValue)
    //});
    function fnDrawCallback(data){
        //console.log($rootScope.clientData);
        /*
         刷新统计数据
         */
        $scope.$apply(function(){
            $scope.tableinfo = !data.json.undistributedNumber ? 0 :data.json.undistributedNumber;
            $scope.form.firstScreenUser = !data.json.firstScreenUserInitialValue ? "":data.json.firstScreenUserInitialValue;
            $scope.form.financial = ! data.json.financialInitialValue? "" : data.json.financialInitialValue;
            $scope.oldUser = !data.json.firstScreenUserInitialValue ? "":data.json.firstScreenUserInitialValue;
            $scope.oldFinancial = !data.json.firstScreenUserInitialValue ? "":data.json.firstScreenUserInitialValue;
        });
        /*
        * 管理员操作 -- 删除
        * */
        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click",".deleteClue",function(){
            var self = $(this), href = self.attr("data-href"), dataId, url;
            url = href.split('?')[0];
            dataId = tools.queryUrl(href);
            $.when($.ajax({type:"POST",url:siteVar.serverUrl +"customerClue/deleteCustomerClueByClueIdPage.json"})).then(function(data){
                if(data.success){
                    if(!tools.ajaxLocked(self)) return;
                    $.ajax({
                        type:"post",
                        url:siteVar.serverUrl+url,
                        data:dataId,
                        success:function(data){
                            if(data.success){
                                alert(data.msg);
                                $scope.action.search();
                            }else{
                                alert(data.msg);
                            }

                        },
                        error:function(err){
                            tools.ajaxOpened(self);
                            tools.ajaxError(err);
                        }
                    })
                }
            }).fail(function(){
                alert("用户没有权限！");
                return;
            });
        });
        /*
        * 初筛入操作 -- 修改（权限）
        * */
        $(".changeClientFrist",table).off("click").on("click",function(){
            var targetUrl = $(this).attr("action");
            $.ajax({
                type:"POST",
                url:siteVar.serverUrl +"customerClue/updateScreenCommuDetailPage.json",
                success:function(data){
                    if(data.success){
                        //window.location.href = targetUrl;
                        window.open(targetUrl,'_blank');
                    }
                },
                error:function(err){
                    alert("用户没有权限！");
                    return;
                }
            })
        })
        /*
        * 理财师操作 -- 修改（权限）
        * */
        $(".changeClientFinancial",table).off("click").on("click",function(){
            var targetUrl = $(this).attr("action");
            $.ajax({
                type:"POST",
                url:siteVar.serverUrl + "customerClue/updateFinanCommuDetailPage.json",
                success:function(data){
                    if(data.success){
                        //window.location.href = targetUrl;
                        window.open(targetUrl,'_blank');
                    }else{
                        alert("没有权限！");
                    }
                },
                error:function(err){
                    alert("用户没有权限！");
                    return;
                }
            })
        })
    }
    /*
    * 查询
    * */
    $scope.action={};
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };
    /*
    * 重置
    * */
    $scope.action.reset = function(){
        var isDisRadio = $('input[name="isDistribution"]:checked'),isTransRadio=$('input[name="isTrans"]:checked');
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        }
        //radio reset
        if(isDisRadio.prop("checked")){
            isDisRadio.prop("checked",false).attr("checked","");
            $('.radio').children('span').removeAttr('class');
        }
        if(isTransRadio.prop("checked")){
            isTransRadio.prop("checked",false).attr("checked","");
            $('.radio').children('span').removeAttr('class');
        }
        vm.dtColumns = $.extend([],dtColumns);
        $scope.action.search();
    };


    /**
     * [导入弹出]
     * @param  {[type]}   [description]
     * @return {[type]}   [description]
     */
    var toLeadClientCtrl = function($scope, $modalInstance){
        $scope.dowmloadTemplate = function(e){
            var This = $(e.currentTarget);
            tools.export(This);
        }
        $scope.ok = function(){
            var self = $("#importConfirmBtn"),filevalue = $("#js_upload_settle_form [name='file']").val();
            if(!filevalue) return alert("请选择导入文件");
            var nameArr = filevalue.split(".");
            if(!/xls/gi.test(nameArr[nameArr.length-1])) return alert("文件必须是excel文件，后缀名为xls或者xlsx!");

            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            var data = new FormData($("#js_upload_settle_form")[0]);
            $.ajax({
                url : siteVar.serverUrl + $("#js_upload_settle_form").attr("action"),
                type:"POST",
                data : data,
                processData: false,
                contentType: false,
                success :function(data) {
                    if(data.success){
                        vm.dtInstance.rerender();
                        $("#js_dialog_progress").modal("hide");
                        var str = '<div class="modal-content"><div class="modal-header"><button id="js_dialog_passport_settle_close" type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                                '<span aria-hidden="true">×</span></button><h4 class="modal-title fn-ms">导入线索客户</h4></div><div class="modal-body" style="max-height:300px; overflow-y: auto;font-size: 14px;">' + data.msg + '</div></div>';

                        $("#js_dialog_passport .js_content").html(str);
                        $("#js_dialog_passport").modal({backdrop: 'static', keyboard: false});

                    }else{
                        alert(data.msg);
                    }

                },
                error:function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }

            });
        }

        $scope.close = function() {
            $modalInstance.close();
        };
    };
    $scope.action.toLeadClient = function(){
        $.ajax({
            type:"post",
            url:siteVar.serverUrl + "customerClue/importCustomerCluePage.json",
            success:function(data){
                if(data.success){
                    $modal.open({
                        backdrop: true,
                        backdropClick: true,
                        dialogFade: false,
                        keyboard: true,
                        templateUrl : 'toLeadClientCtrl.html',
                        controller : toLeadClientCtrl,
                        windowClass:'modal-640'
                    });
                }else{
                    alert(data.msg);
                }
            },
            error:function(err){
                alert("用户没有权限！");
                return;
            }
        })

    };
    /**
     * [分配]
     * @param  {[type]}   [description]
     * @return {[type]}   [description]
     */
    var allocationCtrl = function($scope, $modalInstance,$timeout, list){
        $scope.result = {};
        $scope.userName = {};
        $scope.userResult={};
        $scope.userNum = list.number;
        $scope.list = list.list;

        $timeout(function(){
            $("#allocationForm").find("input[type='checkbox']").uniform();
        },0);
        $scope.verifyNum = function(e){
            var target = e.currentTarget, name=$(target).attr('data-names'), id = $(target).attr("data-id"), value = $(target).val();
            $(target).val(value.replace(/[^0-9]/g,''));
            var newValue = $(target).val();
            $scope.result[id] = newValue;
            $scope.userResult[id] = Math.ceil($scope.userNum*(newValue/100));
            $scope.userName[id]=name;
        }
        $scope.selectFilter = function(e){
            var target = e.currentTarget, checked = $(target)[0].checked, id = $(target).attr("data-id");
            if(!checked){
                delete $scope.result[id];
                delete $scope.userResult[id];
                delete $scope.userName[id]
            }else{
                $scope.result[id] = "";
                $scope.userResult[id] = "";
                $scope.userName[id] = "";
            };
        };

        $scope.ok = function() {
            var self=$("#clientUserSave"),sum = 0,submitData=[],userSum= 0,userMax=0,userMin= 0,maxId="",minId="";
            //验证
            for(var item in $scope.result){
                if($scope.result[item] == ""){
                    //$modalInstance.close();
                    alert("选中的初筛人分配比例不能为空！");
                    return
                }else{
                    sum += parseInt($scope.result[item]);
                }
            }
            if(sum != 100 ){
                //$modalInstance.close();
                alert("选中的初筛人分配比例之和必须为100%!");
                return;
            }
            //判断分配人数
            for(var item in $scope.userResult){
                userSum += parseInt($scope.userResult[item]);
                if($scope.userResult[item]-userMin <0){
                    userMin =$scope.userResult[item];
                    minId = item;
                }
                if($scope.userResult[item]-userMax >0){
                    userMax =$scope.userResult[item];
                    maxId = item;
                }
            }
            if(userSum-$scope.userNum>0){
                $scope.userResult[maxId] = $scope.userResult[maxId] -(userSum-$scope.userNum);
            }else if(userSum-$scope.userNum<0){
                $scope.userResult[minId] = $scope.userResult[minId] -(userSum-$scope.userNum);
            }
            //整合数据
            for(var key in $scope.userResult){
                if($scope.userResult[key] <= 0){
                    delete $scope.userResult[key];
                    return;
                }
                submitData.push({
                    realname : $scope.userName[key],
                    id : key,
                    percent: $scope.result[key],
                    userNumber : $scope.userResult[key]
                });
            }
            var usersJson =JSON.stringify(submitData); //submitData.toString();
            if(!tools.ajaxLocked(self)) return;
            $modalInstance.close();
            $.ajax({
                url :siteVar.serverUrl+'customerClue/assignTask.json',
                type:"POST",
                data:"users="+usersJson,
                success: function(data){
                    if(data.success){
                        vm.dtInstance.rerender();
                        $scope.$apply(function(){
                            $scope.tableinfo = window.ajaxDataInfo || {recordsFiltered:0, recordsTotal:0};
                        });
                    }else{
                        alert(data.msg);
                    }
                },
                error:function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });

        };
        $scope.close = function() {
            $modalInstance.close();
        };
    };
    $scope.action.allocation = function(){
        $.when($.ajax({type:"POST",url:siteVar.serverUrl +"customerClue/assignTaskPage.json"})).then(function(data){
            if(data.success){
                $.ajax({
                    url :siteVar.serverUrl +  'customerClue/loadUserByRole.json',
                    type:"POST",
                    data:'type=customer-clue-screen-user',
                    success: function(data){
                        if(data.success){
                            if(data.data.number == 0) return alert('可分配客户人数为0，不需要分配！');
                            $modal.open({
                                backdrop: true,
                                backdropClick:true,
                                dialogFade:false,
                                keyboard:true,
                                templateUrl:'allocationCtrl.html',
                                controller:allocationCtrl,
                                windowClass:'modal-640',
                                resolve:{
                                    "list": function(){
                                        return data.data;
                                    }
                                }
                            });
                        }else{
                            alert(data.msg);
                        }

                    }
                })
            }
        }).fail(function(){
            alert("用户没有权限！");
            return;
        });

    };
    $(function() {
        //提示弹出层，生成html
        tools.createModalUser();
        /**
         * [线索池导出]
         * @param  {[type]}   [description]
         * @return {[type]}   [description]
         */
        $(document).off("click", "#js_client_export");
        $(document).on("click", "#js_client_export", function () {
            var This = this;
            $.ajax({
                type:"POST",
                url:siteVar.serverUrl +"customerClue/exportCustomerCluePage.json",
                success:function(data){
                    if(data.success){
                        tools.export(This);
                    }else{
                        alert(data.msg);
                    }
                },
                error:function(err){
                    alert("用户没有权限！");
                    return;
                }
            })

        });
        /*
        * 初筛入、理财师是否改变（改变传false）
        * */
        $('input[name="firstScreenUser"]',document).off("change").on("change",function(){
            var oldUserInitial = $('input[name="oldUserInitial"]').val();
            if($(this).val() == '' || $(this).val() != oldUserInitial){
                $(this).siblings('input[name="firstScreenUserInitial"]').val(false);
            }
        });
        $('input[name="financial"]',document).off("change").on("change",function(){
            var oldFinancial = $('input[name="oldFinancial"]').val();
            if($(this).val() == '' || $(this).val() != oldFinancial){
                $(this).siblings('input[name="financialInitial"]').val(false);
            }
        })
    });

}
