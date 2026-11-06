# A verified-purchase review of one bundle from one order.
#
# The row is created when the review request email is sent: it holds the
# single-use token for the email link. The customer fills in rating/title/body
# through that link (`submit!`), then an admin approves or rejects it. Only
# approved reviews are ever shown publicly.
class Review < ApplicationRecord
  TOKEN_TTL = 60.days
  LOCALES = %w[hr en].freeze
  TITLE_MAX = 120
  BODY_MIN = 10
  BODY_MAX = 2000

  belongs_to :order
  belongs_to :bundle

  enum :status, { pending: 0, approved: 1, rejected: 2 }

  validates :token, presence: true, uniqueness: true
  validates :token_expires_at, presence: true
  validates :author_display_name, presence: true
  validates :locale, inclusion: { in: LOCALES }
  validates :bundle_id, uniqueness: { scope: :order_id }

  with_options if: :submitted? do
    validates :rating, presence: true, numericality: { only_integer: true, in: 1..5 }
    validates :title, length: { maximum: TITLE_MAX }
    validates :body, presence: true, length: { in: BODY_MIN..BODY_MAX }
  end
  validate :only_submitted_reviews_can_be_approved

  before_validation :assign_token, on: :create

  scope :submitted, -> { where.not(submitted_at: nil) }
  scope :published, -> { approved.submitted }
  scope :newest_first, -> { order(approved_at: :desc, submitted_at: :desc) }

  # Builds an unsaved review request for a bundle in an order.
  def self.build_request(order, bundle)
    new(
      order: order,
      bundle: bundle,
      locale: order.language.presence || "hr",
      author_display_name: display_name_for(order),
      token_expires_at: TOKEN_TTL.from_now
    )
  end

  # "Ana Kovač" → "Ana K."
  def self.display_name_for(order)
    first = order.shipping_first_name.to_s.strip.split(/\s+/).first
    last_initial = order.shipping_last_name.to_s.strip[0]
    first = order.customer_name.to_s.strip.split(/\s+/).first if first.blank?
    return "—" if first.blank?

    last_initial.present? ? "#{first} #{last_initial.upcase}." : first
  end

  # Average rating (one decimal) and count of published reviews for a bundle.
  def self.summary_for(bundle)
    stats = published.where(bundle: bundle).pick(Arel.sql("COUNT(*)"), Arel.sql("AVG(rating)"))
    count, average = stats
    { count: count.to_i, average_rating: count.to_i.positive? ? average.to_f.round(1) : nil }
  end

  def submitted?
    submitted_at.present?
  end

  def token_expired?
    token_expires_at <= Time.current
  end

  # :open, :used or :expired
  def token_state
    return :used if submitted?
    return :expired if token_expired?

    :open
  end

  # Fills in the customer's review. Returns false (with errors) when invalid.
  # The token can be used once: after this, token_state is :used.
  # `locale` is the language the customer wrote in (the form page's language);
  # it defaults to the order's language set when the request was sent.
  def submit(rating:, title:, body:, locale: nil)
    self.locale = locale if LOCALES.include?(locale)
    assign_attributes(
      rating: rating,
      title: title.to_s.strip.presence,
      body: body.to_s.strip,
      submitted_at: Time.current,
      status: :pending
    )
    return true if save

    self.submitted_at = nil
    false
  end

  def approve!
    update!(status: :approved, approved_at: Time.current)
  end

  def reject!
    update!(status: :rejected, approved_at: nil)
  end

  private

  def assign_token
    self.token ||= SecureRandom.urlsafe_base64(32)
  end

  def only_submitted_reviews_can_be_approved
    errors.add(:status, "can't be approved before the customer submits it") if approved? && !submitted?
  end
end
