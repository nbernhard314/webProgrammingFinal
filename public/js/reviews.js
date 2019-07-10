(function($) {
  let review = $("#reviewform");
  let errorDiv = $(".error");
  errorDiv.hide();

  review.submit(function(event) {
    let $inputs = $(".form-group :input");
    errorDiv.empty();
    values = {};
    errors = [];
    $inputs.each(function() {
      values[this.name] = $(this).val();
    });
    if (values.title == "") {
      errors.push("Title must have a value.");
    }
    if (
      !parseFloat(values.rating) ||
      parseFloat(values.rating) < 0 ||
      parseFloat(values.rating) > 5
    ) {
      errors.push("Rating must have a value and be between 0 and 5.");
    }
    if (values.comment == "") {
      errors.push("comment must have a value.");
    }
    console.log(errors);
    if (errors.length > 0) {
      errorDiv.show();
      event.preventDefault();
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
