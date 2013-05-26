var duration = 1000;

$(document).ready(function() {
  
  $('#home .next').on('click', function(event){
    // next animates to active
    $('#content .next').animate({
      'left' : '5%', 
      'margin-right' : '6%', 
      'margin-left' : '6%', 
      'backgroundColor' : '#FFFFFF'}, 
     duration,
     function(){
       $(this).addClass('active').removeClass('next');
     });
    
    // active animates to previous
    $('#content .active').animate({
      'left': '-73%',
      'margin-right' : '0%', 
      'margin-left' : '0%', 
      'backgroundColor' : '##EFF0F1'},
     duration,
     function(){
       $(this).addClass('previous').removeClass('active');
     });
    
    // previous animates to next
    $('#content .previous')
      .css({'left' : '-73%'})
      .animate({ 'left' : '-151%'}, 
      duration, function(){$(this).remove();})
      .clone().addClass('next')
      .removeClass('previous')
      .appendTo('#content')
      .css({ 'left' : '173%'})
      .animate({'left' : '95%'}, duration);
  });
});
