'use strict';
function subjectEmailinfo($scope, $http, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group"), subtype;
    $scope.form = {
        isShow: (conditionItem.length > 6) ? true : false

    };
    $scope.select = {};
    $scope.action = {};
    /*
     获取枚举类型
     */
    getSelectListFactory.getSelectList(['sendstatus', 'gold_rainbow_type', 'gold_rainbow_subtype']).then(function(data){
        $scope.select.sendstatus = data.appResData.retList[0].sendstatus;
        $scope.select.gold_rainbow_type = data.appResData.retList[1].gold_rainbow_type;
        subtype = data.appResData.retList[2].gold_rainbow_subtype;
    }).then(function(){
        console.log(subtype)
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
    //var subtype = [[{key:101, value:"私募股权产品"}, {key:102, value:"私募股权机构"}], [{key:201, value:"资本市场"}], [{key:301, value:"地产基金"}, {key:302, value:"海外置业"}, {key:303, value:"海外投资"}], [{key:401, value:"类固定收益"}]];


    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuogoldrainbow/tableSubjectEmailinfo.shtml',
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
        DTColumnBuilder.newColumn('subjectName').withTitle('项目名称').withOption('sWidth', '160px').renderWith(function(data, type, full) {
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuogoldrainbow/subjectInfo.shtml?id=' + full.subjectId + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('managerName').withTitle('理财经理姓名').withOption('sWidth','100px').renderWith(function(data, type, full) {
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuouser/userinfo.shtml?userType=director&id=' + full.userId + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('managerMobile').withTitle('理财经理手机号').withOption('sWidth','100px'),
        DTColumnBuilder.newColumn('emailInfo').withTitle('获取资料邮箱地址').withOption('sWidth','140px'),
        DTColumnBuilder.newColumn('submitTime').withTitle('提交时间').withOption('sWidth', '140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('emailStatus').withTitle('邮箱是否激活').withOption('sWidth', '90px').renderWith(function(data, type, full) {
            if(data == 0){
                return "未验证";
            }else if(data == 1){
                return "已验证";
            }else if(data == 2){
                return "验证失败";
            }else{
                return ""
            }
        }),
        DTColumnBuilder.newColumn('sendStatus').withTitle('资料发送状态').withOption('sWidth','90px').renderWith(function(data, type, full) {
            if(data == 0){
                return "<span style='color:red;font-weight: bold;'>未发送</span>";
            }else if(data == 1){
                return "发送成功";
            }else if(data == 2){
                return "发送失败";
            }else{
                return "";
            }
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','60px').renderWith(function(data, type, full) {
            return '<a href="javascrip:void(0);" data-toggle="popover" data-id="' + data + '" data-placement="left" data-flag=0 class="goldRainbowEmailinfo">更改状态</a>';
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
                    popUpLayerContent.find("input[type='checkbox']").prop("disabled", "true").uniform();
                    popUpLayer.modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });

        var sendStatus = {
            0:"未发送",
            1:"发送成功",
            2:"发送失败"
        };
        tbody.on("click", ".goldRainbowEmailinfo", function(){
            var self = $(this), id = self.attr("data-id"), flag = parseInt(self.attr("data-flag"));
            if(flag == 0) {
                self.popover({
                    html: true,
                    title: '状态更改',
                    content: function () {
                        var html = '<div class="btn-group-vertical goldRainbowEmailinfoStatus" role="group" aria-label="...">';
                        for (var key in sendStatus) {
                            html += '<button type="button" class="btn btn-default" data-id="' + id + '" data-status="' + key + '">' + sendStatus[key] + '</button>';
                        }
                        html += '</div>';
                        html += '<div style="text-align:right;border-top:1px solid #ccc;padding-top:10px;margin-top:10px;"><button class="btn btn-sm btn-danger goldRainbowEmailinfoConfirm">确定更改</button> <button class="btn btn-sm goldRainbowEmailinfoCancel">取消更改</button>';
                        return html;
                    }
                }).popover('show');
                self.attr("data-flag", 1);
            };
            return false;
        });
        $(".goldRainbowEmailinfo").on('shown.bs.popover', function(){
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
        tbody.on("click", ".goldRainbowEmailinfoStatus button", function(){
            var btns = $(this).parent().find("button");
            btns.removeAttr("current").removeClass("btn-primary");
            $(this).attr("current", true).addClass("btn-primary");
        });
        tbody.on("click",".goldRainbowEmailinfoConfirm",function(){
            var self = $(this), tr = self.parents("tr"), tds = tr.children(), parentTd = self.parents("td");
            var popup = parentTd.find(".goldRainbowEmailinfo");
            var currentBtn = self.parents(".popover-content").find('[current=true]');
            if(currentBtn.length < 1){
                alert('请选择一个状态或取消更改');
                return ;
            };
            var id = currentBtn.attr("data-id"), status = parseInt(currentBtn.attr("data-status"));
            var data = {
                id : id,
                sendStatus : status
            };

            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuogoldrainbow/changeEmailinfoStatus.shtml",
                data: data,
                dataType: "text",
                success: function(res){
                    tools.ajaxOpened(self);
                    var res = JSON.parse(res);
                    if(res.success){
                        if($.trim(currentBtn.html()) == "未发送"){
                            tds.eq(6).html("<span style='color:red;font-weight: bold;'>" + currentBtn.html() + "</span>");
                        }else{
                            tds.eq(6).html(currentBtn.html());
                        };
                    }else{
                        alert(res.msg);
                    };
                    popup.popover("hide");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            });
            return false;
        });
        tbody.on("click", ".goldRainbowEmailinfoCancel", function(){
            var self = $(this), parentTd = self.parents("td"), popup = parentTd.find(".goldRainbowEmailinfo");
            popup.popover("hide");
        });

    }
}
