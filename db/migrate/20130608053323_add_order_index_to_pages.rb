class AddOrderIndexToPages < ActiveRecord::Migration
  def change
    add_column :pages, :order_index, :integer
  end
end
