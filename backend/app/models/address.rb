class Address < ApplicationRecord
  belongs_to :user

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :street, presence: true
  validates :city, presence: true
  validates :postal_code, presence: true

  before_save :clear_other_defaults, if: :is_default?

  private

  def clear_other_defaults
    user.addresses.where.not(id: id).where(is_default: true).update_all(is_default: false)
  end
end
