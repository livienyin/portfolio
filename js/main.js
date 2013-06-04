function modulus(n, m) {
  if(n < 0) {
    return (m + (n % m)) % m;
  }
  return n % m;
}

$(document).ready(function(){
  var animationDuration = 1500;
  var easing = 'easeInOutQuint';
  var defaultBackgroundColor = '#ffffff';
  var percentageOfPeekingDivVisible = 5;
  var currentMarginSize = 6;
  var peekingMarginSize = 0;
  var divSize = 100 - (percentageOfPeekingDivVisible * 2);
  var navigationItemWidth = 100/3;
  
  var CarouselPage = Backbone.Model.extend({
    defaults: function(title, url, backgroundColor) {
      return {
        title: title,
        url: url,
        backgroundColor: backgroundColor
      }
    }
  });

  var CarouselPages = Backbone.Collection.extend({
    model: CarouselPage
  });

  var Carousel = Backbone.Model.extend({
    initialize: function() {
      this.carouselPages = new CarouselPages(this.get('carouselPages'));
      this.set("currentIndex", 0);
    },
    getWithOffsetFromCurrent: function(offset) {
      return this.carouselPages.at(
        modulus(this.get("currentIndex") + offset, this.carouselPages.length)
      );
    },
    setCurrent: function(newCurrent) {return},
    length: function() { return this.carouselPages.length },
    getDirection: function(index) {
      direction = modulus(index - this.get('currentIndex'), this.length());
      // We need to check if wrapping around in the other direction is faster.
      oppositeDirection = direction - this.length();
      if (Math.abs(oppositeDirection) < Math.abs(direction)) return oppositeDirection;
      return direction;
    }
  });

  var CarouselView = Backbone.View.extend({
    tagName: 'div',
    attributes: {id: 'carousel-pages'},
    initialize: function () {
      this.previous = this.buildPageView(-1);
      this.current = this.buildPageView(0);
      this.next = this.buildPageView(1);
      this.listenTo(this.model, "change", this.render);
      this.isAnimating = false;
    },
    buildPageView: function(currentOffset, displayIndex) {
      if(typeof(displayIndex)==='undefined') displayIndex = currentOffset;
      var cpv = new CarouselPageView(
        {
          model: this.model.getWithOffsetFromCurrent(currentOffset),
          displayIndex: displayIndex,
          carouselView: this
        }
      );
      this.$el.append(cpv.$el);
      return cpv;
    },
    animateInDirection: function(direction) {
      this.isAnimating = true;
      newPageView = this.buildPageView(direction * -1, direction * -2);
      newPageView.animateInDirection(direction);
      this.previous.animateInDirection(direction);
      this.current.animateInDirection(direction);
      this.next.animateInDirection(direction);

      // Figure out what the new previous, current and next values
      // need to be.
      var displayIndexToCarouselPageView = {};
      displayIndexToCarouselPageView[newNavigationItemView.displayIndex] = newPageView;
      displayIndexToCarouselPageView[this.previous.displayIndex] = this.previous;
      displayIndexToCarouselPageView[this.current.displayIndex] = this.current;
      displayIndexToCarouselPageView[this.next.displayIndex] = this.next;
      this.previous = displayIndexToCarouselPageView[-1];
      this.current = displayIndexToCarouselPageView[0];
      this.next = displayIndexToCarouselPageView[1];
    },
    render: function() {
      direction = this.model.getDirection(this.current.index());
      if (direction != 0) this.animateInDirection(direction);
      return this.$el
    },
  });

  var CarouselPageView = Backbone.View.extend({
    tagName: 'iframe',
    className: 'page',
    initialize: function() {
      this.displayIndex = this.options.displayIndex;
      this.$el.attr('src', this.model.get('url'));
      this.$el.css(this.buildDisplayProperties());
    },
    makeCurrent: function() {
      this.options.navigationView.setCurrent(this.index())
    },
    index: function() {
      return this.model.collection.indexOf(this.model);
    },
    animateInDirection: function(direction) {
      var that = this;
      this.displayIndex += direction;
      this.$el.animate(
        this.buildDisplayProperties(), animationDuration, easing,
        // This is a terrible way to do this. Figure out something better.
        function() {that.options.carouselView.isAnimating = false}
      );
    },
    buildDisplayProperties: function () {
      var divCenter = (this.displayIndex * divSize) + 50;
      var newMarginSize = this.displayIndex == 0 ? currentMarginSize : peekingMarginSize;
      return {
        'left': (divCenter - divSize/2).toString() + "%",
        'right': (divCenter + divSize/2).toString() + "%",
        'width': divSize.toString() + "%",
        'float': 'left',
        'display': 'inline-block',
        'position': 'absolute',
        'margin-right': (newMarginSize).toString() + "%",
        'margin-left':  (newMarginSize).toString() + "%",
        'backgroundColor': this.getBackgroundColorForDisplayPosition(this.displayIndex)
      }
    },
    leftAsPercentage: function() {
      return ((this.displayIndex + 1) * navigationItemWidth).toString() + "%";
    },
    getBackgroundColorForDisplayPosition: function(displayPosition) {
      return displayPosition == 0 ? defaultBackgroundColor : this.model.get('backgroundColor');
    },
    index: function() {
      return this.model.collection.indexOf(this.model);
    }
  });

  var NavigationItemView = Backbone.View.extend({
    tagName: 'div',
    className: 'menu-item',
    initialize: function() {
      this.displayIndex = this.options.displayIndex;
      this.$el.html(this.model.get('title') + this.index().toString());
      this.$el.css({width: "33.3%", position: "absolute", left: this.leftAsPercentage()});
    },
    events: {
      "click": "makeCurrent"
    },
    makeCurrent: function() {
      this.options.navigationView.setCurrent(this.index())
    },
    index: function() {
      return this.model.collection.indexOf(this.model);
    },
    animateInDirection: function(direction) {
      var that = this;
      this.displayIndex += direction;
      var newOpacity = Math.abs(this.displayIndex) > 1 ? 0 : 1;
      this.$el.animate(
        {
          left: ((this.displayIndex + 1) * navigationItemWidth).toString() + "%",
          opacity: newOpacity
        }, animationDuration, easing,
        function() {that.options.navigationView.isAnimating = false}
      );
    },
    leftAsPercentage: function() {
      return ((this.displayIndex + 1) * navigationItemWidth).toString() + "%";
    }
  });

  var NavigationView = Backbone.View.extend({
    tagName: 'div',
    attributes: {id: 'header'},
    initialize: function() {
      this.previous = this.buildNavigationItemView(-1);
      this.current = this.buildNavigationItemView(0);
      this.next = this.buildNavigationItemView(1);
      this.listenTo(this.model, "change", this.render);
      this.isAnimating = false;
    },
    buildNavigationItemView: function(currentOffset, displayIndex) {
      if(typeof(displayIndex)==='undefined') displayIndex = currentOffset;
      var niv = new NavigationItemView(
        {
          model: this.model.getWithOffsetFromCurrent(currentOffset),
          displayIndex: displayIndex,
          navigationView: this
        }
      );
      this.$el.append(niv.$el);
      return niv;
    },
    animateInDirection: function(direction) {
      this.isAnimating = true;
      newNavigationItemView = this.buildNavigationItemView(direction * -1, direction * -2);
      newNavigationItemView.animateInDirection(direction);
      this.previous.animateInDirection(direction);
      this.current.animateInDirection(direction);
      this.next.animateInDirection(direction);

      // Figure out what the new previous, current and next values
      // need to be.
      var displayIndexToNavigationItemView = {};
      displayIndexToNavigationItemView[newNavigationItemView.displayIndex] = newNavigationItemView;
      displayIndexToNavigationItemView[this.previous.displayIndex] = this.previous;
      displayIndexToNavigationItemView[this.current.displayIndex] = this.current;
      displayIndexToNavigationItemView[this.next.displayIndex] = this.next;
      this.previous = displayIndexToNavigationItemView[-1];
      this.current = displayIndexToNavigationItemView[0];
      this.next = displayIndexToNavigationItemView[1];
    },
    render: function() {
      direction = this.model.getDirection(this.current.index());
      if (direction != 0) this.animateInDirection(direction);
      return this.$el
    },
    setCurrent: function(newIndex) {
      if (!this.options.appView.isAnimating()) {
        this.model.set("currentIndex", newIndex);
      }
    }
  });

  var AppView = Backbone.View.extend({
    el: $('#home'),
    initialize: function() {
      this.options.appView = this;
      this.carousel = new Carousel(this.options);
      this.navigationView = new NavigationView({model: this.carousel, appView: this});
      this.$el.append(this.navigationView.$el);
      this.carouselView = new CarouselView({model: this.carousel});
      this.$el.append(this.carouselView.$el);
      this.currentlyAnimating = false;
    },
    isAnimating: function() {
      return this.navigationView.isAnimating;
    }
  });
  var appView = new AppView({
    carouselPages: [
      new CarouselPage({title: 'about', url: 'about.html', backgroundColor: 'white'}),
      new CarouselPage({title: 'painting', url: 'painting.html', backgroundColor: 'white'}),
      new CarouselPage({title: 'code', url: 'code.html', backgroundColor: 'white'})
    ]
  })
});
