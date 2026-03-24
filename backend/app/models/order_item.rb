class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :bundle

  validates :bundle_name, presence: true
  validates :quantity, presence: true, numericality: { in: 1..10 }
  validates :unit_price, presence: true
  validates :line_total, presence: true
end
