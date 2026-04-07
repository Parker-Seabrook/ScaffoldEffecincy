(function () {
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function num(value, digits) {
    var parsed = Number(value || 0);
    return parsed.toLocaleString(undefined, {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits || 0
    });
  }

  function ownerOptions(selected) {
    return ["Contractor Owned", "Facility Owner Owned"]
      .map(function (owner) {
        return '<option value="' + owner + '" ' + (selected === owner ? "selected" : "") + ">" + owner + "</option>";
      })
      .join("");
  }

  function statusOptions(selected) {
    var statuses = ["On Site", "Laydown Yard", "Standing", "Dismantled", "Removed Off Site"];
    return statuses
      .map(function (status) {
        return '<option value="' + status + '" ' + (selected === status ? "selected" : "") + ">" + status + "</option>";
      })
      .join("");
  }

  function locationOptions(locations, selected) {
    return locations
      .map(function (loc) {
        return '<option value="' + esc(loc.name) + '" ' + (selected === loc.name ? "selected" : "") + ">" + esc(loc.name) + "</option>";
      })
      .join("");
  }

  window.AppTemplates = {
    esc: esc,
    num: num,
    ownerOptions: ownerOptions,
    statusOptions: statusOptions,
    locationOptions: locationOptions
  };
})();
