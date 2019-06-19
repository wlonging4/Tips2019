'use strict';
function editSubject($scope, $timeout,$state, tools, $location, getSelectListFactory) {
    var form = $("#subjectAddFM"), subtype;
    $scope.form = {
        "type" : ""
    };
    $scope.select = {};
    $scope.img = {};
    $scope.action = {};
    $scope.pageTitle = '新增项目';
    $scope.flag = true;
    $scope.typeflag = true;
    var info = $location.$$search.info;
    $scope.flag = info ? false : true;
    info = info ? JSON.parse(info) : {};
    getSelectListFactory.getSelectList(['gold_rainbow_label', 'gold_rainbow_type', 'gold_rainbow_subtype']).then(function(data){
        $scope.labels = data.appResData.retList[0].gold_rainbow_label;
        $scope.select.gold_rainbow_type = data.appResData.retList[1].gold_rainbow_type;
        if(info){
            $scope.form.type = info.type;
            $scope.form.subtype = info.subtype;
        };
        subtype = data.appResData.retList[2].gold_rainbow_subtype;
        $timeout(function(){
            form.find("[type='checkbox']").uniform();
        }, 0)
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
            if(!$scope.typeflag){
                $scope.form.subtype = "";
            }
            if(newValue == 5){
                $("#saveBtn").addClass("disabled");
                $scope.tips = "此类产品顾问费率只能输入数字";
            }else{
                $("#saveBtn").removeClass("disabled");
                $scope.tips = "此类产品顾问费率需输入数字及%符号";
            };
            $scope.typeflag = false;

        }, true);
    });
    $scope.check = function(key){
        if(info && info.labels){
            return info.labels.indexOf(key) > -1;
        }else{
            return false;
        }
    }
    //var subtype = [[{key:101, value:"私募股权产品"}, {key:102, value:"私募股权机构"}], [{key:201, value:"资本市场"}], [{key:301, value:"地产基金"}, {key:302, value:"海外置业"}, {key:303, value:"海外投资"}], [{key:401, value:"类固定收益"}]];

    //$scope.$watch("form.type", function(newValue,oldValue){
    //    if(newValue && newValue != ""){
    //        $scope.select.subtype = [];
    //        angular.forEach(subtype, function(data, index, array){
    //            if(data.key.charAt(0) == newValue){
    //                $scope.select.subtype.push(data)
    //            }
    //        });
    //    }else{
    //        $scope.select.subtype = [];
    //        $scope.select.ids = [];
    //    };
    //}, true);
    if(info){
        $scope.pageTitle = '修改项目';
        $scope.form.name = info.name || "";
        $scope.form.id = info.id;
        //$scope.form.type = info.type;
        //$scope.form.subtype = info.subtype;
        $scope.form.p_startopentime = tools.toJSDate(info.opentime);
        $scope.form.minlimit = parseInt(info.minlimit);
        $scope.form.minlimitunit = info.minlimitunit;
        $scope.form.renewperiod = info.renewperiod;
        $scope.form.collectscope = info.collectscope;
        $scope.form.collectperiod = info.collectperiod;
        $scope.form.emptioncost = info.emptioncost;
        $scope.form.managementcost = info.managementcost;
        $scope.form.capitaltype = info.capitaltype;
        $scope.form.profit = info.profit;
        $scope.form.highlights = info.highlights;
        $scope.form.profitassign = info.profitassign;
        $scope.form.trustee = info.trustee;
        $scope.form.assetsaccount = info.assetsaccount;
        $scope.form.risklevel = info.risklevel;
        $scope.form.investscope = info.investscope;
        $scope.form.commissionassign = info.commissionassign;
        $scope.form.introduction = info.introduction;
        $scope.form.remark = info.remark;
        $scope.img.name = info.attachment;
        if(info.type == 5){
            $("#saveBtn").addClass("disabled");
            $scope.tips = "此类产品顾问费率只能输入数字";
        }else{
            $("#saveBtn").removeClass("disabled");
            $scope.tips = "此类产品顾问费率需输入数字及%符号";
        };
    }else{
        $scope.form.type = "";
        $scope.form.subtype = "";
    };
    $timeout(function(){
        var names = {
            "code":{ hmsg: "请输入项目编码", regexp: "", showok: false, style: {placement: "top"}, emsg: "项目编码不能为空", rmsg: "" },
            "name":{ hmsg: "请输入项目名称", regexp: "", showok: false, style: {placement: "top"}, emsg: "项目名称不能为空", rmsg: "" },
            "type":{ hmsg: "请选择项目类别", regexp: "", showok: false, style: {placement: "top"}, emsg: "项目类别不能为空", rmsg: "" },
            "subtype":{ hmsg: "请输入项目子类别", regexp: "", showok: false, style: {placement: "top"}, emsg: "项目子类别不能为空", rmsg: "" },
            "minlimit":{ hmsg: "请输入最低金额", regexp: /^[1-9]\d*$/, rmsg:"最低金额必为正整数", showok: false, style: {placement: "top"}, emsg: "最低金额不能为空"},
            "renewperiod":{ hmsg: "请输入续存期限", showok: false, style: {placement: "top"}, emsg: "续存期限不能为空"},
            "capitaltype":{ hmsg: "请输入资本类型", regexp: "", showok: false, style: {placement: "top"}, emsg: "资本类型不能为空", rmsg: "" }
        };
        for(name in names){
            var validator = names[name];
            form.find('[name=' + name + ']').Validator(validator);
        };
        function testNum(num){
            var reg = /^\+*\d+(\.{0,1}\d+){0,1}$/;
            return reg.test(num) && num > 0;
        }
        $(document).off("click").on("click", "#saveBtn, #publishBtn", function(){

            var self = $(this), id = self.attr("id"), data, url, form = $("#subjectAddFM"), idInput = form.find('[name="id"]'), submitType = form.find('[name="submitType"]'), labelsch = form.find("[name='labelsch']");
            url = form.attr("action");
            submitType.val(id == "saveBtn" ? 0 : 1);

            if($scope.flag){
                if(!tools.Validator(form.find("[name='code'],[name='name'], [name='type'], [name='subtype'], [name='minlimit'], [name='renewperiod'], [name='capitaltype']"))){
                    return alert("请完善信息！");
                };
            }else{
                if(!tools.Validator(form.find("[name='name'], [name='type'], [name='subtype'], [name='minlimit'], [name='renewperiod'], [name='capitaltype']"))){
                    return alert("请完善信息！");
                };
            };

            if(!idInput.val() && !tools.Validator(form.find("[name='code']"))){
                return alert("请完善信息！");
            };
            if( ($scope.form.type == 5) && $scope.form.profit && !testNum($scope.form.profit)){
                return alert("收益必为正数！")
            };
            if(($scope.form.type == 5) && $scope.form.commissionassign && !testNum($scope.form.commissionassign)){
                return alert("顾问费率必为正数！")
            };
            labelsch = labelsch.filter(function(index){
                return $(this).prop("checked")
            });
            if(labelsch.length > 3){
                return alert("项目便签不能超3个！")
            };
            var data = new FormData(form[0]);
            $.ajax({
                url : siteVar.serverUrl + url,
                type:"POST",
                data : data,
                processData: false,
                contentType: false,
                success :function(data){
                    if(typeof data == "string"){
                        var data = JSON.parse(data);
                    };
                    if(data.success){
                        if(id == "saveBtn"){
                            alert("保存成功！");
                            idInput.val(data.msg);
                            self.addClass("disabled");
                        }else{
                            alert("发布成功！");
                            $state.go("xinghuogoldrainbow-subject");
                        };
                        form.find("input, textarea").each(function(){
                            $(this).attr("readonly", "readonly");
                        });
                        form.find("input[type='checkbox']").each(function(){
                            $(this).attr("onclick", "return false");
                            $(this).addClass("disabled").prop("disabled", "true").uniform();
                        });
                        form.find("input[type='file']").each(function(){
                            $(this).attr("onclick", "return false");
                        });
                        form.find("select").each(function(){
                            $(this).attr({
                                "onchange": "this.selectedIndex=this.defaultIndex;",
                                "onfocus":"this.defaultIndex=this.selectedIndex;"
                            });
                        });
                    }else{
                        alert(data.msg || "保存失败！");
                    }
                }

            });
            //tools.ajaxForm({
            //    "ele": form,
            //    "action": siteVar.serverUrl + url,
            //    onComplete: function(data){
            //        tools.ajaxOpened(self);
            //        if(data.success){
            //            if(id == "saveBtn"){
            //                alert("保存成功！");
            //                idInput.val(data.msg);
            //                self.addClass("disabled");
            //            }else{
            //                alert("发布成功！");
            //                $state.go("xinghuogoldrainbow-subject");
            //            };
            //            form.find("input, textarea").each(function(){
            //                $(this).attr("readonly", "readonly");
            //            });
            //            form.find("input[type='checkbox']").each(function(){
            //                $(this).attr("onclick", "return false");
            //                $(this).addClass("disabled").prop("disabled", "true").uniform();
            //            });
            //            form.find("select").each(function(){
            //                $(this).attr({
            //                    "onchange": "this.selectedIndex=this.defaultIndex;",
            //                    "onfocus":"this.defaultIndex=this.selectedIndex;"
            //                });
            //            });
            //        }else{
            //            alert("保存失败！")
            //        }
            //    }
            //});

        });
    }, 0);













}
