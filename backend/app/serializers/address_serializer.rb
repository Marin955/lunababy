class AddressSerializer
  include Alba::Resource

  attributes :id, :first_name, :last_name, :street, :city, :postal_code, :phone, :company, :is_default
end
