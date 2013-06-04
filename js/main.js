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
  var indexToClass = {0: 'current', 1: 'next'};
  indexToClass[-1] = 'previous';

  var RotatingView = Backbone.View.extend({
    initialize: function() {
      this.childViews = [
      	this.buildChildView(-1),
      	this.buildChildView(0),
      	this.buildChildView(1)
      ]
      this.listenTo(this.model, "change", this.render);
      this.isAnimating = false;
    },
    buildChildView: function(currentOffset, displayIndex) {
      if(typeof(displayIndex) === 'undefined') displayIndex = currentOffset;
      var newItemView = new this.childClass(
        {
          model: this.model.getWithOffsetFromCurrent(currentOffset),
          displayIndex: displayIndex,
          parentView: this
        }
      );
      this.$el.append(newItemView.$el);
      return newItemView;
    },
    animateInDirection: function(direction) {
      this.isAnimating = true;
      this.childViews.push(this.buildChildView(direction * -1, direction * -2));
      _.invoke(this.childViews, 'animateInDirection', direction)
      offScreenChild = _.find(this.childViews, function(childView) {
        return Math.abs(childView.displayIndex) > 1
      })
      this.childViews = _.filter(
      	this.childViews,
      	function(childView) {return Math.abs(childView.displayIndex) < 2}
      );
    },
    render: function() {
      direction = this.model.getDirection(this.current().index());
      if (direction != 0) this.animateInDirection(direction);
      return this.$el
    },
    current: function() {
      return _.find(this.childViews, function(childView) {return childView.displayIndex == 0});
    }
  });

  var RotatingItemView = Backbone.View.extend({
    initialize: function() {
      this.displayIndex = this.options.displayIndex;
      this.initializeHTML();
      this.setClasses();
      this.$el.css(this.buildDisplayProperties());
    },
    events: {
      "click": "makeCurrent"
    },
    makeCurrent: function() {
      this.options.parentView.model.setCurrent(this.index())
    },
    index: function() {
      return this.model.collection.indexOf(this.model);
    },
    setClasses: function() {
      this.$el.removeClass("previous current next");
      this.$el.addClass(indexToClass[this.displayIndex]);
    },
    animateInDirection: function(direction) {
      var that = this;
      this.displayIndex += direction;
      this.$el.animate(
        this.buildDisplayProperties(), animationDuration, easing,
        function() {
          that.options.parentView.isAnimating = false
          if (Math.abs(that.displayIndex) > 1) {
            that.remove()
          } else {
            that.setClasses();
          }
        }
      );
    },
  });

  var NavigationItemView = RotatingItemView.extend({
    tagName: 'div',
    className: 'menu-item',
    initializeHTML: function() {
      this.$el.html(this.model.get('title'));
    },
    buildDisplayProperties: function() {
      return {
      	width: "33.3%",
      	position: "absolute",
      	left: this.leftAsPercentage(),
        opacity: Math.abs(this.displayIndex) > 1 ? 0 : 1,
        color: this.displayIndex == 0 ? "black" : "rgb(204, 204, 204)"
      };
    },
    leftAsPercentage: function() {
      return ((this.displayIndex + 1) * navigationItemWidth).toString() + "%";
    }
  });

  var NavigationView = RotatingView.extend({
    tagName: 'div',
    attributes: {id: 'navigation'},
    childClass: NavigationItemView,
  });

  var CarouselItemView = RotatingItemView.extend({
    tagName: 'iframe',
    className: 'page',
    initializeHTML: function() {
      this.$el.attr('src', this.model.get('url'));
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
        'backgroundColor': "#ffffff",
        'height': '100%'
      }
    },
    
    leftAsPercentage: function() {
      return ((this.displayIndex + 1) * navigationItemWidth).toString() + "%";
    }
  });

  var CarouselView = RotatingView.extend({
    tagName: 'div',
    attributes: {id: 'pages'},
    childClass: CarouselItemView,
  });
  
  var CarouselPage = Backbone.Model.extend({
    defaults: function(title, url, backgroundColor) {
      return {
        title: title,
        url: url,
        backgroundColor: backgroundColor
      }
    }
  });

  var CarouselPages = Backbone.Collection.extend({model: CarouselPage});

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
    setCurrent: function(newCurrent) {
      if (!this.get('appView').isAnimating()) this.set("currentIndex", newCurrent);
    },
    length: function() { return this.carouselPages.length },
    getDirection: function(index) {
      direction = modulus(index - this.get('currentIndex'), this.length());
      // We need to check if wrapping around in the other direction is faster.
      oppositeDirection = direction - this.length();
      if (Math.abs(oppositeDirection) < Math.abs(direction)) return oppositeDirection;
      return direction;
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
      new CarouselPage({title: 'Livien Yin', url: 'about.html', backgroundColor: 'white'}),
      new CarouselPage({title: 'Painting', url: 'painting.html', backgroundColor: 'white'}),
      new CarouselPage({title: 'Code', url: 'code.html', backgroundColor: 'white'})
    ]
  })
});
