class BundlePriceChange < ApplicationRecord
  belongs_to :bundle

  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
end
