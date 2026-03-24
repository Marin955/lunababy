class Bundle < ApplicationRecord
  has_many :bundle_items, dependent: :destroy
  has_many :order_items, dependent: :restrict_with_error

  enum :badge, { new: 0, popular: 1, sale: 2 }, prefix: true

  validates :slug, presence: true, uniqueness: true
  validates :name_hr, presence: true
  validates :name_en, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  scope :active, -> { where(active: true) }
  scope :in_stock, -> { where(active: true).where('stock_quantity > 0') }

  def in_stock?
    stock_quantity > 0 && active
  end
end
