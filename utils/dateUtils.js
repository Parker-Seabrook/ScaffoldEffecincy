(function () {
  window.DateUtils = {
    todayIsoDate: function () {
      return new Date().toISOString().slice(0, 10);
    },

    daysBetween: function (startDateStr, endDateStr) {
      if (!startDateStr || !endDateStr) return 0;
      var start = new Date(startDateStr + "T00:00:00Z");
      var end = new Date(endDateStr + "T00:00:00Z");
      var diffMs = end.getTime() - start.getTime();
      return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    },

    toDisplayDate: function (dateStr) {
      if (!dateStr) return "-";
      var d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toISOString().slice(0, 10);
    }
  };
})();
