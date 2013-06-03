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
  var divSize = 100 - (this.percentageOfPeekingDivVisible * 2);
  
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
      this.previousIndex = 0;
      this.currentIndex = 0;
    },
    current: function() {
      return this.carouselPages.at(this.currentIndex);
    },
    next: function() {
      return this.carouselPages.at(modulus(this.currentIndex + 1, this.carouselPages.length));
    },
    previous: function() {
      return this.carouselPages.at(modulus(this.currentIndex - 1, this.carouselPages.length));
    },
    rotate: function(indexToRotateBy) {
      this.currentIndex = modulus(this.currentIndex + indexToRotateBy, this.carouselPages.length);
    }
  });

  var CarouselView = Backbone.View.extend({
    el: 'div',
    attributes: {id: 'content'},
    initialize: function () {
      this.currentIndex = this.model.get('currentIndex');
      this.previous = CarouselPageView({model: this.model.previous(), displayPosition: -1});
      this.current = CarouselPageView({model: this.model.current(), displayPosition: 0});
      this.next = CarouselPageView({model: this.model.next(), displayPosition: 1});
      this.$el.append(this.previous.$el);
      this.$el.append(this.current.$el);
      this.$el.append(this.next.$el);
    },
    render: function () {
      if (this.currentIndex != this.model.currentIndex) {
       return 0; 
      }
    }
  });

  var CarouselPageView = Backbone.View.extend({
    el: 'iframe',
    initialize: function () {
      this.$el.attr('src', this.model.get('url'));
      this.displayPosition = this.options.displayPosition;
    },
    rotateTo: function(newDisplayPosition) {
      this.$el.animate(
        this.buildDisplayProperties(newDisplayPosition),
        this.animationDuration,
        this.easing,
        function () { newCurrent.swapDisplayClass('current'); }
      );
    },
    buildDisplayProperties: function (newDisplayPosition) {
      var divCenter = (newDisplayIndex * divSize) + 50; // This is the
      var newMarginSize = newDisplayIndex == 0 ? currentMarginSize : peekingMarginSize;
      return {
        'left': divCenter - divSize/2,
        'right': divCenter + divSize/2,
        'margin-right': newMarginSize,
        'margin-left':  newMarginSize,
        'backgroundColor': this.getBackgroundColorForDisplayPosition(newDisplayPosition)
      }
    },
    getBackgroundColorForDisplayPosition: function(displayPosition) {
      return displayPosition == 0 ? defaultBackgroundColor : this.model.get('backgroundColor');
    }
  });

  var NavigationItemView = Backbone.View.extend({
    el: 'li',
    initialize: function() {
      this.$el.innerHTML = this.model.get('title');
      this.$el.css({display: "inline-block", width: "33.3%"});
    }
  });

  var NavigationView = Backbone.View.extend({
    el: 'ul',
    attributes: {id: 'header'},
    initialize: function() {
      this.previous = new NavigationItemView({model: this.model.previous()});
      this.current = new NavigationItemView({model: this.model.current()});
      this.next = new NavigationItemView({model: this.model.next()});
      this.$el.append(this.previous.$el);
      this.$el.append(this.current.$el);
      this.$el.append(this.next.$el);
      this.currentIndex = this.model.currentIndex;
    },
    render: function () {
      if (this.currentIndex != this.model.currentIndex) {
        if (modulus(this.currentIndex + 1, this.model.carouselPages.length) == this.model.currentIndex) {
          this.previous.remove()
          this.previous = this.current;
          this.current = this.next;
          this.next = new NavigationItemView({model: this.model.next()});
          this.$el.append(this.next.$el);
        } else {
          this.next.remove();
          this.next = this.current;
          this.current = this.previous;
          this.previous = new NavigationItemView({model: this.model.previous()});
          this.$el.prepend(this.previous.$el);
        }
      }
    }
  });

  var AppView = Backbone.View.extend({
    el: $('#home'),
    initialize: function() {
      this.carousel = new Carousel(this.options);
      this.navigationView = new NavigationView({model: this.carousel});
      this.$el.append(this.navigationView.$el);
      debugger;
      this.carouselView = new CarouselView({model: this.carousel});
      this.$el.append(this.carouselView.$el);
      this.currentlyAnimating = false;
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
