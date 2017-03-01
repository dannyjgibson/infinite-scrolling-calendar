
var getDayOfWeek = function (currentTimestamp) {
  var currentDate = new Date(currentTimestamp);
  return currentDate.getDay();
}

var getPreviousMonthRange = function (timestamp) {
  var timestampDate = new Date(timestamp),
      timestampMonth = timestampDate.getMonth();
      timestampDateYear = timestampDate.getFullYear(),
      prevMonthIndex = (timestampDate.getMonth() - 1); 

  if (timestampMonth === 0) {
    timestampDateYear -= 1;
    prevMonthIndex = 11;
  }

  var range = {
    first: Date.UTC(timestampDateYear, prevMonthIndex, 1),
    last:  Date.UTC(timestampDate.getFullYear(), timestampMonth, timestampDate.getDate())
  };

  return range;
}

var getNextMonthRange = function (timestamp) {
  var timestampDate = new Date(timestamp),
      timestampDateYear = timestampDate.getFullYear();

  if (timestampDate.getMonth() === 11) {
    timestampDateYear += 1;
  }

  var range = {
    first: timestamp + 86400000,
    last: Date.UTC(timestampDateYear, (timestampDate.getMonth() + 2) % 12, 0)       
  };
  
  return range;
}

var formatDate = function (timestamp) {
  var date = new Date(timestamp);
  return date.toString();
}

var getMonthsTimestamps = function (firstOfMonthTimestamp, lastOfMonthTimestamp) {
  var monthsTimestamps = [];
  while (firstOfMonthTimestamp <= lastOfMonthTimestamp) {
    monthsTimestamps.push(firstOfMonthTimestamp);
    firstOfMonthTimestamp += 86400000;
  }
  return monthsTimestamps;
}


var stripTimestampToDay = function (timestamp) {
  var date = new Date(0);
  date.setUTCMilliseconds(timestamp);
  return  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0);
}

var addMonthlyHorizontalRule =  function () {
  $("tr:has('td.first-of-month')").addClass('first-week-of-month');
}

var setTdHeight = function () {
  $('tr').each(function() {
    var maxTdHeightInRow = 0;
    $(this).find('td').each( function() {
      if ($(this).height() > maxTdHeightInRow) {
        maxTdHeightInRow = $(this).height();
      }
    });
    $(this).find('td').height(maxTdHeightInRow);
  })
} 

var getCalendarMiddle = function () {
  var daysTbody = $('tbody.days'),
      daysTbodyWidth = daysTbody.width(),
      daysTbodyHeight = daysTbody.height();
  return {
      "x": daysTbodyWidth / 2,
      "y": daysTbodyHeight / 2
  };
}

var findClosestDay = function(target) {
  var distances = [],
      days = $('div.day'),
      closest = 0;
  days.each(function (i) {
    var dayOffset = $(this).offset(),
        distanceSquared = Math.pow((dayOffset.left - target.x), 2) 
                            + Math.pow((dayOffset.top - y), 2);
    distances[i] = distanceSquared;   
  });
  for (var i = 0; i < distances.length; i++) {
    if (distances[i] < distances[closest]) {
      closest = i;
    }
  }
  return days[i];
}

var monthNames = [ "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ];
