$(document).ready(function () {

    $(".expand").on("click", function () {
        $(this).siblings(".hide").toggle();
        if($(this).hasClass("active")){
            $(this).removeClass("active");
        }else{
            $(this).addClass("active");
        }
    })
});