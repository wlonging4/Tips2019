!function(){var t={};this.tmpl=function a(e,n){var r=/\W/.test(e)?new Function("obj","var p=[]; var print=function(){p.push.apply(p,arguments)};with(obj){p.push('"+e.replace(/[\r\t\n]/g," ").split("<%").join("	").replace(/((^|%>)[^\t]*)'/g,"$1\r").replace(/\t=(.*?)%>/g,"',$1,'").split("	").join("');").split("%>").join("p.push('").split("\r").join("\\'")+"');}return p.join('');"):t[e]=t[e]||a(document.getElementById(e).innerHTML);return n?r(n):r}}();var cashRules={init:function(t){var a=this;a.replaceBox=t,a.loadData()},templateStr:"单笔提现最低<%= item.withdrawMinAmount%>元 ",ajaxUrl:"/mobile/trusteeship/queryTrusteeshipWithdrawParam.shtml",loadData:function(t){var a=this;$.ajax({url:a.ajaxUrl,type:"get",async:!0,cache:!1,dataType:"JSON",success:function(t){t.success&&(data=t.data,a.replaceBox.innerHTML=tmpl(a.templateStr,{item:data}))},error:function(t){}})}};window.onload=function(){var t=document.querySelector(".js_dataReplace");cashRules.init(t)};