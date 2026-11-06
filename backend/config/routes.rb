Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check
  get "health" => "rails/health#show"

  namespace :api do
    namespace :v1 do
      # Public endpoints
      resources :bundles, only: [ :index, :show ], param: :slug do
        resources :reviews, only: [ :index ]
      end
      resources :shipping_methods, only: [ :index ]
      post "promo_codes/validate", to: "promo_codes#validate"

      # Authentication
      post "auth/register", to: "auth#register"
      post "auth/login", to: "auth#login"
      post "auth/google", to: "auth#google"
      post "auth/facebook", to: "auth#facebook"
      post "auth/refresh", to: "auth#refresh"
      delete "auth/session", to: "auth#destroy"

      # Orders (mixed auth)
      resources :orders, only: [ :index, :show, :create ], param: :order_number
      get "orders/:order_number/lookup", to: "orders#lookup"
      post "orders/:order_number/confirm_payment", to: "orders#confirm_payment"
      post "orders/abandon", to: "orders#abandon"

      # Stripe
      post "stripe/webhooks", to: "stripe_webhooks#create"

      # Profile (authenticated)
      resource :profile, only: [ :show, :update ], controller: "profile"
      namespace :profile do
        resources :addresses, only: [ :create, :update, :destroy ]
      end

      # Newsletter
      post "newsletter/subscribe", to: "newsletter#subscribe"
      post "contact_messages", to: "contact_messages#create"

      # Verified-purchase reviews (token link from the review request email)
      get "reviews/:token", to: "reviews#show", as: :review_form
      post "reviews/:token", to: "reviews#create"
    end
  end

  namespace :admin do
    resources :orders, only: [ :index, :show ], param: :order_number do
      member do
        patch :status
        post :shipment
      end
    end
    resources :bundles, only: [ :index, :update ]
    resources :products, only: [ :index, :show, :update ] do
      member do
        post :adjust_stock
      end
    end
    resources :promo_codes, only: [ :index, :create, :update ]
    resources :reviews, only: [ :index ] do
      member do
        patch :approve
        patch :reject
      end
    end
    get "dashboard", to: "dashboard#show"
  end
end
