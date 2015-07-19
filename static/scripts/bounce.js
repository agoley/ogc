$(function() {
		var animationName = 'animated bounce';
		var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
		
		$('button.a').on('click', function() {
			$('div.a').addClass(animationName).one(animationEnd, function() {
				$(this).removeClass(animationName);
			});
		});
	}
);

$(function() {
		var animationName = 'animated bounce';
		var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
		
		$('#addBtn').on('click', function() {
			$('#addCnfrm').addClass(animationName).one(animationEnd, function() {
				$(this).removeClass(animationName);
			});
		});
	}
);
