(function () {
  function round(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100000) / 100000;
  }

  function normalize(status) {
    return (status || "").trim();
  }

  function isActiveStatus(status) {
    return ["On Site", "Laydown Yard", "Standing"].indexOf(normalize(status)) >= 0;
  }

  function getStandingSince(record) {
    if (record.standingSince) return record.standingSince;
    if (record.dateErected) return record.dateErected;
    if (record.dateStatusLastChanged) return record.dateStatusLastChanged;
    return null;
  }

  // Billing logic is intentionally explicit so operations teams can audit it.
  function getRate(record, rates, todayIsoDate) {
    var ownerType = record.ownerType || record.ownershipType;
    var status = normalize(record.status);

    if (status === "Dismantled") {
      return {
        rate: ownerType === "Contractor Owned" ? rates.contractorOwned.dismantled : rates.facilityOwnerOwned.dismantled,
        rule: "No billing for dismantled material by default"
      };
    }

    if (status === "Removed Off Site") {
      return {
        rate: ownerType === "Contractor Owned" ? rates.contractorOwned.removedOffSite : rates.facilityOwnerOwned.removedOffSite,
        rule: "No billing for removed-off-site material"
      };
    }

    if (ownerType === "Facility Owner Owned") {
      if (isActiveStatus(status)) {
        return {
          rate: rates.facilityOwnerOwned.onSiteFlat,
          rule: "Facility owner owned: flat on-site rate"
        };
      }
      return {
        rate: 0,
        rule: "Not billable"
      };
    }

    if (ownerType === "Contractor Owned") {
      if (status === "Standing") {
        var standingSince = getStandingSince(record);
        var daysStanding = DateUtils.daysBetween(standingSince, todayIsoDate);
        if (daysStanding > 90) {
          return {
            rate: rates.contractorOwned.standingOver90,
            rule: "Contractor owned standing > 90 days"
          };
        }
        return {
          rate: rates.contractorOwned.standingUnder90,
          rule: "Contractor owned standing <= 90 days"
        };
      }

      if (status === "On Site") {
        return {
          rate: rates.contractorOwned.onSite,
          rule: "Contractor owned on site"
        };
      }

      if (status === "Laydown Yard") {
        return {
          rate: rates.contractorOwned.laydownYard,
          rule: "Contractor owned laydown"
        };
      }
    }

    return {
      rate: 0,
      rule: "Not billable"
    };
  }

  function calcRecordCharge(record, rates, todayIsoDate) {
    var quantity = Number(record.materialQuantity || record.quantity || 0);
    var rateInfo = getRate(record, rates, todayIsoDate);
    var dailyCharge = round(quantity * rateInfo.rate);

    return {
      quantity: quantity,
      ownerType: record.ownerType || record.ownershipType,
      status: record.status,
      daysStanding: record.status === "Standing" ? DateUtils.daysBetween(getStandingSince(record), todayIsoDate) : 0,
      applicableRate: rateInfo.rate,
      rule: rateInfo.rule,
      dailyCharge: dailyCharge,
      monthlyEstimate: round(dailyCharge * 30)
    };
  }

  function aggregateBy(items, keyGetter, valueGetter) {
    return items.reduce(function (acc, item) {
      var key = keyGetter(item);
      acc[key] = (acc[key] || 0) + valueGetter(item);
      return acc;
    }, {});
  }

  window.BillingEngine = {
    calcRecordCharge: calcRecordCharge,
    getRate: getRate,
    isActiveStatus: isActiveStatus,
    aggregateBy: aggregateBy,
    round: round
  };
})();
