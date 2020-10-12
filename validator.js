function Validator(formSelector) {
    var form = this;
    var formRules = {};
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function (value) {
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`;
            };
        }
    }
    var formElement = document.querySelector(formSelector);
    if (formElement) {
        let inputElements = formElement.querySelectorAll('[name][rules]');
        validate(inputElements);

    }

    formElement.onsubmit = function (event) {
        let inputElements = formElement.querySelectorAll('[name][rules]');
        event.preventDefault();
        var hasError = false;
        for (let input of inputElements) {
            if (handleValidate({ target: input }))
                hasError = true;

        }
        let data;

        if (!hasError) {
            data = Array.from(inputElements).reduce(function (values, input) {
                values[input.name] = input.value;
                return values;
            }, {});
            if (typeof form.onSubmit === 'function') {
                form.onSubmit(data);
            }
            else {
                formElement.submit();
            }
        }

    }

    function validate(inputElements) {
        for (const input of inputElements) {
            var rules = input.getAttribute('rules').split('|');
            for (var rule of rules) {
                var ruleHasValue = rule.includes(':');
                var ruleInfo;

                if (ruleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }

                // 1. rule có giá trị
                // 2. chạy rule đó lấy ra function return
                // vd : min (min){ return function(value){}}
                // min(6) => trả về 1 function -> min(6)  là function nhận argument là value <=> min(value) 
                // 3. gán lại min vào formRules;

                var ruleFunc = validatorRules[rule];
                if (ruleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }
            // Lắng nghe sự kiện để validate eg : (blur || change)
            input.onblur = handleValidate;
            input.oninput = function () {
                removeError(input);
            }

        }

    }
    function handleValidate(event) {
        var errorMessage;
        var rules = formRules[event.target.name];
        for (var rule of rules) {
            errorMessage = rule(event.target.value);
            if (errorMessage)
                break;
        }

        if (errorMessage) {
            displayError(event.target, errorMessage);
        }
        else {
            removeError(event.target);
        }
        return errorMessage;

    }
    function displayError(inputElement, message) {
        var formGroupElement = getParentElement(inputElement);
        var formMessageElement = formGroupElement.querySelector('.form-message');
        formMessageElement.innerText = message;
        formGroupElement.classList.add('error');
    }
    function removeError(inputElement) {
        var formGroupElement = getParentElement(inputElement);
        formGroupElement.classList.remove('error');
    }
    function getParentElement(element) {
        while (element.parentElement) {
            if (element.parentElement.classList.value.indexOf('form-group') > -1) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
}