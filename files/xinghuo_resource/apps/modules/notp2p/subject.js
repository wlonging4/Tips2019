'use strict';
function subject($scope, $http, getSelectListFactory, tools, DTOptionsBuilder, DTColumnBuilder) {
    var domForm = $("#js_form"), conditionItem = domForm.find(".form-group"), subtype;
    $scope.form = {
        isShow: (conditionItem.length > 1) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    getSelectListFactory.getSelectList(['gold_rainbow_type', 'gold_rainbow_subtype']).then(function(data){
        $scope.select.gold_rainbow_type = data.appResData.retList[0].gold_rainbow_type;
        subtype = data.appResData.retList[1].gold_rainbow_subtype;
        $scope.$watch("form.type", function(newValue,oldValue){
            if(newValue && newValue != ""){
                $scope.select.subtype = [];
                angular.forEach(subtype, function(data, index, array){
                    if(data.key.charAt(0) == newValue){
                        $scope.select.subtype.push(data)
                    }
                });
            }else{
                $scope.select.subtype = [];
                $scope.select.ids = [];
            };
            delete $scope.form.subtype;
            delete $scope.form.id;
        }, true);
        $scope.$watch("form.subtype", function(newValue,oldValue){
            if(newValue && newValue != ""){
                $http({
                    method: "POST",
                    url: siteVar.serverUrl + "/xinghuogoldrainbow/getSubjects.shtml",
                    data: $.param({
                        type : $scope.form.type,
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
            delete $scope.form.id;
        }, true);
    });
    //var subtype = [[{key:101, value:"私募股权产品"}, {key:102, value:"私募股权机构"}], [{key:201, value:"资本市场"}], [{key:301, value:"地产基金"}, {key:302, value:"海外置业"}, {key:303, value:"海外投资"}], [{key:401, value:"类固定收益"}]];

    $scope.$watch("form.type", function(newValue,oldValue){
        if(newValue && newValue != ""){
            $scope.select.subtype = subtype[newValue - 1];
        }else{
            $scope.select.subtype = [];
            $scope.select.ids = [];
        };
        delete $scope.form.subtype;
        delete $scope.form.id;
    }, true);
    $scope.$watch("form.subtype", function(newValue,oldValue){
        if(newValue && newValue != ""){
            $http({
                method: "POST",
                url: siteVar.serverUrl + "/xinghuogoldrainbow/getSubjects.shtml",
                data: $.param({
                    type : $scope.form.type,
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
        delete $scope.form.id;
    }, true);




    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax',{
            url: siteVar.serverUrl + '/xinghuogoldrainbow/tableSubject.shtml',
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
        DTColumnBuilder.newColumn('code').withTitle('非P2P项目编码').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('typestr').withTitle('项目类别').withOption('sWidth','70px'),
        DTColumnBuilder.newColumn('name').withTitle('项目名称').withOption('sWidth','110px').renderWith(function(data, type, full) {
            if(!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/xinghuogoldrainbow/subjectInfo.shtml?id=' + full.id + '">' + data + '</a>';
        }),
        DTColumnBuilder.newColumn('opentime').withTitle('开放日期').withOption('sWidth','140px').renderWith(function(data, type, full) {
            if(!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('commissionassign').withTitle('顾问费率').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('statusstr').withTitle('募集状态').withOption('sWidth', '160px').renderWith(function(data, type, full) {
            if(!data) return "";
            return (full.status == 2 || full.status == 1) ? "<span style='color:#999'>" + data + "</span>" : data;
        }),
        DTColumnBuilder.newColumn('id').withTitle('操作').withOption('sWidth','210px').renderWith(function(data, type, full) {
            var html = '', info = encodeURIComponent(JSON.stringify(full));
            html += '<a href="#xinghuogoldrainbow-editSubject.html?info=' + info + '" class="btn btn-danger btn-xs" style="margin: 0 5px;">修改项目信息</a>';
            html += '<a href="javascript:void(0);" data-toggle="popover" data-placement="left" data-id="' + data + '" class="btn btn-success btn-xs isPop stopRainbow" data-flag="0" style="margin: 0 5px;">更改募集状态</a></td>';
            return html;
        })
    ];
    $scope.action.reset = function(){
        for(var prop in $scope.form){
            if(prop !== 'isShow') delete $scope.form[prop];
        };
        vm.dtInstance.rerender();
    };
    $scope.action.search = function(){
        vm.dtInstance.rerender();
    };

    function fnDrawCallback(){
        tools.createModal();
        tools.createModalProgress();
        var popUpLayer = $("#js_dialog"), popUpLayerContent = popUpLayer.find(".js_content");

        $(".js_export").on("click", function(){
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
                    popUpLayerContent.find("input[type=checkbox]").uniform();
                    popUpLayer.modal("show");
                },
                error: function(err){
                    tools.ajaxOpened(self);
                    tools.ajaxError(err);
                }
            })
        });

        tbody.on("click", ".stopRainbow", function(){
            var self = $(this),flag = self.attr("data-flag");
            if(flag == 0){
                self.popover({
                    html: true,
                    title : '状态更改',
                    content : function(){
                        var id = $(this).attr("data-id"), statusObj = {
                            "3":"预热",
                            "0":"募集中",
                            "1":"募集结束（前台可见）",
                            "2":"募集结束（前台不可见）"
                        };
                        var html = '<div class="btn-group-vertical goldRainbowSubject" role="group" aria-label="...">';
                        for(var key in statusObj){
                            html += '<button type="button" class="btn btn-default" data-id="'+ id +'" data-status="' + key + '">' + statusObj[key] + '</button>';
                        }
                        html += '</div>';
                        html += '<div style="text-align:right;border-top:1px solid #ccc;padding-top:10px;margin-top:10px;"><button class="btn btn-sm btn-danger goldRainbowSubjectConfirm">确定更改</button> <button class="btn btn-sm goldRainbowSubjectCancel">取消更改</button>';
                        return html;
                    }
                }).popover('show');
                self.attr("data-flag", 1)
            };
            return false;
        });
        $(".stopRainbow").on('shown.bs.popover', function(){
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
        tbody.on("click", ".goldRainbowSubject button", function(){
            var btns = $(this).parent().find("button");
            btns.removeAttr("current").removeClass("btn-primary");
            $(this).attr("current", true).addClass("btn-primary");
        });
        tbody.on("click",".goldRainbowSubjectConfirm",function(){
            var self = $(this), tr = self.parents("tr"), tds = tr.children(), parentTd = self.parents("td");
            var popup = parentTd.find(".stopRainbow");
            var currentBtn = self.parents(".popover-content").find('[current=true]');
            if(currentBtn.length < 1){
                alert('请选择一个状态或取消更改');
                return ;
            };
            var id = currentBtn.attr("data-id"), status = parseInt(currentBtn.attr("data-status"));
            var data = {
                id : id,
                status : status
            };

            if(!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + "/xinghuogoldrainbow/updateSubjectStatus.shtml",
                data: data,
                dataType: "text",
                success: function(res){
                    tools.ajaxOpened(self);
                    var res = JSON.parse(res);
                    if(res.success){
                        if(data.status == 2 || data.status == 1){
                            tds.eq(5).html('<span style="color:#999">' + currentBtn.html() + '</span>');
                        }else{
                            tds.eq(5).html(currentBtn.html());
                        }

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
        tbody.on("click", ".goldRainbowSubjectCancel",function(){
            var self = $(this), parentTd = self.parents("td"), popup = parentTd.find(".stopRainbow");
            popup.popover("hide");
        });
    }
}
