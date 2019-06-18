$(function(){
	var tab1=$(".w-sale-tab-morning");
	var tab2=$(".w-sale-tab-afternoon");
	var tab3=$(".w-sale-tab-evening");
	var status=$(".w-sale-selection");

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