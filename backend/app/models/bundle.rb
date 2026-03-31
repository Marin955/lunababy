class Bundle < ApplicationRecord
  has_many :bundle_items, dependent: :destroy
  has_many :products, through: :bundle_items
  has_many :order_items, dependent: :restrict_with_error

  enum :badge, { new: 0, popular: 1, sale: 2 }, prefix: true

  validates :slug, presence: true, uniqueness: true
  validates :name_hr, presence: true
  validates :name_en, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :discount_percent, numericality: { in: 0..100 }

  before_validation :apply_discount

  scope :active, -> { where(active: true) }

  def computed_stock_quantity
    items = bundle_items.includes(:product).to_a
    return 0 if items.empty?

    items.map { |bi| bi.product.stock_quantity / bi.quantity }.min
  end

  def in_stock?
    active && computed_stock_quantity > 0
  end

  private

  def apply_discount
    return unless discount_percent_changed? || original_price_changed?

    if discount_percent > 0
      self.original_price ||= price
      self.price = (original_price * (100 - discount_percent) / 100.0).round
    elsif discount_percent_changed? && discount_percent.zero? && original_price.present?
      self.price = original_price
      self.original_price = nil
    end
  end
end
