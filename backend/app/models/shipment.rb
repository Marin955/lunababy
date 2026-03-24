class Shipment < ApplicationRecord
  belongs_to :order

  enum :carrier, { hrvatska_posta: 0, gls: 1, dpd: 2 }

  validates :carrier, presence: true

  TRACKING_URLS = {
    'hrvatska_posta' => 'https://www.posta.hr/pracenje-posiljaka?broj=%s',
    'gls' => 'https://gls-group.eu/HR/hr/pracenje-posiljki?match=%s',
    'dpd' => 'https://www.dpd.com/hr/hr/pracenje-posiljki/?parcelNr=%s'
  }.freeze

  def tracking_url
    return nil if tracking_number.blank?

    template = TRACKING_URLS[carrier]
    return nil unless template

    format(template, tracking_number)
  end
end
