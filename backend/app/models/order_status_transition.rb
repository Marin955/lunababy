class OrderStatusTransition < ApplicationRecord
  belongs_to :order

  enum :from_status, {
    pending: 0, confirmed: 1, processing: 2, shipped: 3,
    delivered: 4, cancelled: 5, refunded: 6
  }, prefix: true

  enum :to_status, {
    pending: 0, confirmed: 1, processing: 2, shipped: 3,
    delivered: 4, cancelled: 5, refunded: 6
  }, prefix: true

  validates :to_status, presence: true
end
