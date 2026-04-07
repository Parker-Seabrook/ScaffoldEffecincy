(function () {
  var T = window.AppTemplates;

  function renderDashboard(root, vm) {
    var alertsHtml = vm.alerts.length
      ? vm.alerts
          .map(function (a) {
            return "<li>" + T.esc(a) + "</li>";
          })
          .join("")
      : "<li>No current critical alerts.</li>";

    root.innerHTML = '' +
      '<div class="grid kpis">' +
      card("Total Material On Site", T.num(vm.totalOnSite)) +
      card("Material In Laydown Yard", T.num(vm.totalLaydown)) +
      card("Total Standing Material", T.num(vm.totalStanding)) +
      card("Standing > 90 Days", '<span class="danger">' + T.num(vm.totalStandingOver90) + '</span>') +
      card("Estimated Daily Billing", cents(vm.dailyBilling)) +
      card("Estimated Monthly Billing", cents(vm.monthlyBilling)) +
      card("Contractor-Owned Cost Exposure", cents(vm.contractorExposure)) +
      card("Facility-Owned Cost Exposure", cents(vm.facilityExposure)) +
      card("Utilization (Standing/Active)", T.num(vm.utilizationPct, 1) + "%") +
      '</div>' +
      '<div class="grid" style="margin-top:0.8rem;">' +
      '<div class="card"><h3 class="section-title">Aged Material Alerts</h3><ul class="alert-list">' + alertsHtml + '</ul></div>' +
      '</div>';
  }

  function renderScaffolds(root, vm, locations) {
    var rows = vm.rows
      .map(function (row) {
        return '' +
          '<tr>' +
          '<td>' + T.esc(row.scaffoldId) + '</td>' +
          '<td>' + T.esc(row.description) + '</td>' +
          '<td>' + T.esc(row.location) + '</td>' +
          '<td>' + T.esc(row.ownerType) + '</td>' +
          '<td>' + T.num(row.materialQuantity) + '</td>' +
          '<td>' + T.esc(row.status) + '</td>' +
          '<td>' + T.esc(row.dateErected) + '</td>' +
          '<td>' + T.num(row.daysStanding) + badgeDays(row.daysStanding, row.status) + '</td>' +
          '<td>' + T.num(row.rate, 4) + '</td>' +
          '<td>' + cents(row.dailyCost) + '</td>' +
          '<td>' +
          '<button class="secondary" data-action="edit-scaffold" data-id="' + T.esc(row.scaffoldId) + '">Edit</button> ' +
          '<button class="secondary" data-action="change-scaffold-status" data-id="' + T.esc(row.scaffoldId) + '">Status</button> ' +
          '<button class="secondary" data-action="assign-material" data-id="' + T.esc(row.scaffoldId) + '">Assign Material</button>' +
          '</td>' +
          '</tr>';
      })
      .join("");

    root.innerHTML = '' +
      '<div class="card">' +
      '<h3 class="section-title">Scaffold Registry</h3>' +
      '<div class="toolbar">' +
      '<input id="scaffoldSearch" placeholder="Search ID/description/location" value="' + T.esc(vm.filters.search) + '" />' +
      '<select id="scaffoldOwnerFilter"><option value="">All Owners</option>' + T.ownerOptions(vm.filters.ownerType) + '</select>' +
      '<select id="scaffoldStatusFilter"><option value="">All Statuses</option>' + T.statusOptions(vm.filters.status) + '</select>' +
      '<select id="scaffoldSortBy">' +
      '<option value="scaffoldId" ' + (vm.filters.sortBy === "scaffoldId" ? "selected" : "") + '>Sort: ID</option>' +
      '<option value="dailyCost" ' + (vm.filters.sortBy === "dailyCost" ? "selected" : "") + '>Sort: Daily Cost</option>' +
      '<option value="daysStanding" ' + (vm.filters.sortBy === "daysStanding" ? "selected" : "") + '>Sort: Days Standing</option>' +
      '</select>' +
      '</div>' +
      '<div class="form-grid">' +
      field("Scaffold ID", '<input id="newScaffoldId" placeholder="SCF-XXXX" />') +
      field("Description", '<input id="newScaffoldDesc" placeholder="Description" />') +
      field("Location", '<select id="newScaffoldLocation">' + T.locationOptions(locations, "") + '</select>') +
      field("Owner", '<select id="newScaffoldOwner">' + T.ownerOptions("Contractor Owned") + '</select>') +
      field("Status", '<select id="newScaffoldStatus">' + T.statusOptions("On Site") + '</select>') +
      field("Date Erected", '<input id="newScaffoldDate" type="date" />') +
      field("Material Qty", '<input id="newScaffoldQty" type="number" min="0" step="1" value="0" />') +
      '</div>' +
      '<button class="primary" data-action="add-scaffold">Add New Scaffold</button>' +
      '</div>' +
      '<div class="card" style="margin-top:0.8rem;">' +
      '<div class="table-wrap"><table>' +
      '<thead><tr><th>ID</th><th>Description</th><th>Location</th><th>Owner</th><th>Qty</th><th>Status</th><th>Erected</th><th>Days Standing</th><th>Rate (cents)</th><th>Daily Cost (cents)</th><th>Actions</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '</table></div></div>';
  }

  function renderMaterials(root, vm, scaffolds, locations) {
    var scaffoldOptions = '<option value="">Unassigned / Laydown</option>' +
      scaffolds
        .map(function (s) {
          return '<option value="' + T.esc(s.scaffoldId) + '">' + T.esc(s.scaffoldId) + ' - ' + T.esc(s.description) + '</option>';
        })
        .join("");

    var rows = vm.rows
      .map(function (row) {
        return '' +
          '<tr>' +
          '<td>' + T.esc(row.materialId) + '</td>' +
          '<td>' + T.esc(row.materialType) + '</td>' +
          '<td>' + T.num(row.quantity) + '</td>' +
          '<td>' + T.esc(row.location) + '</td>' +
          '<td>' + T.esc(row.ownershipType) + '</td>' +
          '<td>' + T.esc(row.status) + '</td>' +
          '<td>' + T.esc(row.assignedScaffoldId || "-") + '</td>' +
          '<td>' + T.esc(row.dateStatusLastChanged) + '</td>' +
          '<td><button class="secondary" data-action="edit-material" data-id="' + T.esc(row.materialId) + '">Edit</button></td>' +
          '</tr>';
      })
      .join("");

    root.innerHTML = '' +
      '<div class="panel-row">' +
      '<div class="card">' +
      '<h3 class="section-title">Material Tracker</h3>' +
      '<div class="form-grid">' +
      field("Material ID", '<input id="newMaterialId" placeholder="MAT-XXXX" />') +
      field("Material Type", '<input id="newMaterialType" placeholder="Ringlock, Plank..." />') +
      field("Quantity", '<input id="newMaterialQty" type="number" min="0" step="1" value="0" />') +
      field("Owner", '<select id="newMaterialOwner">' + T.ownerOptions("Contractor Owned") + '</select>') +
      field("Location", '<select id="newMaterialLocation">' + T.locationOptions(locations, "") + '</select>') +
      field("Status", '<select id="newMaterialStatus">' + T.statusOptions("On Site") + '</select>') +
      field("Assigned Scaffold", '<select id="newMaterialScaffold">' + scaffoldOptions + '</select>') +
      field("Placed On Site", '<input id="newMaterialPlacedDate" type="date" />') +
      '</div>' +
      '<button class="primary" data-action="add-material">Add Material Entry</button>' +
      '</div>' +
      '<div class="card">' +
      '<h3 class="section-title">Totals By Status & Owner</h3>' +
      '<div class="table-wrap"><table><thead><tr><th>Category</th><th>Quantity</th></tr></thead><tbody>' +
      vm.totals.map(function (r) {
        return '<tr><td>' + T.esc(r.label) + '</td><td>' + T.num(r.quantity) + '</td></tr>';
      }).join("") +
      '</tbody></table></div>' +
      '</div>' +
      '</div>' +
      '<div class="card" style="margin-top:0.8rem;">' +
      '<div class="table-wrap"><table>' +
      '<thead><tr><th>Material ID</th><th>Type</th><th>Qty</th><th>Location</th><th>Owner</th><th>Status</th><th>Scaffold</th><th>Status Changed</th><th>Actions</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
      '</div>';
  }

  function renderBilling(root, vm, scaffolds) {
    var rowHtml = vm.records
      .map(function (r) {
        return '<tr>' +
          '<td>' + T.esc(r.recordType) + '</td>' +
          '<td>' + T.esc(r.recordId) + '</td>' +
          '<td>' + T.esc(r.location) + '</td>' +
          '<td>' + T.esc(r.ownerType) + '</td>' +
          '<td>' + T.esc(r.status) + '</td>' +
          '<td>' + T.num(r.daysStanding) + '</td>' +
          '<td>' + T.num(r.quantity) + '</td>' +
          '<td>' + T.num(r.applicableRate, 4) + '</td>' +
          '<td>' + cents(r.dailyCharge) + '</td>' +
          '<td>' + cents(r.monthlyEstimate) + '</td>' +
          '<td>' + T.esc(r.rule) + '</td>' +
          '</tr>';
      })
      .join("");

    var scaffoldOpts = scaffolds
      .map(function (s) {
        return '<option value="' + T.esc(s.scaffoldId) + '">' + T.esc(s.scaffoldId) + "</option>";
      })
      .join("");

    root.innerHTML = '' +
      '<div class="panel-row">' +
      '<div class="card">' +
      '<h3 class="section-title">Billing Records (Daily Charges)</h3>' +
      '<div class="table-wrap"><table>' +
      '<thead><tr><th>Type</th><th>ID</th><th>Area</th><th>Owner</th><th>Status</th><th>Days Standing</th><th>Qty</th><th>Rate</th><th>Daily</th><th>Monthly Est.</th><th>Rule</th></tr></thead>' +
      '<tbody>' + rowHtml + '</tbody></table></div>' +
      '</div>' +
      '<div class="card">' +
      '<h3 class="section-title">Status Change Simulation</h3>' +
      '<label class="label" for="billingSimScaffold">Scaffold</label>' +
      '<select id="billingSimScaffold">' + scaffoldOpts + '</select>' +
      '<label class="label" for="billingSimStatus">New Status</label>' +
      '<select id="billingSimStatus">' + T.statusOptions("Standing") + '</select>' +
      '<button class="primary" style="margin-top:0.6rem;" data-action="simulate-billing">Simulate Impact</button>' +
      '<div id="billingSimResult" style="margin-top:0.65rem; font-size:0.84rem; color:#334155;">Select scaffold and status to calculate delta.</div>' +
      '</div>' +
      '</div>' +
      '<div class="grid kpis" style="margin-top:0.8rem;">' +
      card("Daily Total", cents(vm.summary.totalDaily)) +
      card("Monthly Estimate", cents(vm.summary.totalMonthly)) +
      card("Standing > 90 Quantity", '<span class="warning">' + T.num(vm.summary.over90Qty) + '</span>') +
      card("By Owner - Contractor", cents(vm.summary.byOwner["Contractor Owned"] || 0)) +
      card("By Owner - Facility", cents(vm.summary.byOwner["Facility Owner Owned"] || 0)) +
      '</div>' +
      '<div class="card" style="margin-top:0.8rem;">' +
      '<h3 class="section-title">Summary By Scaffold / Area</h3>' +
      '<div class="table-wrap"><table>' +
      '<thead><tr><th>Bucket</th><th>Daily Charge (cents)</th></tr></thead><tbody>' +
      vm.summary.byScaffoldRows.concat(vm.summary.byAreaRows)
        .map(function (r) {
          return '<tr><td>' + T.esc(r.label) + '</td><td>' + cents(r.daily) + '</td></tr>';
        })
        .join("") +
      '</tbody></table></div>' +
      '</div>';
  }

  function renderAlerts(root, vm) {
    function section(title, items, cls) {
      var content = items.length
        ? '<ul class="alert-list">' + items.map(function (x) { return '<li>' + T.esc(x) + '</li>'; }).join("") + '</ul>'
        : '<div class="ok">No issues detected.</div>';
      return '<div class="card"><h4 class="' + (cls || "") + '">' + T.esc(title) + '</h4>' + content + '</div>';
    }

    root.innerHTML = '' +
      '<div class="grid">' +
      section("Contractor-Owned Standing > 90 Days", vm.contractorOver90, "danger") +
      section("Large Quantities Idle In Laydown", vm.idleLaydown, "warning") +
      section("High Daily Cost Scaffolds", vm.highDailyScaffolds, "warning") +
      section("Areas With Excessive Standing Material", vm.heavyAreas, "warning") +
      section("Potential Overbilling Risk Indicators", vm.overbillingIndicators, "danger") +
      '</div>';
  }

  function renderAdmin(root, vm) {
    root.innerHTML = '' +
      '<div class="panel-row">' +
      '<div class="card">' +
      '<h3 class="section-title">Rate Settings</h3>' +
      '<div class="form-grid">' +
      field("Contractor On Site", '<input id="rate-contractor-onSite" type="number" step="0.0001" value="' + vm.rates.contractorOwned.onSite + '" />') +
      field("Contractor Laydown", '<input id="rate-contractor-laydownYard" type="number" step="0.0001" value="' + vm.rates.contractorOwned.laydownYard + '" />') +
      field("Contractor Standing <= 90", '<input id="rate-contractor-standingUnder90" type="number" step="0.0001" value="' + vm.rates.contractorOwned.standingUnder90 + '" />') +
      field("Contractor Standing > 90", '<input id="rate-contractor-standingOver90" type="number" step="0.0001" value="' + vm.rates.contractorOwned.standingOver90 + '" />') +
      field("Facility Flat On-Site", '<input id="rate-facility-onSiteFlat" type="number" step="0.0001" value="' + vm.rates.facilityOwnerOwned.onSiteFlat + '" />') +
      '</div>' +
      '<button class="primary" data-action="save-rates">Save Rates</button> ' +
      '<button class="secondary" data-action="reset-rates">Reset Default Rates</button> ' +
      '<button class="secondary" data-action="reset-demo">Reset Demo Data</button>' +
      '</div>' +
      '<div class="card">' +
      '<h3 class="section-title">Code-Friendly Rate JSON</h3>' +
      '<pre class="codebox">' + T.esc(JSON.stringify(vm.rates, null, 2)) + '</pre>' +
      '<p style="font-size:0.82rem;color:#5f6b7a;">Billing engine reads this object in real time and recalculates all totals.</p>' +
      '</div>' +
      '</div>';
  }

  function field(label, controlHtml) {
    return '<div><label class="label">' + label + '</label>' + controlHtml + '</div>';
  }

  function card(label, valueHtml) {
    return '<div class="card"><div class="kpi-label">' + label + '</div><div class="kpi-value">' + valueHtml + '</div></div>';
  }

  function cents(v) {
    return T.num(v, 4) + " cents";
  }

  function badgeDays(days, status) {
    if (status !== "Standing") return "";
    if (days > 90) return ' <span class="badge badge-danger">>90d</span>';
    if (days > 60) return ' <span class="badge badge-warning">aging</span>';
    return ' <span class="badge badge-ok">fresh</span>';
  }

  window.Renderers = {
    renderDashboard: renderDashboard,
    renderScaffolds: renderScaffolds,
    renderMaterials: renderMaterials,
    renderBilling: renderBilling,
    renderAlerts: renderAlerts,
    renderAdmin: renderAdmin
  };
})();
