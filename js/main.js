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
    current: function() {
      return this.carouselPages.at(this.get("currentIndex"));
    },
    next: function() {
      return this.carouselPages.at(modulus(this.get("currentIndex") + 1, this.carouselPages.length));
    },
    previous: function() {
      return this.carouselPages.at(modulus(this.get("currentIndex") - 1, this.carouselPages.length));
    },
    rotate: function(indexToRotateBy) {
      this.currentIndex = modulus(this.get("currentIndex") + indexToRotateBy, this.carouselPages.length);
    }
  });

  var CarouselView = Backbone.View.extend({
    tagName: 'div',
    attributes: {id: 'content'},
    initialize: function () {
      this.currentIndex = this.model.get('currentIndex');
      this.previous = new CarouselPageView({model: this.model.previous(), displayPosition: -1});
      this.current = new CarouselPageView({model: this.model.current(), displayPosition: 0});
      this.next = new CarouselPageView({model: this.model.next(), displayPosition: 1});
      this.$el.append(this.previous.$el);
      this.$el.append(this.current.$el);
      this.$el.append(this.next.$el);
    },
    render: function() {
      if (this.get("currentIndex") != this.model.get("currentIndex")) {
       return 0; 
      }
    },
  });

  var CarouselPageView = Backbone.View.extend({
    tagName: 'iframe',
    initialize: function () {
      this.$el.attr('src', this.model.get('url'));
      this.displayPosition = this.options.displayPosition;
      this.$el.css(this.buildDisplayProperties(this.displayPosition));
    },
    buildDisplayProperties: function (newDisplayIndex) {
      var divCenter = (newDisplayIndex * divSize) + 50; // This is the
      var newMarginSize = newDisplayIndex == 0 ? currentMarginSize : peekingMarginSize;
      return {
        'left': (divCenter - divSize/2).toString() + "%",
        'right': (divCenter + divSize/2).toString() + "%",
        'width': divSize.toString() + "%",
        'float': 'left',
        'display': 'inline-block',
        'position': 'absolute',
        'margin-right': (newMarginSize).toString() + "%",
        'margin-left':  (newMarginSize).toString() + "%",
        'backgroundColor': this.getBackgroundColorForDisplayPosition(newDisplayIndex)
      }
    },
    getBackgroundColorForDisplayPosition: function(displayPosition) {
      return displayPosition == 0 ? defaultBackgroundColor : this.model.get('backgroundColor');
    }
  });

  var NavigationItemView = Backbone.View.extend({
    tagName: 'div',
    initialize: function() {
      this.$el.html(this.model.get('title'));
      this.$el.css({width: "33.3%", position: "absolute"});
    },
    events: {
      "click": "makeCurrent"
    },
    makeCurrent: function() {
      this.options.navigationView.setCurrent(this.index())
    },
    index: function() {
      return this.model.collection.indexOf(this.model);
    }
  });

  var NavigationView = Backbone.View.extend({
    tagName: 'div',
    attributes: {id: 'header'},
    initialize: function() {
      this.previous = this.buildNavigationItem(this.model.previous());
      this.current = this.buildNavigationItem(this.model.current());
      this.next = this.buildNavigationItem(this.model.next());
      this.listenTo(this.model, "change", this.render);
      this.previous.$el.css({left: "0%"});
      this.current.$el.css({left: "33.3%"});
      this.next.$el.css({left: "66.6%"});
      this.isAnimating = false;
    },
    buildNavigationItem: function(carouselPage) {
      var ni = new NavigationItemView({model: carouselPage, navigationView: this})
      this.$el.append(ni.$el);
      return ni;
    },
    render: function() {
      that = this;
      if (this.next.index() == this.model.get("currentIndex")) {
        this.isAnimating = true;
        newNext = this.buildNavigationItem(this.model.next());
        newNext.$el.css({left: "100%", opacity: 0});
        newNext.$el.animate(
          {left: '66%', opacity: 1},
          animationDuration,
          easing,
          function() {
            that.previous.remove();
            that.previous = that.current;
            that.current = that.next;
            that.next = newNext;
            that.isAnimating = false;
          }
        );
        this.previous.$el.animate(
          {left: '-33%', opacity: 0},
          animationDuration,
          easing
        );
        this.next.$el.animate(
          {left: '33%'},
          animationDuration,
          easing
        );
        this.current.$el.animate(
          {left: '0%'},
          animationDuration,
          easing
        );
      } else if (this.previous.index() == this.model.get("currentIndex")) {
        this.isAnimating = true;
        newPrevious = this.buildNavigationItem(this.model.previous());
        newPrevious.$el.css({left: "-33%", opacity: 0});
        newPrevious.$el.animate(
          {left: '0%', opacity: 1},
          animationDuration,
          easing,
          function() {
            that.next.remove();
            that.next = that.current;
            that.current = that.previous;
            that.previous = newPrevious;
            that.isAnimating = false;
          }
        );
        this.previous.$el.animate(
          {left: '33%'},
          animationDuration,
          easing
        );
        this.next.$el.animate(
          {left: '100%', opacity: 0},
          animationDuration,
          easing
        );
        this.current.$el.animate(
          {left: '66%'},
          animationDuration,
          easing
        );
      }
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
