module Paginatable
  extend ActiveSupport::Concern

  private

  def page
    [ params.fetch(:page, 1).to_i, 1 ].max
  end

  def per_page
    [ params.fetch(:per, 20).to_i.clamp(1, 100), 100 ].min
  end

  def paginate(scope)
    total = scope.count
    records = scope.offset((page - 1) * per_page).limit(per_page)

    [ records, pagination_meta(total) ]
  end

  def pagination_meta(total)
    {
      current_page: page,
      total_pages: (total.to_f / per_page).ceil,
      total_count: total
    }
  end
end
