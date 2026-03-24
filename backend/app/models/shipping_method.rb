class ShippingMethod < ApplicationRecord
  has_many :orders, dependent: :restrict_with_error

  validates :slug, presence: true, uniqueness: true
  validates :name_hr, presence: true
  validates :name_en, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  scope :active, -> { where(active: true).order(:position) }
end
