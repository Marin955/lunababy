module Admin
  class BaseController < ApplicationController
    include AdminAuthorizable
    include Auditable
    include Paginatable
  end
end
