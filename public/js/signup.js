(function($) {
  let form = $(".server-form");
  let errorDiv = $(".error");
  // console.log(errorDiv);
  errorDiv.hide();

  form.submit(function(event) {
    errorDiv.empty();
    let $inputs = $(".form-group :input");
    values = {};
    errors = [];
    $inputs.each(function() {
      values[this.name] = $(this).val();
    });
    if (values.firstName == "") {
      errors.push("First Name must have a value.");
    }
    if (values.lastName == "") {
      errors.push("Last Name must have a value.");
    }
    if (values.username == "") {
      errors.push("Username must have a value.");
    }
    if (values.email == "") {
      errors.push("Emial must have a value.");
    }
    if (values.password.length < 6) {
      errors.push(
        "Password must have a value and must be at least 6 characters long"
      );
    }
    if (values.address == "") {
      errors.push("Address must have a value.");
    }
    if (values.city == "") {
      errors.push("City  must have a value.");
    }
    if (values.zip == "") {
      errors.push("Zip Code must have a value.");
    }
    //console.log(errors);
    if (errors.length > 0) {
      errorDiv.show();
      event.preventDefault();
      errorDiv.show();
      let ul = "<ul class='errorList'> </ul>";
      errorDiv.append("<h6>Errors:</h6>");
      errorDiv.append(ul);
      let errorList = $(".errorList");

      for (let i = 0; i < errors.length; i++) {
        let li = "<li class='errorItem'>" + errors[i] + "</li>";
        errorList.append(li);
      }
      errorDiv.append(errorList);
    } else {
      this.submit();
    }
  });
})(jQuery);
