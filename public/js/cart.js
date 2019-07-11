(function($) {
  let cart = {};
  $("#updateButton").hide();
  $(document).ready(function() {
    $(".cartItem  input").change(function() {
      inputs = $(".quantityInput");
      inputs.each(function(input) {
        cart[inputs.eq(input).attr("id")] = parseFloat(inputs.eq(input).val());
      });
      $("#updateButton").show();
      let price = $("#totalPrice");
      let totalPrice = 0;
      for (let item in cart) {
        let itemPrice = $(`#${item}`).attr("price");
        totalPrice += cart[item] * itemPrice;
      }
      price.text(totalPrice);
    });
  });
})(jQuery);
