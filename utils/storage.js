(function () {
  var STORAGE_KEY = "scaffoldEfficiencyProgramDataV1";
  var RATE_KEY = "scaffoldEfficiencyProgramRatesV1";

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  window.Store = {
    loadState: function () {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(window.SeedData);
      try {
        return JSON.parse(raw);
      } catch (error) {
        console.warn("Invalid local data, reloading seed data", error);
        return clone(window.SeedData);
      }
    },

    saveState: function (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },

    resetState: function () {
      var fresh = clone(window.SeedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    },

    loadRates: function () {
      var raw = localStorage.getItem(RATE_KEY);
      if (!raw) return clone(window.AppConfig.defaultRates);
      try {
        return JSON.parse(raw);
      } catch (error) {
        console.warn("Invalid rates config, reloading default rates", error);
        return clone(window.AppConfig.defaultRates);
      }
    },

    saveRates: function (rates) {
      localStorage.setItem(RATE_KEY, JSON.stringify(rates));
    },

    resetRates: function () {
      var defaults = clone(window.AppConfig.defaultRates);
      localStorage.setItem(RATE_KEY, JSON.stringify(defaults));
      return defaults;
    }
  };
})();
