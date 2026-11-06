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

  # Catalog attributes shown on the product page. The owner fills them in through
  # the admin panel. Blank values are stored as NULL so the storefront hides them.
  CATALOG_TEXT_ATTRIBUTES = %i[
    brand dimensions material_hr material_en age_range_hr age_range_en
    care_instructions_hr care_instructions_en
  ].freeze

  normalizes(*CATALOG_TEXT_ATTRIBUTES, with: ->(value) { value.strip.presence })
  normalizes :certifications, with: ->(values) { Array(values).map { |v| v.to_s.strip }.reject(&:blank?).uniq }

  # Returns the HR or EN column of a localized attribute, e.g. localized(:material, "en").
  def localized(attribute, locale)
    public_send(locale.to_s == "en" ? "#{attribute}_en" : "#{attribute}_hr")
  end
end
