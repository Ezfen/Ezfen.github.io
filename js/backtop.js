$(document).ready(function(){

  // 回到顶部
  $(window).scroll(function() {
    $(window).scrollTop() > $('.intro-header').height()
      ? $("#returnTop").css("bottom", "15px")
      : $("#returnTop").css("bottom", "-200px");
  });

  $("#returnTop").on("click", function() {
    $('html,body').animate({
      scrollTop: 0
    }, 500);
  });

  //分类菜单显示
  // $("#cateShow").bind("click",function(){
  //   if($(".cate-content").css("display") == "none"){
  //     $(".cate-content").show(400);
  //   }else{
  //     $(".cate-content").hide(400);
  //   }
  // });

  //菜单点击
  // $(".post-cate-list") && $(".post-cate-list").hide();
  // $(".cate-list li").bind("click", function(){
  //   var cateName = $(this).attr("data-cate");
  //   $(".cate-content").hide(400);
  //   $(".posts-container > ul[data-cate != " + cateName + "]").slideUp(280);
  //   $(".posts-container > ul[data-cate = " + cateName + "]").slideDown(400);
  // });

  //菜单隐藏
  // $("header, .container").bind("click",function(){
  //   $(".cate-content").hide(400);
  // });
  
});