class Product < ApplicationRecord
  has_many :bundle_items, dependent: :destroy
  has_many :bundles, through: :bundle_items

  enum :sex, { unisex: 0, female: 1, male: 2 }, prefix: true

  validates :name_hr, presence: true
  validates :name_en, presence: true
  validates :stock_quantity, numericality: { greater_than_or_equal_to: 0 }
  validates :purchase_price, numericality: { greater_than_or_equal_to: 0 }
  validates :purchase_price_with_vat, numericality: { greater_than_or_equal_to: 0 }
  validates :msrp, numericality: { greater_than_or_equal_to: 0 }
  validates :low_stock_threshold, numericality: { greater_than_or_equal_to: 0 }
  validates :sku, uniqueness: true, allow_nil: true

  scope :active, -> { where(active: true) }
  scope :low_stock, -> { where("stock_quantity <= low_stock_threshold") }
  scope :ordered, -> { order(:position) }
end
