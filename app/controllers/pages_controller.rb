class PagesController < ApplicationController

  def get_ordered_page_info
    ordered_pages = Page.where(Page.arel_table[:order_index].not_eq(nil)).order("order_index ASC")
    render :json => (ordered_pages.map {|page| page.data_for_client})
  end

  def get_page
    @page = Page.find(params[:id])
    render @page.template_name
  end
end
