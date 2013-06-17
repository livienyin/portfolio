LivienyinCom::Application.routes.draw do

  devise_for :users
  mount RailsAdmin::Engine => '/admin', :as => 'rails_admin'

  root :to => 'pages#home'
  get '/page/:id' => 'pages#get_page'
  get '/page_info' => 'pages#get_ordered_page_info'
end
