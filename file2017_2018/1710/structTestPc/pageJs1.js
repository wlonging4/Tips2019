/**
 * Created by Moker on 2017/10/20.
 */
$(function(){
    var featuresBox = $('#features-edit-box').get(0);
    !(function(featuresBox){
        var html = '<div class="modal-dialog modal-sm" role="document">\
                <div class="modal-content">\
                    <div class="modal-header">\
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">\u00d7</span></button>\
                        <h4 class="modal-title" >\u6807\u7b7e</h4>\
                    </div>\
                    <div class="modal-body">\
                        <div class="form-inline">\
                            <input type="text" class="form-control" placeholder="\u8bf7\u586b\u5199\u5173\u952e\u8bcd">\
                            <input type="button" class="btn btn-primary" id="update-tag" value="\u63d0\u4ea4">\
                        </div>\
                    </div>\
                </div>\
            </div>';
        if(!featuresBox){
            featuresBox = $('<div>',{
                id:'features-edit-box',
                class:'modal fade',
                role:'dialog',
                tabindex:"-1",
                html:html
            }).appendTo('body').get(0);
        }else {
            $(featuresBox).html(html)
        }
    })(featuresBox);


    $('#add-tag-btn').on('click',function(){
        featuresBox.editId = null;
        $('#features-edit-box').find('[type="text"]').val('');
    }).parent().delegate('.phone-features','click',function(){
        featuresBox.editId = $(this).data('id');
        $(featuresBox).find('input[type="text"]').val($(this).text())
        $(featuresBox).modal();
    });
    $(featuresBox).delegate('.btn-primary','click',function(){
        var val = $(featuresBox).find('input[type="text"]').val();
        var data = {
            pro_line_id:pro_line_id,
            action:'special',
            LabelName:val
        };
        featuresBox.editId != null && (data.id = featuresBox.editId);
        $.ajax({
            url:'http://wangxs.admin.wap.zol.com.cn/doc/structured/ajax/struProEdit.php',
            data:data,
            dataType:'json',
            success:function(request){
                if(request.state == '1'){
                    if(featuresBox.editId != null){
                        $('#add-tag-btn').siblings('[data-id="' + featuresBox.editId + '"]').text(val);
                    }else {
                        $('<span>',{
                            'data-id':request.insertId,
                            'class':'btn btn-default phone-features',
                            'text':$(featuresBox).find('input[type="text"]').val()
                        }).insertBefore('#add-tag-btn');
                    }
                    $(featuresBox).modal('hide');
                }else {
                    alert(request.mes);
                };
            }
        })
    });

    !(function($form){
        var $list = $('#screenList');
        $form.on('submit',function(e){
            e.preventDefault();
            var flag = true,
                errText = '',
                data = {
                    pro_line_id:pro_line_id,
                    action:'screen',
                    del:'0'
                };
            $(this).find('[name]').each(function(index,input){
                if(!this.value){
                    flag = false;
                    errText = errText ? errText + ',' + this.title : errText + this.title;
                }else {
                    data[$(this).attr('name')] = $(this).val();
                }
            });
            if(!flag){
                alert(errText + '\u4e0d\u80fd\u4e3a\u7a7a');
                return;
            }
            $form.editId && (data.id = $form.editId);
            $.ajax({
                url:'http://wangxs.admin.wap.zol.com.cn/doc/structured/ajax/struProEdit.php',
                data:data,
                dataType:'json',
                success:function(request){
                    if(request.state == 1){
                        if($form.editId != null){
                            $list.find('[data-id="' + $form.editId + '"]').find('td').eq(0).text(data.screenProId).end()
                                .eq(1).text(data.mobMode).end()
                                .eq(2).text(data.maxBright).end()
                                .eq(3).text(data.colorTemp).end()
                                .eq(4).text(data.colorField).end()
                            $form.editId = null;
                        }else {
                            $list.find('tbody').html(function(index,html){
                                return html + '<tr data-id="' + request.insertId + '">\
                                    <td>' + data.screenProId + '</td>\
                                    <td>' + data.mobMode + '</td>\
                                    <td>' + data.maxBright + '</td>\
                                    <td>' + data.colorTemp + '</td>\
                                    <td>' + data.colorField + '</td>\
                                    <td>\
                                        <div class="form-inline">\
                                            <button type="button" class="btn btn-primary btn-sm edit">\u4fee\u6539</button>\
                                            <button type="button" class="btn btn-danger btn-sm del">\u5220\u9664</button>\
                                        </div>\
                                    </td>\
                                </tr>'
                            });
                        }
                        $form.get(0).reset();
                    }else {
                        alert(request.mes);
                    }
                }
            });
        });
        // 鍒犻櫎
        $list.delegate('.del','click',function(){
            var id = $(this).closest('tr').data('id');
            $.ajax({
                url:'http://wangxs.admin.wap.zol.com.cn/doc/structured/ajax/struProEdit.php',
                data:{
                    pro_line_id:pro_line_id,
                    action:'screen',
                    del:1,
                    id:id
                },
                dataType:'json',
                success:function(request){
                    if(request.state == 1){
                        $list.find('[data-id="' + id + '"]').remove();
                    }else {
                        alert(request.mes);
                    };
                }
            })
        });
        // 缂栬緫
        $list.delegate('.edit','click',function(){
            var $tr = $(this).closest('tr');
            $form.editId = $tr.data('id');
            $form.get(0).scrollIntoView();
            $form.find('[name="screenProId"]').val($tr.find('td').eq(0).text());
            $form.find('[name="mobMode"]').val($tr.find('td').eq(1).text());
            $form.find('[name="maxBright"]').val($tr.find('td').eq(2).text());
            $form.find('[name="colorTemp"]').val($tr.find('td').eq(3).text());
            $form.find('[name="colorField"]').val($tr.find('td').eq(4).text());
        });
    })($('#screenForm'));

    // 鎵嬫満鎬ц兘
    !(function($form){
        var $list = $('#gameList');
        $form.on('submit',function(e){
            e.preventDefault();
            var flag = true,
                errText = '',
                data = {
                    pro_line_id:pro_line_id,
                    action:'perform',
                    del:'0'
                };
            $(this).find('[name]').each(function(index,input){
                if(!this.value){
                    flag = false;
                    errText = errText ? errText + ',' + this.title : errText + this.title;
                }else {
                    data[$(this).attr('name')] = $(this).val();
                }
            });
            if(!flag){
                alert(errText + '\u4e0d\u80fd\u4e3a\u7a7a');
                return;
            }
            $form.editId && (data.id = $form.editId);
            $.ajax({
                url:'http://wangxs.admin.wap.zol.com.cn/doc/structured/ajax/struProEdit.php',
                data:data,
                dataType:'json',
                success:function(request){
                    if(request.state == 1){
                        if($form.editId != null){
                            $list.find('[data-id="' + $form.editId + '"]').find('td').eq(0).text(data.gameName).end().eq(1).text(data.runDemand);
                            $form.editId = null;
                        }else {
                            $list.find('tbody').html(function(index,html){
                                return html + '<tr data-id="' + request.insertId + '">\
                                    <td>' + data.gameName + '</td>\
                                    <td>' + data.runDemand + '</td>\
                                    <td>\
                                        <div class="form-inline">\
                                            <button type="button" class="btn btn-primary btn-sm edit">\u4fee\u6539</button>\
                                            <button type="button" class="btn btn-danger btn-sm del">\u5220\u9664</button>\
                                        </div>\
                                    </td>\
                                </tr>'
                            });
                        }
                        $form.get(0).reset();
                    }else {
                        alert(request.mes);
                    };
                }
            })
        })
        // 鍒犻櫎
        $list.delegate('.del','click',function(){
            var id = $(this).closest('tr').data('id');
            $.ajax({
                url:'http://wangxs.admin.wap.zol.com.cn/doc/structured/ajax/struProEdit.php',
                data:{
                    pro_line_id:pro_line_id,
                    action:'perform',
                    del:1,
                    id:id
                },
                dataType:'json',
                success:function(request){
                    if(request.state == 1){
                        $list.find('[data-id="' + id + '"]').remove();
                    }else {
                        alert(request.mes);
                    };
                }
            })
        });
        // 缂栬緫
        $list.delegate('.edit','click',function(){
            var $tr = $(this).closest('tr');
            $form.editId = $tr.data('id');
            $form.get(0).scrollIntoView();
            $form.find('[name="gameName"]').val($tr.find('td').eq(0).text())
            $form.find('[name="runDemand"]').val($tr.find('td').eq(1).text())
        })
    })($('#gameForm'));

    // 璺戝垎鏈哄瀷
    !(function($form){
        var $list = $('#phoneList');
        $form.on('submit',function(e){
            e.preventDefault();
            var flag = true,
                errText = '',
                data = {
                    pro_line_id:pro_line_id,
                    action:'modelRunScore',
                    del:'0'
                };
            $(this).find('[name]').each(function(index,input){
                if(!this.value){
                    flag = false;
                    errText = errText ? errText + ',' + this.title : errText + this.title;
                }else {
                    data[$(this).attr('name')] = $(this).val();
                }
            });
            if(!flag){
                alert(errText + '\u4e0d\u80fd\u4e3a\u7a7a');
                return;
            }
            $form.editId && (data.id = $form.editId);
            $.ajax({
                url:'http://wangxs.admin.wap.zol.com.cn/doc/structured/ajax/struProEdit.php',
                data:data,
                dataType:'json',
                success:function(request){
                    if(request.state == 1){
                        if($form.editId != null){
                            $list.find('[data-id="' + $form.editId + '"]').find('td').eq(0).text(data.runModelName).end().eq(1).text(data.runModelId);
                            $form.editId = null;
                        }else {
                            $list.find('tbody').html(function(index,html){
                                return html + '<tr data-id="' + request.insertId + '">\
                                    <td>' + data.runModelName + '</td>\
                                    <td>' + data.runModelId + '</td>\
                                    <td>\
                                        <div class="form-inline">\
                                            <button type="button" class="btn btn-primary btn-sm edit">\u4fee\u6539</button>\
                                            <button type="button" class="btn btn-danger btn-sm del">\u5220\u9664</button>\
                                        </div>\
                                    </td>\
                                </tr>'
                            });
                        }
                        $form.get(0).reset();
                    }else {
                        alert(request.mes);
                    };
                }
            })
        })
        // 鍒犻櫎
        $list.delegate('.del','click',function(){
            var id = $(this).closest('tr').data('id');
            $.ajax({
                url:'http://wangxs.admin.wap.zol.com.cn/doc/structured/ajax/struProEdit.php',
                data:{
                    pro_line_id:pro_line_id,
                    action:'modelRunScore',
                    del:1,
                    id:id
                },
                dataType:'json',
                success:function(request){
                    if(request.state == 1){
                        $list.find('[data-id="' + id + '"]').remove();
                    }else {
                        alert(request.mes);
                    };
                }
            })
        });
        // 缂栬緫
        $list.delegate('.edit','click',function(){
            var $tr = $(this).closest('tr');
            $form.editId = $tr.data('id');
            $form.get(0).scrollIntoView();
            $form.find('[name="runModelName"]').val($tr.find('td').eq(0).text())
            $form.find('[name="runModelId"]').val($tr.find('td').eq(1).text())
        })
    })($('#runModelForm'));

    // 璺戝垎鏈哄瀷
    !(function($form){

        $form.on('submit',function(e){
            e.preventDefault();
            var flag = true,
                errText = '',
                data = {
                    pro_line_id:pro_line_id,
                    action:'scoreBasis',
                    del:'0'
                };
            $(this).find('[name]').each(function(index,input){
                if(!this.value){
                    flag = false;
                    errText = errText ? errText + ',' + this.title : errText + this.title;
                }else {
                    data[$(this).attr('name')] = $(this).val();
                }
            });
            if(!flag){
                alert(errText + '\u4e0d\u80fd\u4e3a\u7a7a');
                return;
            }
            $form.editId && (data.id = $form.editId);
            $.ajax({
                url:'http://wangxs.admin.wap.zol.com.cn/doc/structured/ajax/struProEdit.php',
                data:data,
                dataType:'json',
                success:function(request){
                    if (request.state == 1) {
                        alert('\u63d0\u4ea4\u6210\u529f~');
                    }else {
                        alert(request.mes);
                    };
                }
            })
        })

    })($('#scoreBasis'));
});
