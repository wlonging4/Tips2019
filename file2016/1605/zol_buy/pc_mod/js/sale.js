$(function(){
	var tab1=$(".sale-tab-morning");
	var tab2=$(".sale-tab-afternoon");
	var tab3=$(".sale-tab-evening");
	var status=$(".sale-status");

	tab2.click(function(){
		status.removeClass("sale-status3").removeClass("sale-status1").addClass("sale-status2");
	})

	tab3.click(function(){
		status.removeClass("sale-status1").removeClass("sale-status2").addClass("sale-status3");
	})

	tab1.click(function(){
		status.removeClass("sale-status3").removeClass("sale-status2").addClass("sale-status1");
	})
})