$(document).ready(function(){!function(){if(0!=$("#subscribe").length){var a=$("#applyName").val()||"",e=$("#applyMobile").val()||"",l="";if(e.length>0)for(var t=0;11>t;t++)l+=t>2&&7>t?"*":e.charAt(t);var o=!0,n=new ModalAppointment({title:"立即预约",tips:"预约后星火工作人员会联系您",name:a,phonenum:l,openBtn:"subscribe",openfn:function(){var e=$("#dialog-applyName"),t=$("#dialog-applyMobile"),o=$(".dialogBox"),n=o.find(".errorInfo");e.val(a),t.val(l),n.html("")},callback:function(){var a=$("#dialog-applyName"),t=$("#dialog-applyMobile"),i=$(".dialogBox"),r=i.find(".errorInfo");if(!a.val())return r.html("请输入姓名"),a.focus();if(r.html(""),!/^[\u4E00-\u9FA5\u00B7]+$/.test(a.val()))return r.html("请输入中文名"),a.focus();if(r.html(""),!t.val())return r.html("请输入合法手机号"),t.focus();if(t.val()==l)r.html("");else{if(!/^1[34578]\d{9}$/.test(t.val()))return r.html("请输入合法手机号"),t.focus();r.html("")}document.activeElement.blur();var p={managerid:$("#managerid").val(),managerName:$("#managerName").val(),applyType:$("#applyType").val(),subjectId:$("#subjectId").val(),applyName:a.val(),applyMobile:t.val()&&t.val()==l?e:t.val()};o&&(o=!1,$.ajax({url:"/mobile/oneStopService/reservation.json",type:"POST",data:p,dataType:"json",success:function(a){o=!0,n.close(),n.openTips(a.data?"预约成功":a.msg);var e=setTimeout(function(){n.closeTips(),clearTimeout(e)},2e3)},error:function(){o=!0}}))}})}}(),function(){if(0!=$("#submitOrder").length){var a=$("#applyName").val()||"",e=$("#applyMobile").val()||"",l="";if(e.length>0)for(var t=0;11>t;t++)l+=t>2&&7>t?"*":e.charAt(t);var o=!0,n=new ModalAppointment({title:"立即报名",tips:"报名后星火工作人员会联系您",name:a,phonenum:l,openBtn:"submitOrder",openfn:function(){var e=$("#dialog-applyName"),t=$("#dialog-applyMobile"),o=$(".dialogBox"),n=o.find(".errorInfo");e.val(a),t.val(l),n.html("")},callback:function(){var a=$("#dialog-applyName"),t=$("#dialog-applyMobile"),i=$(".dialogBox"),r=i.find(".errorInfo");if(!a.val())return r.html("请输入姓名"),a.focus();if(r.html(""),!/^[\u4E00-\u9FA5\u00B7]+$/.test(a.val()))return r.html("请输入中文名"),a.focus();if(r.html(""),!t.val())return r.html("请输入合法手机号"),t.focus();if(t.val()==l)r.html("");else{if(!/^1[34578]\d{9}$/.test(t.val()))return r.html("请输入合法手机号"),t.focus();r.html("")}document.activeElement.blur();var p={managerid:$("#managerid").val(),managerName:$("#managerName").val(),applyType:$("#applyType").val(),subjectId:$("#subjectId").val(),applyName:a.val(),applyMobile:t.val()&&t.val()==l?e:t.val()};o&&(o=!1,$.ajax({url:"/mobile/oneStopService/reservation.json",type:"POST",data:p,dataType:"json",success:function(a){o=!0,n.close(),n.openTips(a.data?"报名成功":a.msg);var e=setTimeout(function(){n.closeTips(),clearTimeout(e)},2e3)},error:function(){o=!0}}))}})}}()});