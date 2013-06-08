class CreatePages < ActiveRecord::Migration
  def change
    create_table :pages do |t|
      t.string :title
      t.string :template_name
      t.string :background_color

      t.timestamps
    end
  end
end
