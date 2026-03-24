Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(
      "https://lunababy.eu",
      "https://www.lunababy.eu",
      "http://localhost:3000"
    )

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      max_age: 86400
  end
end
