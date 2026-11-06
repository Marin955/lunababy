class FixCroatianCopyTypos < ActiveRecord::Migration[8.1]
  # Fixes Croatian typos that the seeds put into production data (spec 005, B4).
  # Uses REPLACE so admin edits made around the typo are kept. Order snapshots are left untouched.
  FIXES = {
    "bundles" => {
      "short_description_hr" => [ [ "bezbrino", "bezbrižno" ] ],
      "description_hr" => [ [ "partiklicu", "portiklicu" ] ]
    },
    "shipping_methods" => {
      "carrier" => [ [ "Parketomat", "Paketomat" ], [ "Hrvatska Pošta", "Hrvatska pošta" ] ],
      "description_hr" => [ [ "Hrvatskom Poštom", "Hrvatskom poštom" ] ],
      "description_en" => [ [ "Hrvatska Pošta", "Hrvatska pošta" ] ]
    },
    "products" => {
      "name_hr" => [ [ "Partiklica", "Portiklica" ] ],
      "description_hr" => [
        [ "partiklica", "portiklica" ],
        [ "koja se čvrsto drži za stol, sprječava prolijevanje", "koja se čvrsto drži za stol i sprječava prolijevanje" ],
        [ "za ugrijavanje bebe nakon kupanja", "koji bebu grije nakon kupanja" ]
      ]
    }
  }.freeze

  def up
    FIXES.each do |table, columns|
      columns.each do |column, replacements|
        replacements.each do |from, to|
          execute <<~SQL.squish
            UPDATE #{table}
            SET #{column} = REPLACE(#{column}, #{connection.quote(from)}, #{connection.quote(to)})
            WHERE #{column} LIKE #{connection.quote("%#{from}%")}
          SQL
        end
      end
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
