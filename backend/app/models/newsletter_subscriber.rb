class NewsletterSubscriber < ApplicationRecord
  enum :language, { hr: 0, en: 1 }

  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }

  scope :active, -> { where(active: true) }
end
