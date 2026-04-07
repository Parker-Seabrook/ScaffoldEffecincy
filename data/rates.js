(function () {
  window.AppConfig = window.AppConfig || {};

  // Centralized rate engine configuration.
  // Rates are in cents per unit per day.
  window.AppConfig.defaultRates = {
    contractorOwned: {
      onSite: 0.0025,
      laydownYard: 0.0025,
      standingUnder90: 0.01,
      standingOver90: 0.015,
      dismantled: 0,
      removedOffSite: 0
    },
    facilityOwnerOwned: {
      onSiteFlat: 0.0025,
      dismantled: 0,
      removedOffSite: 0
    }
  };
})();
