$.fn.modal = function (a) {
	if(a == "hide"){
		$("#wap_top_backup").stop().fadeOut(100);
		$(this).stop().hide();
	} else {
		$("#wap_top_backup").stop().fadeIn(100);
		$(this).css({"margin-top": -$(this).outerHeight()/2}).stop().show();
	}
};
/**
 * 显示提示消息
 * @param _msg
 * @param canClose
 */
function showTip(_msg,_callback){
	$("#wap_top_modal_tip").html(_msg);
	$("#wap_top_modal_tip").modal();
	$("#wap_top_backup").on("touchstart",function(){
		$("#wap_top_modal_tip").modal("hide");
		if(_callback){
			_callback.call();
		}
		return;
	});
}
/***
 * 隐藏提示消息
 */
function hideTip(){
	$("#wap_top_modal_tip").modal("hide");
}
/**
 * 隐藏导航
 */
function hideNav(){
	$("#header_nav_div").hide();
}
$(function(){
	$("#wap_header_menu").on("touchstart", function () {
		$("#header_nav_div").stop().slideToggle();
		return false;
	});
	
	$("#wap_header_menu").on("touchend", function () {
		return false;
	});

	$(document).on("touchend", function () {
		$("#header_nav_div").stop().slideUp();
	});
});

/**
 * 注册时跳转 显示提示消息 显示完2秒后自动跳转
 * @param _msg
 * @param canClose
 */
function showTipRegister(_msg,_callback){
	$("#wap_top_modal_tip").html(_msg);
	$("#wap_top_modal_tip").modal();
	
	setTimeout(function(){
		$("#wap_top_modal_tip").modal("hide");
		if(_callback){
			_callback.call();
		}
		return;
		},2000);
}