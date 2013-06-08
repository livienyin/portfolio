LivienyinCom::Application.routes.draw do
  

  

  mount RailsAdmin::Engine => '/admin', :as => 'rails_admin'

  devise_for :users

  

  get '/' => 'pages#home'
  get '/page/:id' => 'pages#get_page'
  get '/page_info' => 'pages#get_ordered_page_info'
end
