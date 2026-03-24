class BundleItem < ApplicationRecord
  belongs_to :bundle

  validates :name_hr, presence: true
  validates :name_en, presence: true
  validates :quantity, presence: true, numericality: { greater_than_or_equal_to: 1 }

  default_scope { order(:position) }
end
