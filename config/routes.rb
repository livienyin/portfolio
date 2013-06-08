LivienyinCom::Application.routes.draw do
  get '/page/:id' => 'pages#get_page'
  get '/page_info' => 'pages#get_ordered_page_info'
end
