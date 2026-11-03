namespace :stripe do
  # Stripe Checkout offers whatever payment methods the account's default
  # configuration enables, and sandbox and live mode have separate
  # configurations. Run once per mode (with that mode's STRIPE_SECRET_KEY):
  #   bin/rails stripe:configure_payment_methods
  desc "Enable only cards, Apple Pay, Google Pay, Link, Revolut Pay and PayPal"
  task configure_payment_methods: :environment do
    keep = %w[card apple_pay google_pay link revolut_pay paypal]

    config = Stripe::PaymentMethodConfiguration.list(limit: 100).data.find(&:is_default)
    abort "No default payment method configuration found" unless config

    changes = {}
    config.to_hash.each do |method, settings|
      next unless settings.is_a?(Hash) && settings.key?(:display_preference)
      next unless settings[:available] || keep.include?(method.to_s)

      wanted = keep.include?(method.to_s) ? "on" : "off"
      changes[method] = { display_preference: { preference: wanted } } if settings.dig(:display_preference, :value) != wanted
    end

    if changes.empty?
      puts "Already configured (#{config.id})"
    else
      Stripe::PaymentMethodConfiguration.update(config.id, changes)
      changes.each { |method, c| puts "#{method}: #{c.dig(:display_preference, :preference)}" }
    end
  end
end
