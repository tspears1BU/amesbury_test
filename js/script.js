// Mobile Menu Trigger
$( document ).ready(function() {
   var $trigger = $('.menu-trigger');
   var $menu = $(".mobile-menu");

   $trigger.on("click", function() {
      $trigger.toggleClass("menu-closed menu-open")
      $menu.toggleClass("menu-closed menu-open")
   });

});
