'use strict';

function subjectList($scope, getSelectListFactory, $modal, tools, DTOptionsBuilder, DTColumnBuilder,$rootScope,$timeout) {
    var domForm = $("#js_form"),
        conditionItem = domForm.find(".form-group"),
        subtype;
    $scope.form = {
        isShow: (conditionItem.length > 1) ? true : false
    };
    $scope.select = {};
    $scope.action = {};
    $rootScope.num=1;

    getSelectListFactory.getselectp2p('SesameTypeEnum,SesameStatusEnum,RegionEnum,SesameCanPrivateEnum').then(function(data) {
        $scope.select.sesametypeenum = data.data.SesameTypeEnum;
        $scope.select.sesameStatusEnum = data.data.SesameStatusEnum;
        $scope.select.regionEnum = data.data.RegionEnum;
        $scope.select.sesameCanPrivateEnum = data.data.SesameCanPrivateEnum;
    });

    Number.prototype.mul = function(arg) {
        var m = 0,
            s1 = this.toString(),
            s2 = arg.toString();
        try {
            m += s1.split(".")[1].length
        } catch (e) {}
        try {
            m += s2.split(".")[1].length
        } catch (e) {}
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
    };

    /*
     创建表格选项
     */
    var vm = this;
    vm.dtInstance = {};
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('ajax', {
            url: siteVar.serverUrl + '/sesameproduct/tableSesameProduct.shtml',
            type: 'POST',
            data: function(d) {
                var showPosition = $('input[name="showPosition"]').val();
                $scope.form.showPosition = showPosition;
                //jQuery.extend(d, tools.getFormele({},domForm));
                jQuery.extend(d, $scope.form);
            }
        })
        .withDataProp('data')
        .withOption('createdRow', function(row, data, dataIndex) {
            angular.element(row).addClass("rows" + data.id)
        })
        .withOption('searching', false)
        .withOption('ordering', false)
        .withOption('serverSide', true)
        .withOption('processing', false)
        .withOption('scrollX', true)
        .withLanguage(tools.dataTablesLanguage)
        .withOption('fnDrawCallback', fnDrawCallback)
        .withPaginationType('simple_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('dbDto.showSequence').withTitle('排序').withOption('sWidth', '30px'),
        DTColumnBuilder.newColumn('dbDto.sesameCode').withTitle('项目编码').withOption('sWidth', '180px'),
        DTColumnBuilder.newColumn('dbDto.sesameTypeStr').withTitle('项目类型').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('dbDto.sesameName').withTitle('项目名称').withOption('sWidth', '240px').renderWith(function(data, type, full) {
            if (!data) return "";
            return '<a href="javascript:void(0);" class="infoDetail" data-href="/sesameproduct/viewSesameProduct.json?productId=' + full.dbDto.id + '">' + data + '</a>';
        }),

        DTColumnBuilder.newColumn('dbDto.regionStr').withTitle('所属地区').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('dbDto.adviserRate').withTitle('顾问费率').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            if (!data) return "0%";
            var base, f_base;
            if (full.dbDto.baseAdviserRate) {
                base = full.dbDto.baseAdviserRate;
            } else {
                base = 0;
            };
            if (full.dbDto.floatAdviserRate) {
                f_base = full.dbDto.floatAdviserRate;
            } else {
                f_base = 0;
            }
            return base + "%+" + f_base + "%";
        }),
        DTColumnBuilder.newColumn('dbDto.sesameStatusStr').withTitle('募集状态').withOption('sWidth', '60px').renderWith(function(data, type, full) {
            if (!data) return "";
            return "<span class='sesameStatus'>" + data + "</span>";
        }),
        DTColumnBuilder.newColumn('dbDto.updateTime').withTitle('更新时间').withOption('sWidth', '140px').renderWith(function(data, type, full) {
            if (!data) return "";
            return tools.toJSDate(data);
        }),
        DTColumnBuilder.newColumn('dbDto.upAndDownStr').withTitle('上下架状态').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            if (!data) return "";
            return data;
        }),
        DTColumnBuilder.newColumn('dbDto.canRecommendStr').withTitle('是否推荐').withOption('sWidth', '60px'),
        DTColumnBuilder.newColumn('dbDto.showPositionStr').withTitle('推荐位').withOption('sWidth', '100px'),
        DTColumnBuilder.newColumn('dbDto.sesameCode').withTitle('产品更新').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            return '<a href="javascript:;" class="btn btn-primary btn-xs updateData" data-code="' + full.dbDto.sesameCode + '">产品更新</a>';
        }),
        DTColumnBuilder.newColumn('dbDto.selfSupport').withTitle('是否自营').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            if (!data) return "";
            return data == 2 ? '是' : '否';
        }),
        DTColumnBuilder.newColumn('dbDto.surplusQuota').withTitle('剩余额度').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            if (full.dbDto.selfSupport!=2) return "";
            return data;
        }),
        DTColumnBuilder.newColumn('dbDto.sesameCode').withTitle('额度使用明细').withOption('sWidth', '90px').renderWith(function(data, type, full) {
            return '<a href="#/xinghuogoldrainbow-fixationProduct.html?productName=' + encodeURIComponent(full.dbDto.sesameName) + '" class="btn btn-primary btn-xs" data-code="' + full.dbDto.sesameCode + '">查看</a>';
        }),
        DTColumnBuilder.newColumn('dbDto.id').withTitle('操作').withOption('sWidth', '290px').renderWith(function(data, type, full) {
            var html = '';
            //alert(full.dbDto.seameQuota);
            html += '<a href="javascript:void(0)" class="btn btn-primary btn-xs editBtn" style="margin: 0 5px;" data-sesameType="' + full.dbDto.sesameType + '" data-surplusQuota="' + full.dbDto.surplusQuota + '" data-seameQuota="' + (full.dbDto.seameQuota || "") + '" data-selfSupport="' + (full.dbDto.selfSupport || "") + '" data-supportQuota="' + (full.dbDto.supportQuota || "") + '" data-upAndDown="' + (full.dbDto.upAndDown || "") + '" data-sesameCode="' + full.dbDto.sesameCode + '" data-sesameName="' + (full.dbDto.sesameName || "") +'" data-contractTemplateno="' + full.dbDto.contractTemplateno + '" data-sesameName="' + (full.dbDto.sesameName || "") +'" data-protocolPrefix="' + full.dbDto.protocolPrefix + '" data-sesameName="' + (full.dbDto.sesameName || "") + '" data-baseAdviserRate="' + (full.dbDto.baseAdviserRate || "") + '" data-floatAdviserRate="' + (full.dbDto.floatAdviserRate || 0) + '" data-sesameMonth="' + (full.dbDto.sesameMonth !== null ? full.dbDto.sesameMonth : '') +'" data-sesameSource="' + ((full.dbDto.sesameSource || full.dbDto.sesameSource == 0) ? full.dbDto.sesameSource : "") + '" data-isCashBack="' + ((full.dbDto.isCashBack || full.dbDto.isCashBack == 0) ? full.dbDto.isCashBack : "") + '" data-cashBackRule="' + (full.dbDto.cashBackRule || "") + '" data-sesameType="' + (full.dbDto.sesameType || "") + '" data-sesameTypeStr="' + (full.dbDto.sesameTypeStr || "") + '" data-channel="' + (full.dbDto.channel || "") + '" data-adviserRate="' + (full.dbDto.adviserRate || "") + '" data-valueDate="' + (full.dbDto.valueDate || "")+'" data-remark="' + (full.dbDto.remark || "") + '">编辑</a>';

            html += '<a href="javascript:void(0)" class="btn btn-warning btn-xs sortBtn" style="margin: 0 5px;" data-sesameCode="' + full.dbDto.sesameCode + '" data-showSequence="' + (full.dbDto.showSequence || "") + '">调整排序</a>';
            html += '<a href="javascript:void(0)" class="btn btn-danger btn-xs recBtn" style="margin: 0 5px;" data-sesameCode="' + full.dbDto.sesameCode + '" data-canRecommend="' + full.dbDto.canRecommend + '" data-showPosition="' + full.dbDto.showPosition + '">推荐</a>';
            html += '<a href="javascript:void(0)" class="btn btn-success btn-xs offBtn" style="margin: 0 5px;" data-sesameCode="' + full.dbDto.sesameCode + '" data-upAndDown="' + (full.dbDto.upAndDown == 0 ? "1" : "0") + '">' + (full.dbDto.upAndDown == 0 ? "下架" : "上架") + '</a>';
            html += '<a href="javascript:void(0)" class="btn ' +(full.dbDto.sesameStatus ==  4 ? "btn-default disabled" : "btn-info") + ' btn-xs sesameEnd" style="margin: 0 5px;" data-href="/sesameproduct/changeSesameProductStatusEnd.json?sesameCode=' + full.dbDto.sesameCode + '">募集结束</a>';
            return html;
        }),
        DTColumnBuilder.newColumn('dbDto.id').withTitle('资料管理').withOption('sWidth', '80px').renderWith(function(data, type, full) {
            return '<a href="#subject-informationBlank.html?sesameCode=' + full.dbDto.sesameCode + '&sesameName=' + encodeURIComponent(full.dbDto.sesameName) + '&id=' + full.dbDto.id + '" class="btn btn-danger btn-xs" style="margin: 0 5px;">资料管理</a>';
        })
    ];
    $scope.action.reset = function() {
        $('input[name="showPosition"]').val("").siblings("input").val("");
        $("#multi_select").find("input[type='checkbox']").prop("checked", false).uniform();

        for (var prop in $scope.form) {
            if (prop !== 'isShow') delete $scope.form[prop];
        };

        vm.dtInstance.rerender();
    };
    $scope.action.search = function() {
        vm.dtInstance.rerender();
    };

    //编辑 controller
    function editModalCtrl($scope, $timeout, $modalInstance, select, sesameType, sesameName, sesameCode,sesameSource, baseAdviserRate, floatAdviserRate, isCashBack, cashBackRule, remark, upAndDown, selfSupport, tools, seameQuota, surplusQuota, supportQuota,contractTemplateno,protocolPrefix,sesameTypeStr,valueDate,sesameMonth,channel) {
        $scope.form = {};
        $scope.select = {};
        $scope.channelUp={};
        //上架渠道1：理财师APP 2：投资人APP
        $scope.channelUp = {
            channelUp1:1,
            channelUp2:-1
        };

        //获取项目来源
        $.ajax({
            type: "post",
            url: siteVar.serverUrl + '/sesamesource/queryList.shtml',
            data: {},
            //contentType : "application/json",
            dataType:'json',
            success: function(res){
                tools.ajaxOpened(self);
                if(!tools.interceptor(res)) return;
                console.log(res);
                $scope.$applyAsync(function () {
                    $scope.select.sourceData=res.data;
                });
            },
            error: function(err){
                tools.ajaxOpened(self);
                tools.ajaxError(err);
            }
        });

        $scope.editShow=1;
        $scope.modalWindowShow=1;
        $scope.select.sesametypeenum = select.sesametypeenum.filter(function (item) {
            return item.key == 2 || item.key == 3 || item.key == 4;
        });
        $scope.form.sesameName = sesameName;
        if(sesameType == 2 || sesameType == 3 || sesameType == 4){
            $scope.form.sesameType = sesameType;
        }
        /*sesamecode*/
        $scope.form.sesameCode = sesameCode;
        $scope.form.contractTemplateno= (contractTemplateno=='null')?'':contractTemplateno;
        $scope.form.protocolPrefix=(protocolPrefix=='null')?'':protocolPrefix;
        $scope.isEditCon=$scope.form.contractTemplateno?true:false;
        $scope.isEditPro=$scope.form.protocolPrefix?true:false;
        $scope.form.sesameMonth = sesameMonth;
        $scope.form.sesameSource = sesameSource;
        $scope.form.baseAdviserRate = baseAdviserRate;
        $scope.form.floatAdviserRate = floatAdviserRate;
        $scope.form.isCashBack = isCashBack;
        $scope.form.cashBackRule = cashBackRule;
        $scope.form.valueDate=valueDate?valueDate:'';
        $scope.form.remark = remark;
        $scope.form.sesameType = sesameType;
        $scope.form.sesameTypeStr = sesameTypeStr;
        $scope.form.upAndDown = upAndDown; //上下架
        $scope.form.selfSupport = selfSupport; //是否自营募集规模
        $scope.form.supportQuota = supportQuota; //自营募集规模
        $scope.seameQuota = seameQuota; //募集规模
        $scope.surplusQuota = surplusQuota; //剩余额度
        $scope.isUpAndDown=supportQuota?true:false;
        $scope.form.channel=channel;
        $scope.$applyAsync(function () {
            if($scope.form.channel=='0'){
                $scope.channelUp.channelUp1=true;$scope.channelUp.channelUp2=true;
            }
            if($scope.form.channel=='1'){
                $scope.channelUp.channelUp1=false;$scope.channelUp.channelUp2=true;
            }
            if($scope.form.channel=='2'){
                $scope.channelUp.channelUp1=true;$scope.channelUp.channelUp2=false;
            }
        });


        //判断是否是类固收产品编辑框
        if($scope.form.sesameType&&$scope.form.sesameType!=1){
            $scope.editShow=0;
        }
        if (Number($scope.form.supportQuota)>=0 && $scope.form.selfSupport==2) {

           $scope.Capital_amount = tools.toChineseCharacters(Number($scope.form.supportQuota)); //大写金额
        }else{
            $scope.Capital_amount = "";
        }
        $scope.chooseUserType = function() {
            if ($scope.form.supportQuota>=0&&/^\d+$/.test($scope.form.supportQuota)) {
                $scope.Capital_amount = tools.toChineseCharacters($scope.form.supportQuota); //大写金额
            } else {
                $scope.Capital_amount = "自营募集规模需为正整数";
            }
        };

        $scope.checkSesameMonth = function() {
            if (! /^\d+$/.test($scope.form.sesameMonth)||Number($scope.form.sesameMonth)<=0) {
                return tools.interalert("投资期限为正整数");
            }
        };

        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.transToCHN = function(e) {
            var currentDom = $(e.currentTarget),
                value = currentDom.val();
            value = value.replace(/\D/g, "");
                ///^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value)
            var unit = "仟佰拾亿仟佰拾万仟佰拾元角分",
                str = "";
            value += "00";
            var point = value.indexOf('.');
            if (point >= 0) {
                value = value.substring(0, point) + value.substr(point + 1, 2);
            }
            unit = unit.substr(unit.length - value.length);
            for (var i = 0; i < value.length; i++) {
                str += '零壹贰叁肆伍陆柒捌玖'.charAt(value.charAt(i)) + unit.charAt(i);
            }
            $scope.form.supportQuotaCHN = str.replace(/零(仟|佰|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
        };

        //检测来源改变渠道选择对应发生变化
        //宜信普泽+海南交易所:理财师app和出借人app选项都可选
        $scope.$watch('form.sesameSource',  function(newValue, oldValue) {
            if(newValue!=1){
                $scope.channelUp.channelUp2=false;
                $timeout(function () {$(".channelBox input[type=checkbox]").uniform();},100);
                $timeout(function () {$('input.channelUp2').parent().removeClass('checked');},120);
            }else{
                $timeout(function () {$(".channelBox input[type=checkbox]").uniform();},100);
                $timeout(function () {
                    if(oldValue!=1){
                        $('input.channelUp2').parent().removeClass('checked');
                    }
                },120);
            }
        });


        $scope.ok = function() {
            console.log($scope.form.sesameSource);
            if (!$scope.form.sesameSource) {
                tools.interalert("请选择项目来源");
                return;
            }

            if ($scope.form.baseAdviserRate == undefined) {
                tools.interalert("请填写基础顾问费率");
                return false;
            } else {
                if (!/^\d+(?:\.\d{1,2})?$/.test($scope.form.baseAdviserRate)) {
                    $("#base").addClass("has-error");
                    tools.interalert("基础顾问费率需大于或等于0，且最多保留2位小数");
                    return;
                } else {
                    $("#base").removeClass("has-error");
                }
            }
            if (!/^\d+(?:\.\d{1,2})?$/.test($scope.form.floatAdviserRate)) {
                $("#floatAdviserRate").addClass("has-error")
                tools.interalert("浮动费率需大于或等于0，且最多保留2位小数");
                return;
            } else {
                $("#floatAdviserRate").removeClass("has-error");
            }

            if ($scope.form.isCashBack == "") {
                tools.interalert("请选择是否返现");
                return;
            }

            if ($scope.form.isCashBack == 1) {
                if (!$scope.form.cashBackRule) {
                    tools.interalert("请填写返现规则");
                    return;
                }
            }
            var base = Number($scope.form.baseAdviserRate);
            var floatnum = Number($scope.form.floatAdviserRate);
            if (base + floatnum > 10) {
                tools.interalert("基础顾问费率与浮动顾问费率之和不得大于10%");
                return;
            }

            if (!$scope.form.selfSupport) {
                return tools.interalert("请选择是否自营！")
            }else if($scope.form.selfSupport==2){

                if(! /^\d+$/.test($scope.form.supportQuota)||Number($scope.form.supportQuota)<0){
                   $scope.Capital_amount = "";
                    return tools.interalert("自营募集规模需为正整数")
                }
            }

            if ($scope.form.selfSupport == 2) {
                if (!$scope.form.supportQuota) {
                    return tools.interalert("请输入自营募集规模！")
                }

                if (Number($scope.form.supportQuota) > $scope.seameQuota) {
                    return tools.interalert("自营募集规模需小于等于产品募集规模！")
                }
            }

            //非类固收产品不展示投资期限/起息日/模板编号/合同前缀
            if($scope.form.sesameType&&$scope.form.sesameType==1){
                if (!$scope.form.sesameMonth) {
                    return tools.interalert("请填写投资期限！");
                } else if (! /^\d+$/.test($scope.form.sesameMonth)||Number($scope.form.sesameMonth)<=0) {
                    return tools.interalert("投资期限为正整数");
                }
                if ($scope.form.valueDate == "") {
                    tools.interalert("请填写起息日");
                    return;
                }

                if ($scope.form.protocolPrefix == "") {
                    tools.interalert("请填写合同编号前缀");
                    return;
                }
            }
            //提交上架渠道数据处理
            $scope.channelUp.channelArr=[];
            if($('.channelUp1').closest('span').hasClass('checked')){
                $scope.channelUp.channelArr.push($('.channelUp1').attr('value'));
            }
            if($('.channelUp2').closest('span').hasClass('checked')){
                $scope.channelUp.channelArr.push($('.channelUp2').attr('value'));
            }
            if(!$scope.channelUp.channelArr.length){
                return tools.interalert('请选择上架渠道');
            }
            if($scope.channelUp.channelArr.length==2){
                $scope.form.channel='0';
            }
            if($scope.channelUp.channelArr.length==1&&$scope.channelUp.channelArr[0]==1){
                $scope.form.channel='1';
            }
            if($scope.channelUp.channelArr.length==1&&$scope.channelUp.channelArr[0]==2){
                $scope.form.channel='2';
            }

            //补录确认信息弹窗
            var info=$scope.form;
            $scope.modalWindowShow=0;
            $scope.form.selfSupportOrNot=$scope.form.selfSupport==2?'是':'否';
            $scope.form.isCashBackOrNot=$scope.form.isCashBack==1?'是':'否';
            for(var key in $scope.select.sourceData){
                if($scope.select.sourceData[key].id==$scope.form.sesameSource){
                    $scope.form.sesameSourceWhere=$scope.select.sourceData[key].name;
                }
            }
            $scope.form.Capital_amount = tools.toChineseCharacters(Number($scope.form.supportQuota));
            $scope.closeConfirm = function() {
                //$modalInstance.close();
                $scope.modalWindowShow=1;
            };

            var submitFlag = true;
            $scope.okConfirm=function(){
                //编辑后提交
                if (submitFlag) {
                    submitFlag = false;
                    $.ajax({
                        type: "post",
                        url: siteVar.serverUrl + "/sesameproduct/editSesameProduct.json",
                        data: $scope.form,
                        dataType: "json",
                        success: function(data) {
                            submitFlag = true;
                            if (!tools.interceptor(data)) return;
                            if (data.success) {
                                //$scope.closeConfirm();
                                $scope.close();
                                $scope.modalWIndowShow=1;
                                tools.interalert("保存成功！");
                                vm.dtInstance.rerender();
                            } else {
                                $scope.closeConfirm();
                                tools.interalert(data.msg);
                            }
                        },
                        error: function(err) {
                            submitFlag = true;
                            tools.interalert("SERVER ERROR！");
                            tools.ajaxError(err);
                        }
                    })
                }
            };
        };
        $timeout(function() {
            $("#editModalForm").find('input[type="radio"]').uniform();
            $("input[type=checkbox], input[type=radio]").uniform();
        }, 0)
    }

    //排序 controller
    function sortModalCtrl($scope, $modalInstance, sesameCode, showSequence) {
        $scope.form = {};
        $scope.form.showSequence = showSequence;
        $scope.form.sesameCode = sesameCode;
        $scope.close = function() {
            $modalInstance.close();
        };
        var submitFlag = true;
        $scope.ok = function() {
            if ($scope.form.showSequence == showSequence) {
                return $modalInstance.close();
            };
            if (!(/^\d+$/).test($scope.form.showSequence)) {
                return alert("请输入数字")
            };
            if (submitFlag) {
                submitFlag = false;
                $.ajax({
                    type: "post",
                    url: siteVar.serverUrl + "/sesameproduct/sortSesameProduct.json",
                    data: $scope.form,
                    dataType: "json",
                    success: function(data) {
                        submitFlag = true;
                        if (!tools.interceptor(data)) return;
                        if (data.success) {
                            $scope.close();
                            alert("调整排序成功！");
                            vm.dtInstance.rerender();
                        } else {
                            alert(data.msg);
                        }

                    },
                    error: function(err) {
                        submitFlag = true;
                        tools.ajaxError(err);
                    }
                })
            }

        }
    }
    //推荐 controller
    function recommendModalCtrl($scope, $modalInstance, $timeout, sesameCode, canRecommend, showPosition, tools) {
        $scope.form = {};
        $scope.form.sesameCode = sesameCode;
        $scope.form.canRecommend = canRecommend;
        $scope.form.showPosition = showPosition;

        $scope.close = function() {
            $modalInstance.close();
        };
        $timeout(function() {
            $('.showPosition').multiSel({
                'data': [{
                    "text": "APP端",
                    "value": "0",
                    "default": (showPosition.indexOf("0") > -1 ? true : false)
                }, {
                    "text": "WAP端",
                    "value": "1",
                    "default": (showPosition.indexOf("1") > -1 ? true : false)
                }],
                "name": "showPosition"
            });
        }, 0);
        var submitFlag = true,
            data;


        $scope.ok = function() {
            data = tools.getFormele({}, $("#recommendForm"));
            if (submitFlag) {
                submitFlag = false;
                $.ajax({
                    type: "post",
                    url: siteVar.serverUrl + "/sesameproduct/recommendSesameProduct.json",
                    data: data,
                    dataType: "json",
                    success: function(data) {
                        submitFlag = true;
                        if (!tools.interceptor(data)) return;
                        if (data.success) {
                            $scope.close();
                            alert("修改成功！");
                            vm.dtInstance.rerender();
                        } else {
                            alert(data.msg);
                        }

                    },
                    error: function(err) {
                        submitFlag = true;
                        tools.ajaxError(err);
                    }
                })
            }

        }
    }
    //详情
    function infoDetailModalCtrl($scope, info, $modalInstance) {
        $scope.info = info;
        if(!info.contractTemplateno){info.contractTemplateno=''};
        info.minSubscribeAmt = tools.formatNumber(info.minSubscribeAmt);
        info.incSubscribeAmt = tools.formatNumber(info.incSubscribeAmt);
        info.planRaiseAmt = tools.formatNumber(info.planRaiseAmt);
        info.supportQuota = tools.formatNumber(info.supportQuota || 0);
        //info.adviserRate = (new Number(info.adviserRate)).mul(100)
        $scope.close = function() {
            $modalInstance.close();
        };
    }

    function fnDrawCallback() {
        tools.createModal();
        var popUpLayer = $("#js_dialog"),
            popUpLayerContent = popUpLayer.find(".js_content");

        $("#exportBtn").on("click", function() {
            var self = this;
            if (!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "get",
                url: siteVar.serverUrl + "/sesameproduct/exportSesameProductPage.json",
                dataType: "json",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        return tools.export(self)
                    } else {
                        return alert(data.msg);
                    }

                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })
        });

        //查看详细
        var table = $("#dataTables"),
            tbody = table.find("tbody");
        table.off("click").on("click", ".infoDetail", function() {
            var self = $(this),
                href = self.attr("data-href"),
                data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if (!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        var info = $.extend({}, data.data.dbDto, data.data.httpDto);
                        //console.log( data.dbDto)
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'infoDetailModal.html',
                            controller: infoDetailModalCtrl,
                            resolve: {
                                "info": function() {
                                    //console.log(info);
                                    return info;
                                }
                            }
                        });
                    } else {
                        alert(data.msg);
                    }

                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })
        });
        //更新产品
        table.on("click", ".updateData", function() {
            var self = $(this);
            if (!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "get",
                url: siteVar.serverUrl + '/sesameproduct/updateSesameProductPage.json',
                dataType: "json",
                success: function(data) {
                    tools.ajaxOpened(self);

                    if (!tools.interceptor(data)) return;
                    if (data.success) {

                        $.ajax({
                            type: "post",
                            url: siteVar.serverUrl + '/sesameproduct/updateSesameProduct.json',
                            dataType: "json",
                            data: {
                                "code": self.attr("data-code")
                            },
                            success: function(data) {

                                if (!tools.interceptor(data)) return;
                                if (data.success) {
                                    alert("更新成功！");
                                    vm.dtInstance.rerender();
                                } else {
                                    alert(data.msg)
                                }
                            },
                            error: function(err) {
                                tools.ajaxError(err);
                            }
                        });

                    } else {
                        alert(data.msg)
                    }
                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })
        });
        //编辑产品
        table.on("click", ".editBtn", function() {
            var self = $(this);
            if (!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "get",
                url: siteVar.serverUrl + '/sesameproduct/editSesameProductPage.json',
                dataType: "json",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'editModal.html',
                            controller: editModalCtrl,
                            windowClass: 'modal-640',
                            resolve: {
                                "select": function () {
                                    return $scope.select;
                                },
                                "sesameType":function () {
                                    return self.attr("data-sesameType")
                                },
                                "sesameTypeStr":function () {
                                    return self.attr("data-sesameTypeStr")
                                },
                                "sesameName": function() {
                                    return self.attr("data-sesameName");
                                },
                                "valueDate":function () {
                                    return self.attr("data-valueDate")
                                },
                                //项目编码 协议模板编号 合同模板前缀
                                "sesameCode": function() {
                                    return self.attr("data-sesameCode");
                                },
                                "contractTemplateno": function() {
                                    return self.attr("data-contractTemplateno");
                                },
                                "protocolPrefix": function() {
                                    return self.attr("data-protocolPrefix");
                                },
                                "sesameMonth": function() {
                                    return self.attr("data-sesameMonth");
                                },
                                "sesameSource": function() {
                                    return self.attr("data-sesameSource");
                                },
                                "baseAdviserRate": function() {
                                    return self.attr("data-baseAdviserRate");
                                },
                                "floatAdviserRate": function() {

                                    return self.attr("data-floatAdviserRate");
                                },
                                "isCashBack": function() {

                                    return self.attr("data-isCashBack");
                                },
                                "cashBackRule": function() {

                                    return self.attr("data-cashBackRule");
                                },
                                "remark": function() {

                                    return self.attr("data-remark");
                                },
                                "upAndDown": function() {
                                    return self.attr("data-upAndDown");
                                },
                                "selfSupport": function() {
                                    return self.attr("data-selfSupport"); //是否自营募集规模
                                },
                                "supportQuota": function() {
                                    return self.attr("data-supportQuota"); //自营募集规模
                                },
                                "seameQuota": function() {
                                    return self.attr("data-seameQuota") || 0; //募集规模
                                },
                                "surplusQuota": function() {
                                    return self.attr("data-surplusQuota") || 0; //剩余额度
                                },
                                "channel": function() {
                                    return self.attr("data-channel") || 0; //上架渠道
                                }
                            }
                        });
                    } else {
                        alert(data.msg)
                    }
                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })


        });
        table.on("click", ".sortBtn", function() {
            var self = $(this);
            if (!tools.ajaxLocked(self)) return;

            $.ajax({
                type: "get",
                url: siteVar.serverUrl + '/sesameproduct/sortSesameProductPage.json',
                dataType: "json",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'sortModal.html',
                            controller: sortModalCtrl,
                            windowClass: 'modal-640',
                            resolve: {
                                "sesameCode": function() {
                                    return self.attr("data-sesameCode");
                                },
                                "showSequence": function() {
                                    return self.attr("data-showSequence");
                                }
                            }
                        });
                    } else {
                        alert(data.msg)
                    }
                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })


        });
        table.on("click", ".recBtn", function() {
            var self = $(this);
            if (!tools.ajaxLocked(self)) return;

            $.ajax({
                type: "get",
                url: siteVar.serverUrl + '/sesameproduct/recommendSesameProductPage.json',
                dataType: "json",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        $modal.open({
                            backdrop: true,
                            backdropClick: true,
                            dialogFade: false,
                            keyboard: true,
                            templateUrl: 'recommendModal.html',
                            controller: recommendModalCtrl,
                            windowClass: 'modal-640',
                            resolve: {
                                "sesameCode": function() {
                                    return self.attr("data-sesameCode");
                                },
                                "canRecommend": function() {
                                    return self.attr("data-canRecommend");
                                },
                                "showPosition": function() {
                                    return self.attr("data-showPosition");
                                }
                            }
                        });
                    } else {
                        alert(data.msg)
                    }
                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })

        });
        table.on("click", ".offBtn", function() {
            var self = $(this),
                txt = self.html();
            if (!tools.ajaxLocked(self)) return;

            $.ajax({
                type: "get",
                url: siteVar.serverUrl + '/sesameproduct/upAndDownSesameProductPage.json',
                dataType: "json",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        if (!window.confirm("确认" + txt + "？")) {
                            return;
                        }

                        $.ajax({
                            type: "post",
                            url: siteVar.serverUrl + '/sesameproduct/upAndDownSesameProduct.json',
                            dataType: "json",
                            data: {
                                "sesameCode": self.attr("data-sesameCode"),
                                "upAndDown": self.attr("data-upAndDown")
                            },
                            success: function(data) {

                                if (!tools.interceptor(data)) return;
                                if (data.success) {
                                    alert("操作成功！");
                                    vm.dtInstance.rerender();
                                } else {
                                    /*后台返回控制*/
                                    alert(data.msg)
                                }
                            },
                            error: function(err) {
                                tools.ajaxError(err);
                            }
                        })
                    } else {
                        alert(data.msg)
                    }
                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })
        });
        //募集结束
        table.on("click", ".sesameEnd", function() {
            var self = $(this),
                href = self.attr("data-href"),
                data, url;
            data = tools.queryUrl(href);
            url = href.split('?')[0];
            if(!window.confirm("确定修改募集状态为 募集结束 ？")){
                return;
            }
            if (!tools.ajaxLocked(self)) return;
            $.ajax({
                type: "post",
                url: siteVar.serverUrl + url,
                data: data,
                dataType: "json",
                success: function(data) {
                    tools.ajaxOpened(self);
                    if (!tools.interceptor(data)) return;
                    if (data.success) {
                        self.removeClass("btn-info").addClass("btn-default disabled");
                        self.parents("tr").find(".sesameStatus").html("募集结束");
                    } else {
                        alert(data.msg);
                    }

                },
                error: function(err) {
                    tools.ajaxOpened(self);
                    tools.ajaxError403(err);
                }
            })
        });
    }
    (function() {
        $("#editModalForm input[name='baseAdviserRate']").Validator({
            hmsg: "请填写奖项名称",
            regexp: /^[\s|\S]{1,256}$/,
            showok: false,
            style: {
                placement: "top"
            },
            emsg: "奖项名称不能为空",
            rmsg: "奖项名称不合法"
        });
        $("#editModalForm input[name='introducer']").Validator({
            IsValidate: false,
            hmsg: "请填写活动说明",
            regexp: /^[\s|\S]{0,256}$/,
            showok: false,
            style: {
                placement: "top"
            },
            rmsg: "合法活动说明不合法"
        });

    })();
}