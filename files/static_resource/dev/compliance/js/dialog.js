var dialog={
	show:function(){
		$(".dialogBox").show();
		$('.ovrly').show();
	},
	hide:function(){
		$(".dialogBox").hide();
		$('.ovrly').hide();
	}
}
$(document).ready(function(){
	$(".closeBtn").click(function(){dialog.hide()});
	$(".btnBox a").click(function(){dialog.show()});
})
