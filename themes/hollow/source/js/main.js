$(document).ready(function(){
	// 获取当前时间
	var day = new Date().getDay();
	var mood = new Array("_Sunday tells me I have to work tomorrow",
						 "It’s _Monday, I feel grey.",
						 "Yes, finally taco _Tuesday.",
						 "Looking forward to the Weekend on _Wednesday",
						 "S.H.I.T. *So Happy It’s _Thursday*",
						 "It’s _Friday, anything we say would be awesome",
						 "Enjoy yourself cause _Saturday is coming");
	var month = new Array("Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec.");
	var dateString = new Date().getDate() + "  " + month[new Date().getMonth()];
	$('.date').html(dateString);
	$('.mood').html(mood[day]);

  	var $avatar = $('.info-avatar');
  	function switchScreen() {
    	$('.curtain').toggleClass('switch');
  	}
  	$avatar.on('click', switchScreen);
  
});
