$(document).ready(function() {
  var animationDuration = 1500;
  var easing = 'easeInOutQuint';
  var currentlyAnimating = false;

  // next animation
  $(document).on('click', '#home .next', function(event){
    if( !$(this).is(':animated')) {
    // next animates to active
    $('#content .next').animate(
      {
        'left': '5%', 
        'margin-right': '6%', 
        'margin-left': '6%', 
        'backgroundColor': '#ffffff' 
      },
      animationDuration,
      easing,
      function(){
        $(this).addClass('active').removeClass('next');
      });
    
    // active animates to previous
    $('#content .active').animate(
      {
        'left': '-73%',
        'margin-right': '0%', 
        'margin-left': '0%', 
        'backgroundColor': '#FEDFAD'
      },
      animationDuration,
      easing,
      function(){
        $(this).addClass('previous').removeClass('active');
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
      .animate({'left': '95%', 'backgroundColor': '#FEDFAD'}, animationDuration);

    //animate menu
    $('#navigation').css('text-align','left');
    $('#navigation .previous')
      .animate({'width': '0', 'opacity': '0'}, animationDuration, easing, function(){
      $(this).addClass('next')
          .removeClass('previous')
          .appendTo('#navigation')
          .css({ 'width': '33.3%'})
          .fadeTo(animationDuration, 1);
      });
    $('#navigation .active').addClass('previous').removeClass('active');
    $('#navigation .next').addClass('active').removeClass('next');
    event.stopPropagation();
    return false;
    }
  });

  // previous animation
  $(document).on('click', '#home .previous', function(event){
    if( !$(this).is(':animated')) {

    // previous animates to active
    $('#content .previous')
      .css({ 'left': '-73%'})
      .animate({
        'left': '5%', 
        'margin-right': '6%', 
        'margin-left': '6%', 
        'backgroundColor': '#FFFFFF' 
      }, animationDuration, easing, function(){
        $(this).addClass('active')
          .removeClass('previous');});

    
    // active animates to next
    $('#content .active')
      .animate({
        'left': '95%', 
        'margin-right': '0%', 
        'margin-left': '0%', 
        'backgroundColor': '#ADFFFF' 
      }, animationDuration, easing, function(){
        $(this).addClass('next')
          .removeClass('active');});
    
    // next animates to previous
    $('#content .next')
      .animate({'left': '173%'}, 
      animationDuration, easing, function(){$(this).remove();})
      .clone().addClass('previous')
      .removeClass('next')
      .prependTo('#content')
      .css({'left': '-151%'})
      .animate({'left': '-73%', 'backgroundColor': '#ADFFFF'}, animationDuration);
    
    //animate menu
    $('#navigation').css('text-align', 'right');
    $('#navigation .next')
      .animate({'width': '0', 'opacity': '0'}, animationDuration, easing, function(){
        $(this).addClass('previous')
          .removeClass('next')
          .prependTo('#navigation')
          .css({ 'width': '33.3%'})
          .fadeTo(animationDuration, 1);
      });
    $('#navigation .active').addClass('next').removeClass('active');
    $('#navigation .previous').addClass('active').removeClass('previous');
    event.stopPropagation();
    return false;
    }
  }); // end of previous animation
});
