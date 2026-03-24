class PromoCode < ApplicationRecord
  has_many :orders, dependent: :nullify

  enum :discount_type, { percentage: 0, fixed: 1, free_shipping: 2 }

  validates :code, presence: true, uniqueness: { case_sensitive: false }
  validates :discount_type, presence: true
  validates :value, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  before_validation :upcase_code

  def valid_for_use?(cart_total = 0)
    return false unless active?
    return false if expires_at.present? && expires_at < Time.current
    return false if max_uses.present? && current_use_count >= max_uses
    return false if min_order_amount.present? && cart_total < min_order_amount

    true
  end

  private

  def upcase_code
    self.code = code&.upcase
  end
end
