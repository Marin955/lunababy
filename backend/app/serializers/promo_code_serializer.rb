class PromoCodeSerializer
  include Alba::Resource

  attributes :code, :discount_type, :value

  attribute :label do |pc|
    params[:locale] == "en" ? pc.label_en : pc.label_hr
  end
end
