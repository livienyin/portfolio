class Page < ActiveRecord::Base
  attr_accessible :background_color, :template_name, :title, :order_index

  def data_for_client
    return {
      :backgroundColor => self.background_color,
      :title => self.title,
      :url => "/page/#{self.id}"
    }
  end
end
