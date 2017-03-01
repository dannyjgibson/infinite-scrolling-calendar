function DateViewModel() {
  var self = this,
      millisecondsInDay = 86400000,
      millisecondsInWeek = 604800000,
      pixelsFromEdgeForGet = 200,
      pixelsForCalendarReset = 1000;

  self.oldestDisplayedTimestamp = ko.observable();
  self.newestDisplayedTimestamp = ko.observable();
  self.timestampsWithItems = ko.observable({});
  self.counts = ko.observable({});
  self.days = ko.observableArray([]);
  self.currentMonthIndexToDisplay = ko.observable();
  self.currentMonthToDisplay = ko.observable("Current Month");
  self.nextMonthToDisplay = ko.observable("Next Month");
  self.previousMonthToDisplay = ko.observable("Previous Month");
  self.today = ko.computed( function () {
    var currentTimestamp = new Date(),
        todayTimestamp = Date.UTC(currentTimestamp.getFullYear(),
                              currentTimestamp.getMonth(), currentTimestamp.getDate());
    return todayTimestamp;
  }, DateViewModel);

  var scrollable = true;
  self.scrolled = function (data, target) {
    setTdHeight();

    if (scrollable
        && $(target).scrollTop() < pixelsFromEdgeForGet) {
      scrollable = false;
      var previousMonthRange = getPreviousMonthRange(self.oldestDisplayedTimestamp()),
          previousMonthData = getMonthEvents(previousMonthRange.first,
                                previousMonthRange.last);

      self.oldestDisplayedTimestamp(previousMonthRange.first);
      self.newestDisplayedTimestamp(self.newestDisplayedTimestamp()
                                    - (2 * millisecondsInWeek));
      self.days.remove(function (day) {return day > self.newestDisplayedTimestamp()});

      $(target).scrollTop(pixelsForCalendarReset);
    } else if ( scrollable
              && ($(target).scrollTop() + $(target).height())
                  > ($(document).height() - pixelsFromEdgeForGet)
              ) {
      // scrolling down, getting future dates
      scrollable = false;
      var nextMonthRange = getNextMonthRange(self.newestDisplayedTimestamp()),
          nextMonthData = getMonthEvents(nextMonthRange.first, nextMonthRange.last);

      self.newestDisplayedTimestamp(nextMonthRange.last);
      self.oldestDisplayedTimestamp(self.oldestDisplayedTimestamp()
                                    + (2 * millisecondsInWeek));
      self.days.remove(function (day) {return day < self.oldestDisplayedTimestamp()});
    } else {
      scrollable = true;
    }
    self.deleteUnusedTimeStamps();
    addMonthlyHorizontalRule();
  };

  self.deleteUnusedTimeStamps = function () {
    var existingTimestampsObject = self.timestampsWithItems(),
        timestampKeys = Object.keys(existingTimestampsObject),
        oldestTimestamp = self.oldestDisplayedTimestamp(),
        newestTimestamp = self.newestDisplayedTimestamp();

    for (var i = 0; i < timestampKeys.length; i++) {
      if (  timestampKeys[i] < oldestTimestamp
         || timestampKeys[i] > newestTimestamp
         ) {
        delete existingTimestampsObject[timestampKeys[i]];
      }
    }
    self.timestampsWithItems(existingTimestampsObject);
  }

  self.previousMonth = function (data, event) {
    var monthIndex = self.updateMonth('previousMonth'),
        firstofMonthTimestamp = self.generateTimestampForFirstOfMonth(monthIndex);
  }

  self.nextMonth = function (data, event) {
    var monthIndex = self.updateMonth('nextMonth'),
      firstofMonthTimestamp = self.generateTimestampForFirstOfMonth(monthIndex);
  }

  self.updateMonth = function (callerName) {
    var currentMonthIndex = self.currentMonthIndexToDisplay();
    if (callerName === 'nextMonth') {
      currentMonthIndex = (currentMonthIndex + 1) % 12;
    } else {
      currentMonthIndex = (currentMonthIndex === 0) ? 12 : currentMonthIndex - 1;
    }
    self.currentMonthIndexToDisplay(currentMonthIndex);
    self.getMonthsForCalendarTop();
    return currentMonthIndex;
  }

  self.generateTimestampForFirstOfMonth = function (monthIndex) {
    var todayTimestamp = self.today(),
        d = new Date(todayTimestamp),
        firstOfMonthTimestamp = Date.UTC(d.getFullYear(), monthIndex);

    // have to correct if you move across years...
    return firstOfMonthTimestamp;
  }


  self.getMonthsForCalendarTop = function () {
    var monthIndex = self.currentMonthIndexToDisplay();
        nextMonth = monthNames[(monthIndex + 1) % 12],
        lastMonthDate = monthNames[monthIndex - 1],
        previousMonth = (monthIndex === 0) ? monthNames[12] : lastMonthDate;

    self.currentMonthToDisplay(monthNames[monthIndex]);
    self.nextMonthToDisplay(nextMonth);
    self.previousMonthToDisplay(previousMonth);
  }

  self.weekendOrToday = function (data, index) {
    if (  data === self.today()
       && ( index === 0
          || index === 6
          )
       ) {
     return ko.observable('today weekend');
    } else if ((data - millisecondsInDay) === self.today()) {
      return ko.observable('today');
    } else if (index === 0
               || index === 6
              ) {
      return ko.observable('weekend');
    } else {
      return ko.observable('');
    }
  };

  self.firstOfMonth = function (data) {
    var date = new Date(data);
    if (date.getDate() === 1) {
      return ko.observable('first-of-month');
    } else {
      return ko.observable('');
    }
  }

  self.labelDay = function (dayTimestamp) {
    var d = new Date(0);
    d.setUTCSeconds((dayTimestamp/1000));
    var dString = "" + d;
    return ko.observable(dString.substring(4, 10));
  };

  self.mapCalendarItemsToTimestamp = function (calendarItems) {
    var existingObject = self.timestampsWithItems(),
        countObject = {},
        calendarGeneratedTimestamps = self.days();

    for (var i = 0; i < calendarItems.length; i++) {
      calendarItems[i].date = (stripTimestampToDay(calendarItems[i].date)) + millisecondsInDay;

      // change type of event from number to class
      calendarItems[i].type = typeNames[calendarItems[i].type];

      // mark day of week for layout
      calendarItems[i].dayOfWeek = getDayOfWeek(calendarItems[i].date);

      // count each type of event
      var countsProperty = '' + calendarItems[i].type;
      if (countObject[countsProperty] >= 0) {
        countObject[countsProperty]++;
      } else {
        countObject[countsProperty] = 1;
      }

      // perform mapping
      if (!existingObject['' + calendarItems[i].date]) {
        existingObject['' + calendarItems[i].date] = ko.observableArray([calendarItems[i]]);
      } else {
        existingObject['' + calendarItems[i].date].push(calendarItems[i]);
      }
    }
    self.timestampsWithItems(existingObject);
    self.counts(countObject);
  }

  self.getDisplayMonthsInitial = function () {
    var monthIndex = new Date().getMonth();
    self.currentMonthIndexToDisplay(monthIndex)
    self.getMonthsForCalendarTop();
  }

  self.getEventsUrl = function (timestampStart, timestampEnd) {
    return 'https://server/api/calendar?client-application'
            + '=tempcal&client-passphrase=passphrase'
            + '&start=' + timestampStart + "&end=" + timestampEnd;
  }

  self.setFirstOffset = function () {
    var tbodyTopOffset = $('tbody').position().top;
    var todayTopOffset = $('.day.today').position().top;
    $('tbody').scrollTop(todayTopOffset - tbodyTopOffset);
  }

  var getMonthEvents = function (startTimestamp, endTimestamp) {
    var urlWithParams = self.getEventsUrl(startTimestamp, endTimestamp);
    $.getJSON(urlWithParams, function (allData) {
      var monthsTimestamps = getMonthsTimestamps(startTimestamp, endTimestamp);
      updateDays(monthsTimestamps);
      self.mapCalendarItemsToTimestamp(allData);
    });
  }

  var updateDays = function (monthsTimestamps) {
    if (monthsTimestamps[0] < self.days()[0]) {
      self.days(monthsTimestamps.concat(self.days()));
    } else {
      self.days(self.days().concat(monthsTimestamps));
    }
  }

  var getInitialMonths = function () {
    var currentDate = new Date(),
        lastMonthDate = new Date(),
        nextMonthDate = new Date(),
        prevMonthIndex = (lastMonthDate.getMonth() - 1) === -1
                          ? 11
                          : (lastMonthDate.getMonth() - 1);
    lastMonthDate.setMonth(prevMonthIndex);
    nextMonthDate.setMonth((nextMonthDate.getMonth() + 1) % 12);
    self.oldestDisplayedTimestamp((Date.UTC(lastMonthDate.getFullYear(),
                                    lastMonthDate.getMonth())));
    self.newestDisplayedTimestamp((Date.UTC(nextMonthDate.getFullYear(),
                                    nextMonthDate.getMonth())) + millisecondsInDay);
    getMonthEvents(self.oldestDisplayedTimestamp(), self.newestDisplayedTimestamp());
    self.getDisplayMonthsInitial();
    addMonthlyHorizontalRule();
  };

  getInitialMonths();

  self.weeks = ko.computed(function () {
    var daysPerWeek = 7,
        weekIndex = 0, // initially zero, but not after scroll
        weeks = [],
        timestamps = self.timestampsWithItems;

    // add this month's day timestamps to weeks of the the month
    var dayOfWeekIndex = getDayOfWeek(self.days()[0]);

    for (var i = 0; i < self.days().length; i++) {
      if (!weeks[weekIndex]) {
        weeks[weekIndex] = [];
      }

      weeks[weekIndex][dayOfWeekIndex] = self.days()[i];
      dayOfWeekIndex++;

      if(weeks[weekIndex].length === daysPerWeek) {
        weekIndex++;
        dayOfWeekIndex = 0;
      }
    }
    return weeks;
  }, DateViewModel);

  // this should stay in the DataViewModel since it calls DataViewModel methods
  window.onscroll = function (ev) {
    self.scrolled(null, window);
  };
}

ko.applyBindings(new DateViewModel());
