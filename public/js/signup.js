(function($) {
  let form = $(".server-form");
  let errorDiv = $(".error");
  console.log(form);

  form.submit(function(event) {
    console.log("submit");
    event.preventDefault();
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
      errors.push("Address Name must have a value.");
    }
    if (values.city == "") {
      errors.push("City Name must have a value.");
    }
    if (values.zip == "") {
      errors.push("Zip Code Name must have a value.");
    }
    console.log(errors);
    //Errors get added. Will fix
    if (errors.length > 0) {
      let ul = "<ul class='errorList'> </ul>";
      errorDiv.append("<h4>Errors:</h6>");
      errorDiv.append(ul);
      let errorList = $(".errorList");

      for (let i = 0; i < errors.length; i++) {
        let li = "<li>" + errors[i] + "</li>";
        errorList.append(li);
      }
    }
  });
})(jQuery);
