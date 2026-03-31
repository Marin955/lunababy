class OrderCreationService
  class Error < StandardError; end

  attr_reader :params, :user

  def initialize(params:, user: nil)
    @params = params
    @user = user
  end

  def call
    ActiveRecord::Base.transaction do
      bundles = lock_and_validate_bundles!
      subtotal = calculate_subtotal(bundles)
      promo = resolve_promo_code(subtotal)
      discount_amount = calculate_discount(promo, subtotal)
      shipping_method = ShippingMethod.find(params[:shipping_method_id])
      shipping_cost = calculate_shipping_cost(shipping_method, subtotal, promo)
      total = subtotal - discount_amount + shipping_cost

      order = create_order!(
        subtotal: subtotal,
        discount_amount: discount_amount,
        shipping_cost: shipping_cost,
        total: total,
        shipping_method: shipping_method,
        promo_code: promo
      )

      create_order_items!(order, bundles)
      decrement_stock!(bundles)
      create_initial_transition!(order)
      increment_promo_usage!(promo) if promo
      save_user_address! if user && params[:save_address]

      order
    end
  end

  private

  def lock_and_validate_bundles!
    items = params[:items]
    raise Error, "Items are required" if items.blank?

    bundle_ids = items.map { |i| i[:bundle_id] || resolve_bundle_id(i[:slug]) }
    bundles = Bundle.includes(bundle_items: :product).where(id: bundle_ids).index_by(&:id)

    # Collect all product IDs needed across all bundles and lock them (sorted by ID to prevent deadlocks)
    all_product_ids = bundles.values.flat_map { |b| b.bundle_items.map(&:product_id) }.uniq
    locked_products = Product.lock.where(id: all_product_ids).order(:id).index_by(&:id)

    items.map do |item|
      bundle_id = item[:bundle_id] || resolve_bundle_id(item[:slug])
      bundle = bundles[bundle_id]
      raise Error, "Bundle not found: #{item[:slug] || item[:bundle_id]}" unless bundle

      quantity = item[:quantity].to_i

      # Validate stock for each product in the bundle
      bundle.bundle_items.each do |bi|
        product = locked_products[bi.product_id]
        needed = bi.quantity * quantity
        raise Error, "#{product.name_hr} is out of stock" if product.stock_quantity <= 0
        raise Error, "Insufficient stock for #{product.name_hr}" if product.stock_quantity < needed
      end

      { bundle: bundle, quantity: quantity }
    end
  end

  def resolve_bundle_id(slug)
    bundle = Bundle.find_by(slug: slug)
    raise Error, "Bundle not found: #{slug}" unless bundle

    bundle.id
  end

  def calculate_subtotal(bundles)
    bundles.sum { |b| b[:bundle].price * b[:quantity] }
  end

  def resolve_promo_code(subtotal)
    return nil if params[:promo_code].blank?

    promo = PromoCode.find_by(code: params[:promo_code].upcase)
    raise Error, "Invalid promo code" unless promo
    raise Error, "Promo code is not valid" unless promo.valid_for_use?(subtotal)

    promo
  end

  def calculate_discount(promo, subtotal)
    return 0 unless promo

    case promo.discount_type
    when "percentage"
      (subtotal * promo.value / 100.0).round
    when "fixed"
      [promo.value, subtotal].min
    when "free_shipping"
      0
    else
      0
    end
  end

  def calculate_shipping_cost(shipping_method, subtotal, promo)
    return 0 if promo&.free_shipping?
    return 0 if shipping_method.free_threshold.present? && subtotal >= shipping_method.free_threshold

    shipping_method.price
  end

  def create_order!(subtotal:, discount_amount:, shipping_cost:, total:, shipping_method:, promo_code:)
    Order.create!(
      user: user,
      shipping_method: shipping_method,
      promo_code: promo_code,
      customer_email: params[:customer_email],
      customer_name: params[:customer_name],
      shipping_first_name: params[:shipping_address][:first_name],
      shipping_last_name: params[:shipping_address][:last_name],
      shipping_street: params[:shipping_address][:street],
      shipping_city: params[:shipping_address][:city],
      shipping_postal_code: params[:shipping_address][:postal_code],
      shipping_phone: params[:shipping_address][:phone],
      shipping_company: params[:shipping_address][:company],
      subtotal: subtotal,
      discount_amount: discount_amount,
      shipping_cost: shipping_cost,
      total: total,
      language: params[:language] || "hr",
      note: params[:note],
      status: :pending
    )
  end

  def create_order_items!(order, bundles)
    locale = params[:language] || "hr"

    bundles.each do |entry|
      bundle = entry[:bundle]
      quantity = entry[:quantity]
      bundle_name = locale == "en" ? bundle.name_en : bundle.name_hr

      order.order_items.create!(
        bundle: bundle,
        bundle_name: bundle_name,
        quantity: quantity,
        unit_price: bundle.price,
        line_total: bundle.price * quantity
      )
    end
  end

  def decrement_stock!(bundles)
    bundles.each do |entry|
      bundle = entry[:bundle]
      order_qty = entry[:quantity]

      bundle.bundle_items.each do |bi|
        product = bi.product
        needed = bi.quantity * order_qty
        product.update!(stock_quantity: product.stock_quantity - needed)
      end
    end
  end

  def create_initial_transition!(order)
    order.order_status_transitions.create!(
      to_status: :pending
    )
  end

  def increment_promo_usage!(promo)
    promo.increment!(:current_use_count)
  end

  def save_user_address!
    addr = params[:shipping_address]
    user.addresses.create!(
      first_name: addr[:first_name],
      last_name: addr[:last_name],
      street: addr[:street],
      city: addr[:city],
      postal_code: addr[:postal_code],
      phone: addr[:phone],
      company: addr[:company]
    )
  end
end
