$(document).ready(function() {
  var animationDuration = 2000;
  var easing = 'easeInOutQuint';
  var currentlyAnimating = false;

  // next animation
  $(document).on('click', '#home .next', function(event){
    if(!$(this).is(':animated')) {
    // next animates to current
    $('#content .next').animate(
      {
        'left': '5%', 
        'margin-right': '6%', 
        'margin-left': '6%', 
        'backgroundColor': '#ffffff',
        'opacity': '1'
      },
      animationDuration,
      easing,
      function(){
        $(this).addClass('current').removeClass('next');
      });
    
    // current animates to previous
    $('#content .current').animate(
      {
        'left': '-73%',
        'margin-right': '0%', 
        'margin-left': '0%', 
        'backgroundColor': '#FEDFAD',
        'opacity': '0.6'
      },
      animationDuration,
      easing,
      function(){
        $(this).addClass('previous').removeClass('current');
      });
    
    // previous animates to next
    $('#content .previous')
      .css({'left': '-73%'})
      .animate({ 'left': '-151%'}, 
      animationDuration, easing, function(){$(this).remove();})
      .clone()
      .addClass('next')
      .removeClass('previous')
      .appendTo('#content')
      .css({ 'left': '173%'})
      .animate({
        'left': '95%', 
        'backgroundColor': '#FEDFAD', 
        'opacity': '0.6'}, animationDuration);
      
    var oldPrevious = $('#header .previous');
    var newNext = oldPrevious.clone();
      newNext.appendTo('#header')
        .css({left: '100%', opacity: 0})
        .animate(
          {left: '66%', opacity: 1},
          animationDuration,
          easing,
          function() {
            oldPrevious.remove();
            $('#header .current').addClass('previous').removeClass('current');
            $('#header .next').addClass('current').removeClass('next');
            newNext.addClass('next').removeClass('previous');
          }
        );
      oldPrevious.animate(
        {left: '-33%', opacity: '0'},
        animationDuration,
        easing
      );
      $('#header .next, #header .next h2').animate(
        {left: '33%', color: 'black'},
        animationDuration,
        easing
      );
      $('#header .current, #header .current h2').animate(
        {left: '0%', color: '#cccccc'},
        animationDuration,
        easing
      );
    }
  });

  // previous animation
  $(document).on('click', '#home .previous', function(event){
    if( !$(this).is(':animated')) {

    // previous animates to current
    $('#content .previous')
      .css({ 'left': '-73%'})
      .animate({
        'left': '5%', 
        'margin-right': '6%', 
        'margin-left': '6%', 
        'backgroundColor': '#FFFFFF',
        'opacity': '1'
      }, animationDuration, easing, function(){
        $(this).addClass('current')
          .removeClass('previous');});

    
    // current animates to next
    $('#content .current')
      .animate({
        'left': '95%', 
        'margin-right': '0%', 
        'margin-left': '0%', 
        'backgroundColor': '#ADFFFF',
        'opacity': '0.6'
      }, animationDuration, easing, function(){
        $(this).addClass('next')
          .removeClass('current');});
    
    // next animates to previous
    $('#content .next')
      .animate({'left': '173%'}, 
      animationDuration, easing, function(){$(this).remove();})
      .clone().addClass('previous')
      .removeClass('next')
      .prependTo('#content')
      .css({'left': '-151%'})
      .animate({
        'left': '-73%', 
        'backgroundColor': '#ADFFFF', 
        'opacity': '0.6'}, animationDuration);

    var oldNext = $('#header .next');
    var newPrevious = oldNext.clone();
      newPrevious.appendTo('#header')
        .css({left: '-33.3%', opacity: 0})
        .animate(
          {left: '0%', opacity: 1},
          animationDuration,
          easing,
          function() {
            oldNext.remove();
            $('#header .current').addClass('next').removeClass('current');
            $('#header .previous').addClass('current').removeClass('previous');
            newPrevious.addClass('previous').removeClass('next');
          });
      oldNext.animate(
        {left: '100%', opacity: '0'},
        animationDuration,
        easing
      );
      $('#header .previous, #header .previous h2').animate(
        {left: '33%', color: 'black'},
        animationDuration,
        easing
      );
      $('#header .current, #header .current h2').animate(
        {left: '66.6%', color: '#cccccc'},
        animationDuration,
        easing
      );
     }
  }); // end of previous animation
});
