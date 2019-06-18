var Login = function() {
    var handleLogin = function() {
        $('.login-form').validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            rules: {
                username: {
                    required: true
                },
                password: {
                    required: true
                },
                remember: {
                    required: false
                }
            },
            messages: {
                username: {
                    required: "用户名必填."
                },
                password: {
                    required: "密码必填."
                }
            },
            invalidHandler: function(event, validator) { //display error alert on form submit   
                $('.alert-danger', $('.login-form')).show();
            },
            highlight: function(element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').addClass('has-error'); // set error class to the control group
            },
            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },
            errorPlacement: function(error, element) {
                error.insertAfter(element.closest('.input-icon'));
            },
            submitHandler: function(form) {
                //form.submit(); // form validation success, call ajax form submit
                $.ajax({
                    url: '/user/login',
                    method: 'post',
                    data: {
                        username: $('input[name="username"]').val(),
                        password: $('input[name="password"]').val()
                    }
                }).then(function(data){
                    if(data.success){
                        var expiresDate= new Date();
                        expiresDate.setTime(expiresDate.getTime() + (24 * 60 * 60 * 1000));
                        $.cookie("userRole",data.userRole,{expires : expiresDate});
                        $.cookie("realName",data.realName,{expires : expiresDate});
                        $.cookie("year",data.year,{expires : expiresDate});
                        location.href = "index.html";
                    }else{
                        var dom = $('.alert-danger', $('.login-form'));
                        dom.find("span").html(data.msg);
                        dom.show();
                    }
                })
            }
        });
        $('.login-form input').keypress(function(e) {
            if (e.which == 13) {
                if ($('.login-form').validate().form()) {
                    $('.login-form').submit(); //form validation success, call ajax form submit
                }
                return false;
            }
        });
    }
    return {
        //main function to initiate the module
        init: function() {
            handleLogin();
        }

    };
}();