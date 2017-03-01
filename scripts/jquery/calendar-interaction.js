var eventToggle = $('.toggle').find('button'),
		newItemArea = $('.new-item-area'),
		items = $('.items'),
		calendarDays = $('.days'),
		currentTimestamp = new Date(),
		firstTimestampOfMonth = Date.UTC(currentTimestamp.getFullYear(),
													 		currentTimestamp.getMonth(), 1, 8);
		todayTimestamp = Date.UTC(currentTimestamp.getFullYear(), currentTimestamp.getMonth(),
																currentTimestamp.getDate(), 8);

$(window).load( function () {
	setFirstOffset();
});

$(eventToggle).click( function () {
  $(this).toggleClass('active');
  var associatedClass = '.' + $(this).attr('title');
  // toggle visiblity on the relevant events
  $(associatedClass).toggle();
});

$('button').hover( function () {
	$(this).toggleClass('hover');
});

$(newItemArea).click( function () {
	if ($(this).hasClass('active')) {
		$(this).find('form').toggleClass('hidden');
		$(this).toggleClass('active');
		$(this).find('form').find('input').focus();
	}
});

$(items).click(function () {
	if ($(newItemArea).hasClass('active') === false) {
		$(newItemArea).find('form').addClass('hidden');
		$(newItemArea).addClass('active');
	}
});

var generateDateFromUTCTimestamp = function (epoch) {
	var d = new Date(0);
	d.setUTCSeconds((epoch/1000));
	var dString = "" + d;
	return dString.substring(4, 10);
}

var setFirstOffset = function () {
	window.scrollTo(0, 400);
}
