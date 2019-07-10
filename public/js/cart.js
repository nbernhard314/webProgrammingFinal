(function($) {
  let cart = {};
  $(document).ready(function() {
    $(".cartItem  input").change(function() {
      inputs = $(".quantityInput");
      inputs.each(function(input) {
        cart[inputs.eq(input).attr("id")] = parseFloat(inputs.eq(input).val());
      });
      let price = $("#totalPrice");
      let totalPrice = 0;
      for (let item in cart) {
        let itemPrice = $(`#${item}`).attr("price");
        totalPrice += cart[item] * itemPrice;
      }
      console.log(totalPrice);
      price.text(totalPrice);
    });
  });
  let updateButton = $("#updateCart");
  updateButton.submit(function(event) {
    event.preventDefault();
  });
})(jQuery);
