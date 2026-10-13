# A message from the website contact form. Not persisted: it is emailed to the shop inbox.
class ContactMessage
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :name, :string
  attribute :email, :string
  attribute :subject, :string
  attribute :message, :string
  attribute :language, :string, default: "hr"

  validates :name, presence: true, length: { maximum: 100 }
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }, length: { maximum: 255 }
  validates :subject, presence: true, length: { maximum: 200 }
  validates :message, presence: true, length: { maximum: 5000 }

  # Header-bound fields must stay single-line.
  def name = super&.squish
  def subject = super&.squish
  def email = super&.strip
end
