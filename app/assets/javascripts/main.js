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
      _.invoke(this.childViews, 'initialize');
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
      _.invoke(this.childViews, 'incrementDisplay', direction);
      _.invoke(this.childViews, 'animate', direction);
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
    incrementDisplay: function(direction) {
      this.displayIndex += direction;
    },
    animate: function() {
      var that = this;
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
    tagName: 'div',
    className: 'page',
    initializeHTML: function() {
      this.$el.load(this.model.get('url'));
    },
    buildDisplayProperties: function () {
      var divCenter = (this.displayIndex * divSize) + 50;
      var newMarginSize = this.displayIndex == 0 ? currentMarginSize : peekingMarginSize;
      return {
        'left': (divCenter - divSize/2).toString() + "%",
        'right': (divCenter + divSize/2).toString() + "%",
        'width': (divSize - 2 * newMarginSize).toString() + "%",
        'display': 'inline-block',
        'margin-right': (newMarginSize).toString() + "%",
        'margin-left':  (newMarginSize).toString() + "%",
        'backgroundColor': this.getBackgroundColor(),
        'opacity': this.displayIndex == 0 ? '1' : '0.6',
        'min-height': this.getHeight()
      }
    },
    getHeight: function() {
      if (this.$el.document == undefined) return "100%";
      return this.$el.document.body.offsetHeight + 'px';
    },
    getBackgroundColor: function() {
      if (this.displayIndex == 0) return "#ffffff";
      return this.options.parentView.getBackgroundColor();
    },
    leftAsPercentage: function() {
      return ((this.displayIndex + 1) * navigationItemWidth).toString() + "%";
    }
  });

  var CarouselView = RotatingView.extend({
    tagName: 'div',
    attributes: {id: 'pages'},
    childClass: CarouselItemView,
    getBackgroundColor: function() {
      if (this.current() == undefined) return "#ffffff";
      return this.current().model.get('backgroundColor');
    }
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
      new CarouselPage({
      	title: 'Livien Yin',
      	url: 'about.html',
      	backgroundColor: '#D4FF00'
      }),
      new CarouselPage({
      	title: 'Painting',
      	url: 'painting.html',
      	backgroundColor: 'rgb(254, 223, 173)'
      }),
      new CarouselPage({
      	title: 'Code',
      	url: 'code.html',
      	backgroundColor: 'rgb(173, 255, 255);'
      }),
    ]
  })
});
