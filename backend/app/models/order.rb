class Order < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :shipping_method
  belongs_to :promo_code, optional: true

  has_many :order_items, dependent: :destroy
  has_one :shipment, dependent: :destroy
  has_many :order_status_transitions, dependent: :destroy

  enum :status, {
    pending: 0,
    confirmed: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: 5,
    refunded: 6
  }

  enum :language, { hr: 0, en: 1 }

  validates :order_number, presence: true, uniqueness: true
  validates :customer_email, presence: true
  validates :customer_name, presence: true
  validates :shipping_first_name, presence: true
  validates :shipping_last_name, presence: true
  validates :shipping_street, presence: true
  validates :shipping_city, presence: true
  validates :shipping_postal_code, presence: true
  validates :subtotal, presence: true
  validates :shipping_cost, presence: true
  validates :total, presence: true

  before_validation :generate_order_number, on: :create, unless: :order_number?

  private

  def generate_order_number
    date_part = Time.current.strftime('%Y%m%d')
    random_part = SecureRandom.alphanumeric(5).upcase
    self.order_number = "LB-#{date_part}-#{random_part}"
  end
end
