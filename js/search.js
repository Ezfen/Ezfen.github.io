var layer;
function searchToggle(obj, evt){
	var container = $(obj).closest('.search-wrapper');

	if(!container.hasClass('active')){
		  container.addClass('active');
		  evt.preventDefault();
		  setTimeout(function(){container.addClass('closedelay');}, 1000);
		  $(obj).attr('onclick','submitFn(this, event)');
	}
	else if(container.hasClass('active')){
		  container.removeClass('active');
		  setTimeout(function(){container.removeClass('closedelay');}, 1000);
		  // clear input
		  container.find('.search-input').val('');
		  container.find('.search-icon').attr('onclick','searchToggle(this, event)');
		  // clear and hide result container when we press close
		  // container.find('.result-container').fadeOut(100, function(){$(this).empty();});
	}
}

function submitFn(obj, evt){
    var path = "/search.xml";
    searchFunc(path);
    layer.toggle();
    evt.preventDefault();
}

var searchFunc = function(path) {
    'use strict';
    $.ajax({
        url: path,
        dataType: "xml",
        success: function( xmlResponse ) {
            // get the contents from search data
            var datas = $( "entry", xmlResponse ).map(function() {
                return {
                    title: $( "title", this ).text(),
                    content: $("content",this).text(),
                    url: $( "url" , this).text()
                };
            }).get();
            var $input = document.getElementById("local-search-input");
            var $resultTitle = document.getElementById("local-search-title");
            var $resultContent = document.getElementById("local-search-result");
            var str = "";          
            var keywords = $input.value.trim().toLowerCase().split(/[\s\-]+/);
            $resultContent.innerHTML = "";
            if ($input.value.trim().length <= 0) {
                // 没有键入搜索内容
                str = "<h1>不告诉我点东西，我还真找不到合你胃口的零件:[ </h1>";
                $resultTitle.innerHTML = str;
                return;
            }
            // perform local searching
            datas.forEach(function(data) {
                var isMatch = true;
                var content_index = [];
                var data_title = data.title.trim().toLowerCase();
                var data_content = data.content.trim().replace(/<[^>]+>/g,"").toLowerCase();
                var data_url = data.url;
                var index_title = -1;
                var index_content = -1;
                var first_occur = -1;
                // only match artiles with not empty titles and contents
                if(data_title != '' && data_content != '') {
                    keywords.forEach(function(keyword, i) {
                        index_title = data_title.indexOf(keyword);
                        index_content = data_content.indexOf(keyword);
                        if( index_title < 0 && index_content < 0 ){
                            isMatch = false;
                        } else {
                            if (index_content < 0) {
                                index_content = 0;
                            }
                            if (i == 0) {
                                first_occur = index_content;
                            }
                        }
                    });
                }
                // show search results
                if (isMatch) {
                    str += "<a class='category' href="+ data_url +">"+ data_title +"</a>"
                }
            });
            if (str === "") {
                str = "<h1>Oops,我想大概零件还在生产中吧...</h1>";
                $resultTitle.innerHTML = str;
            } else {
                $resultTitle.innerHTML = "<h1>为你找到的可能契合的零件.</h1>";
                $resultContent.innerHTML = str;
            }
        }
    });
}

function setupLayer() {   
    var docElem = window.document.documentElement, didScroll, scrollPosition;

    // trick to prevent scrolling when opening/closing button
    function noScrollFn() {
        window.scrollTo( scrollPosition ? scrollPosition.x : 0, scrollPosition ? scrollPosition.y : 0 );
    }

    function noScroll() {
        window.removeEventListener( 'scroll', scrollHandler );
        window.addEventListener( 'scroll', noScrollFn );
    }

    function scrollFn() {
        window.addEventListener( 'scroll', scrollHandler );
    }

    function canScroll() {
        window.removeEventListener( 'scroll', noScrollFn );
        scrollFn();
    }

    function scrollHandler() {
        if( !didScroll ) {
            didScroll = true;
            setTimeout( function() { scrollPage(); }, 60 );
        }
    };

    function scrollPage() {
        scrollPosition = { x : window.pageXOffset || docElem.scrollLeft, y : window.pageYOffset || docElem.scrollTop };
        didScroll = false;
    };

    scrollFn();
    
    var el = document.querySelector( '.morph-button' );
    
    layer = new UIMorphingButton( el, {
        closeEl : '.icon-close',
        onBeforeOpen : function() {
            // don't allow to scroll
            noScroll();
        },
        onAfterOpen : function() {
            // can scroll again
            canScroll();
            // add class "noscroll" to body
            classie.addClass( document.body, 'noscroll' );
            // add scroll class to main el
            classie.addClass( el, 'scroll' );
        },
        onBeforeClose : function() {
            // remove class "noscroll" to body
            classie.removeClass( document.body, 'noscroll' );
            // remove scroll class from main el
            classie.removeClass( el, 'scroll' );
            // don't allow to scroll
            noScroll();
        },
        onAfterClose : function() {
            // can scroll again
            canScroll();
        }
    } );
}
setupLayer();
