function modulus(n, m) {
  if(n < 0) {
    return (m + (n % m)) % m;
  }
  return n % m;
}

$(document).ready(function(){
  
  var ContentItem = Backbone.Model.extend({
    defaults: function(title, contentSRC, backgroundColor) {
      return {
        title: title,
        contentSRC: contentSRC,
        backgroundColor: backgroundColor
      }
    }
    
  });

  var ContentItems = Backbone.Collection.extend({
    model: ContentItem,
    current: function() {
      
    }
  });

  var NavigationView = Backbone.View.extend({
    el: 'div',
    attributes: {id: 'header'},
    
  });

  var ContentView = Backbone.View.extend({
    el: 'div',
    attributes: {id: 'content'}
  });

  var ContentItemView = Backbone.View.extend({
    el: 'iframe',
    render: function () {
       this.$el.attr('src', this.model.contentSRC);
    }
  });

  var AppView = Backbone.View.extend({
  });

});


function ContentItem(title, contentSRC, backgroundColor) {
  this.title = title;
  this.contentSRC = contentSRC;
  this.backgroundColor = backgroundColor;
  this.currentDisplayClass = null;
  this.initializeContent();
}

ContentItem.prototype.initializeContent = function () {
  this.iframeElement = $('<iframe />');
  this.iframeElement.attr('src', this.contentSRC);
  this.headerElement = $('<li /><h2 />');
  this.headerElement.innerHTML = this.title;
}

ContentItem.prototype.swapDisplayClass = function(newDisplayClass) {
  this.iframeElement.addClass(newDisplayClass).removeClass(this.currentDisplayClass);
  this.currentDisplayClass = newDisplayClass;
}

function PageCarousel(contentItems) {
  this.contentItems = contentItems; 
  this.currentIndex = 0;
  this.animationDuration = 1500;
  this.easing = 'easeInOutQuint';
  this.currentlyAnimating = false;
  this.currentBackgroundColor = '#ffffff';
  this.percentageOfPeekingDivVisible = 5;
  this.divSize = 100 - (this.percentageOfPeekingDivVisible * 2);
  this.currentMarginSize = 6;
  this.peekingMarginSize = 0;
  this.headerElement = $('<div id="header" />');
  this.contentElement = $('<div id="content" />');

  // Initialize Dom Elements
  this.setDisplayClasses();
  $('#content').append(this.current().iframeElement).append(this.next().iframeElement).append(this.previous().iframeElement);
    
}

PageCarousel.prototype.current = function() {
  return this.contentItems[this.currentIndex];
}

PageCarousel.prototype.next = function() {
  return this.contentItems[modulus(this.currentIndex + 1, this.contentItems.length)];
}

PageCarousel.prototype.previous = function() {
  return this.contentItems[modulus(this.currentIndex - 1, this.contentItems.length)];
}

PageCarousel.prototype.setDisplayClasses = function() {
  this.current().swapDisplayClass('current');
  this.next().swapDisplayClass('next');
  this.previous().swapDisplayClass('previous');
}

PageCarousel.prototype.rotateCarousel = function(numberToRotateBy) {
  var newIndex = modulus(this.currentIndex + numberToRotateBy, this.contentItems.length);
  var newCurrent = this.contentItems[newIndex];
  var newNext = this.contentItems[modulus(newIndex + 1, this.contentItems.length)];
  var newPrevious = this.contentItems[modulus(newIndex - 1, this.contentItems.length)];
  newCurrent.iframeElement.animate(
    this.buildAnimationProperties(newCurrent, 0),
    this.animationDuration,
    this.easing,
    function () { newCurrent.swapDisplayClass('current'); }
  );
  newNext.getDivElement().animate(
    this.buildAnimationProperties(newNext, 1),
    this.animationDuration,
    this.easing,
    function () { newNext.swapDisplayClass('next'); }
  );
  newPrevious.getDivElement().animate(
    this.buildAnimationProperties(newPrevious, -1),
    this.animationDuration,
    this.easing,
    function () { newNext.swapDisplayClass('previous'); }
  );
}

PageCarousel.prototype.buildAnimationProperties = function (contentItem, newDisplayIndex) {
  var divCenter = (newDisplayIndex * divSize) + 50; // This is the
  // absolute position of the center of the div given the position
  // index.
  var newMarginSize = newDisplayIndex == 0 ? this.currentMarginSize : this.peekingMarginSize;
  return {
    'left': divCenter - this.divSize/2,
    'right': divCenter + this.divSize/2,
    'margin-right': newMarginSize,
    'margin-left':  newMarginSize,
    'backgroundColor': newDisplayIndex == 0 ? this.currentBackgroundColor : contentItem.backgroundColor
  }
}

PageCarousel.prototype.shouldAnimate = function () {
}

// $(document).ready(function() {

//   // next animation
//   $(document).on('click', '#home .next', function(event){
//     if(!$(this).is(':animated')) {
//     // next animates to current
//     $('#content .next').animate(
//       {
//         'left': '25%', 
//         'backgroundColor': '#ffffff' 
//       },
//       animationDuration,
//       easing,
//       function(){
//         $(this).addClass('current').removeClass('next');
//       });
    
//     // current animates to previous
//     $('#content .current').animate(
//       {
//         'left': '-73%',
//         'margin-right': '0%', 
//         'margin-left': '0%', 
//         'backgroundColor': '#FEDFAD'
//       },
//       animationDuration,
//       easing,
//       function(){
//         $(this).addClass('previous').removeClass('current');
//       });
    
//     // previous animates to next
//     $('#content .previous')
//       .css({'left': '-73%'})
//       .animate({ 'left': '-151%'}, 
//       animationDuration, easing, function(){$(this).remove();})
//       .clone()
//       .addClass('next')
//       .removeClass('previous')
//       .appendTo('#content')
//       .css({ 'left': '173%'})
//       .animate({'left': '95%', 'backgroundColor': '#FEDFAD'}, animationDuration);

//     //animate menu
//     $('#navigation').css('text-align', 'left');
//     $('#navigation .previous')
//       .animate({'width': '0', 'opacity': '0'}, animationDuration, easing, function(){
//       $(this).addClass('next')
//           .removeClass('previous')
//           .appendTo('#navigation')
//           .css({ 'width': '33.3%'})
//           .fadeTo(animationDuration, 1);
//       });
//     $('#navigation .current').addClass('previous').removeClass('current');
//     $('#navigation .next').addClass('current').removeClass('next');
//     event.stopPropagation();
//     return false;
//     }
//   });

//   // previous animation
//   $(document).on('click', '#home .previous', function(event){
//     if( !$(this).is(':animated')) {

//     // previous animates to current
//     $('#content .previous')
//       .css({ 'left': '-73%'})
//       .animate({
//         'left': '5%', 
//         'margin-right': '6%', 
//         'margin-left': '6%', 
//         'backgroundColor': '#FFFFFF' 
//       }, animationDuration, easing, function(){
//         $(this).addClass('current')
//           .removeClass('previous');});

    
//     // current animates to next
//     $('#content .current')
//       .animate({
//         'left': '95%', 
//         'margin-right': '0%', 
//         'margin-left': '0%', 
//         'backgroundColor': '#ADFFFF' 
//       }, animationDuration, easing, function(){
//         $(this).addClass('next')
//           .removeClass('current');});
    
//     // next animates to previous
//     $('#content .next')
//       .animate({'left': '173%'}, 
//       animationDuration, easing, function(){$(this).remove();})
//       .clone().addClass('previous')
//       .removeClass('next')
//       .prependTo('#content')
//       .css({'left': '-151%'})
//       .animate({'left': '-73%', 'backgroundColor': '#ADFFFF'}, animationDuration);
    
//     //animate menu
//     $('#navigation').css('text-align', 'right');
//     $('#navigation .next')
//       .animate({'width': '0', 'opacity': '0'}, animationDuration, easing, function(){
//         $(this).addClass('previous')
//           .removeClass('next')
//           .prependTo('#navigation')
//           .css({ 'width': '33.3%'})
//           .fadeTo(animationDuration, 1);
//       });
//     $('#navigation .current').addClass('next').removeClass('current');
//     $('#navigation .previous').addClass('current').removeClass('previous');
//     event.stopPropagation();
//     return false;
//     }
//   }); // end of previous animation
// });
