class UserSerializer
  include Alba::Resource

  attributes :id, :name, :email, :phone, :language, :role

  many :addresses, resource: AddressSerializer
end
