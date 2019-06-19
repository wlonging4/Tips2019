'use strict';
function subjectApply($scope, $http, getSelectListFactory, getProListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group"), subtype;
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false

    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    getSelectListFactory.getSelectList(['gold_rainbow_apply_status', 'gold_rainbow_type', 'gold_rainbow_subtype']).then(function(data){
        $scope.select.applyStatusForQuery = data.appResData.retList[0].gold_rainbow_apply_status;
        $scope.select.gold_rainbow_type = data.appResData.retList[1].gold_rainbow_type;
        subtype = data.appResData.retList[2].gold_rainbow_subtype;
    }).then(function(){
        $scope.$watch("form.p_type", function(newValue,oldValue){
            if(newValue && newValue != ""){
                $scope.select.p_subtype = [];
                angular.forEach(subtype, function(data, index, array){
                    if(data.key.charAt(0) == newValue){
                        $scope.select.p_subtype.push(data)
                    }
                });
            }else{
                $scope.select.p_subtype = [];
                $scope.select.ids = [];
            };
            delete $scope.form.p_subtype;
            delete $scope.form.subjectId;
        }, true);
        $scope.$watch("form.p_subtype", function(newValue,oldValue){
            if(newValue && newValue != ""){
                $http({
                    method: "POST",
                    url: siteVar.serverUrl + "/xinghuogoldrainbow/getSubjects.shtml",
                    data: $.param({
                        type : $scope.form.p_type,
                        subtype: newValue
                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                        'X-Requested-With' :'XMLHttpRequest'
                    }
                }).success(function(data, status) {
                    if(!data.success) {
                        alert("获取项目列表失败，请与管理员联系。" + data.msg);
                        return;
                    };
                    $scope.select.ids = data.data;
                }).error(function(data, status) {
                    alert("获取项目列表失败，请与管理员联系。");
                    return;
                });
            }else{
                $scope.select.ids = [];
            };
            delete $scope.form.subjectId;
        }, true);
    });


    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuogoldrainbow/tableSubjectApply.shtml',
            type: 'POST',
            data: function(d){
                jQuery.extend(d, tools.getFormele({},domForm));
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
        .withOption('scrollX',true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('subjectCode').withTitle('非P2P项目编码').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('applyCode').withTitle('申请单号').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuogoldrainbow/applyInfo.shtml?applyId=' + full.id + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('subjectName').withTitle('项目名称').withOption('sWidth','200px'),
        DTColumnBuilder.newColumn('applyName').withTitle('申请人姓名').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('applyMobile').withTitle('申请人电话').withOption('sWidth', '90px'),
        DTColumnBuilder.newColumn('managerName').withTitle('理财经理姓名').withOption('sWidth', '100px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + full.managerid + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('applyStatusName').withTitle('申请单状态').withOption('sWidth','80px'),
        DTColumnBuilder.newColumn('applytime').withTitle('申请时间').withOption('sWidth','140px').renderWith(function(data, type, full) {
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','60px').renderWith(function(data, type, full) {
            return '<a href="javascrip:void(0);" data-toggle="popover" data-id="' + data + '" data-placement="left" data-flag=0 class="goldRainbowChangeStatus">更改状态</a>';
        })
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
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $("#js_apply_export").on("click", function(){
            tools.export(this);
        });

        var table = $("#dataTables"), tbody = table.find("tbody");
        table.off("click").on("click", ".infoDetail", function(){
            var self = $(this), href = self.attr("data-href"), data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "text",
                success: function(data){
                    tools.ajaxOpened(self);
                    if(!tools.interceptor(data)) return;
                    popUpLayerContent.html(data);
                    popUpLayer.modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });

        tbody.on("click", ".goldRainbowChangeStatus", function(){
            var self = $(this), id = self.attr("data-id"), flag = parseInt(self.attr("data-flag"));
            if(flag == 0){
                $.ajax({
                    type: "get",
                    url: siteVar.serverUrl + "/xinghuogoldrainbow/applyStatus.shtml",
                    dataType: "json",
                    success: function(res){
                        if(res.success){
                            self.popover({
                                html: true,
                                title : '状态更改',
                                content : function(){
                                    var _applyStatus = tools.objOrderByKey(res.data);
                                    var html = '<div class="btn-group-vertical goldRainbowApplyStatus" role="group" aria-label="...">';
                                    for(var key in _applyStatus){
                                        html += '<button type="button" class="btn btn-default" data-id="'+ id +'" data-status="' + key + '">' + _applyStatus[key] + '</button>';
                                    }
                                    html += '</div>';
                                    html += '<div style="text-align:right;border-top:1px solid #ccc;padding-top:10px;margin-top:10px;"><button class="btn btn-sm btn-danger goldRainbowConfirm">确定更改</button> <button class="btn btn-sm goldRainbowCancel">取消更改</button>';
                                    return html;
                                }
                            }).popover('show');
                            self.attr("data-flag", 1);
                        }else{
                            alert(res.msg);
                        }
                    }
                });
            };
            return false;
        });
        $(".goldRainbowChangeStatus").on('shown.bs.popover', function(){
            var siblingPop = $(this).next(".popover");
            $(".popover").each(function(){
                if($(this).attr("id") != siblingPop.attr("id")){
                    $(this).popover('hide');
                }
            });
        });
        $("body").on("click",function(){
            $(".popover").popover('hide');
        });
        $("#dataTables tbody").on("click",".popover",function(e){
            e.stopPropagation();
        });
        tbody.on("click", ".goldRainbowApplyStatus button", function(){
            var btns = $(this).parent().find("button");
            btns.removeAttr("current").removeClass("btn-primary");
            $(this).attr("current", true).addClass("btn-primary");
        });
        tbody.on("click",".goldRainbowConfirm",function(){
            var self = $(this), tr = self.parents("tr"), tds = tr.children(), parentTd = self.parents("td");
            var popup = parentTd.find(".goldRainbowChangeStatus");
            var currentBtn = self.parents(".popover-content").find('[current=true]');
            if(currentBtn.length < 1){
                alert('请选择一个状态或取消更改');
                return ;
            };
            var applyId = currentBtn.attr("data-id"), status = parseInt(currentBtn.attr("data-status"));
            var data = {
                applyId : applyId,
                status : status
            }
            if(data.status == 6){
                if(!confirm("确认终止吗？")){
                    popup.popover("hide");
                    return ;
                }
            };

            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuogoldrainbow/changeApplyStatus.shtml",
                data: data,
                dataType: "text",
                success: function(res){
                    tools.ajaxOpened(self);
                    var res = JSON.parse(res);
                    if(res.success){

                        tds.eq(6).html(currentBtn.html());
                    }else{
                        alert(res.msg);
                    }
                    popup.popover("hide");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
            return false;
        });
        tbody.on("click", ".goldRainbowCancel",function(){
            var self = $(this), parentTd = self.parents("td"), popup = parentTd.find(".goldRainbowChangeStatus");
            popup.popover("hide");
        });
    }
}
