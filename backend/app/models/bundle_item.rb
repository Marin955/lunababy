class BundleItem < ApplicationRecord
  belongs_to :bundle
  belongs_to :product

  validates :quantity, presence: true, numericality: { greater_than_or_equal_to: 1 }

  default_scope { order(:position) }
end
