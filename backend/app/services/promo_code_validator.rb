class PromoCodeValidator
  attr_reader :code, :cart_total, :locale

  # cart_total is in cents
  def initialize(code:, cart_total:, locale: "hr")
    @code = code&.upcase
    @cart_total = cart_total.to_i
    @locale = locale
  end

  def validate
    promo = PromoCode.find_by(code: code)

    return invalid_result("Promo code not found") unless promo
    return invalid_result("Promo code is not active") unless promo.active?
    return invalid_result("Promo code has expired") if promo.expires_at.present? && promo.expires_at < Time.current
    return invalid_result("Promo code usage limit reached") if promo.max_uses.present? && promo.current_use_count >= promo.max_uses
    return invalid_result("Minimum order amount not met") if promo.min_order_amount.present? && cart_total < promo.min_order_amount

    {
      code: promo.code,
      valid: true,
      discount_type: promo.discount_type,
      value: promo.value,
      discount_amount: calculate_discount(promo),
      label: locale == "en" ? promo.label_en : promo.label_hr
    }
  end

  private

  def invalid_result(reason)
    { code: code, valid: false, reason: reason }
  end

  def calculate_discount(promo)
    case promo.discount_type
    when "percentage"
      (cart_total * promo.value / 100.0).round
    when "fixed"
      [ promo.value, cart_total ].min
    when "free_shipping"
      0
    end
  end
end
