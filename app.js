(function () {
  var appState = Store.loadState();
  var rates = Store.loadRates();

  var ui = {
    activeTab: "dashboard",
    scaffoldFilters: {
      search: "",
      ownerType: "",
      status: "",
      sortBy: "scaffoldId"
    }
  };

  var panels = {
    dashboard: document.getElementById("dashboard"),
    scaffolds: document.getElementById("scaffolds"),
    materials: document.getElementById("materials"),
    billing: document.getElementById("billing"),
    alerts: document.getElementById("alerts"),
    admin: document.getElementById("admin")
  };

  init();

  function init() {
    ensureDataShape();
    recalcScaffoldMaterialQty();
    bindNavigation();
    bindEvents();
    renderAll();
  }

  function ensureDataShape() {
    appState.scaffolds = appState.scaffolds || [];
    appState.materials = appState.materials || [];
    appState.locations = appState.locations || [];
    appState.billingHistory = appState.billingHistory || [];

    appState.scaffolds.forEach(function (s) {
      s.statusHistory = s.statusHistory || [];
      s.billingHistory = s.billingHistory || [];
      if (!s.standingSince && s.status === "Standing") {
        s.standingSince = s.dateErected || DateUtils.todayIsoDate();
      }
    });

    appState.materials.forEach(function (m) {
      m.statusHistory = m.statusHistory || [];
    });
  }

  function bindNavigation() {
    document.getElementById("tabNav").addEventListener("click", function (event) {
      var button = event.target.closest(".tab-btn");
      if (!button) return;

      ui.activeTab = button.getAttribute("data-tab");

      Array.prototype.forEach.call(document.querySelectorAll(".tab-btn"), function (btn) {
        btn.classList.toggle("active", btn === button);
      });

      Object.keys(panels).forEach(function (key) {
        panels[key].classList.toggle("active", key === ui.activeTab);
      });

      if (ui.activeTab === "scaffolds") renderScaffoldsTab();
      if (ui.activeTab === "billing") renderBillingTab();
      if (ui.activeTab === "admin") renderAdminTab();
    });
  }

  function bindEvents() {
    document.body.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action]");
      if (!btn) return;

      var action = btn.getAttribute("data-action");
      var id = btn.getAttribute("data-id");

      if (action === "add-scaffold") addScaffold();
      if (action === "edit-scaffold") editScaffold(id);
      if (action === "change-scaffold-status") changeScaffoldStatus(id);
      if (action === "assign-material") assignMaterialToScaffold(id);

      if (action === "add-material") addMaterial();
      if (action === "edit-material") editMaterial(id);

      if (action === "simulate-billing") simulateBilling();

      if (action === "save-rates") saveRatesFromForm();
      if (action === "reset-rates") resetRates();
      if (action === "reset-demo") resetDemo();
    });

    document.body.addEventListener("input", function (event) {
      var id = event.target.id;
      if (id === "scaffoldSearch") {
        ui.scaffoldFilters.search = event.target.value;
        renderScaffoldsTab();
      }
    });

    document.body.addEventListener("change", function (event) {
      var id = event.target.id;
      if (id === "scaffoldOwnerFilter") {
        ui.scaffoldFilters.ownerType = event.target.value;
        renderScaffoldsTab();
      }
      if (id === "scaffoldStatusFilter") {
        ui.scaffoldFilters.status = event.target.value;
        renderScaffoldsTab();
      }
      if (id === "scaffoldSortBy") {
        ui.scaffoldFilters.sortBy = event.target.value;
        renderScaffoldsTab();
      }
    });
  }

  function renderAll() {
    updateHeader();
    renderDashboardTab();
    renderScaffoldsTab();
    renderMaterialsTab();
    renderBillingTab();
    renderAlertsTab();
    renderAdminTab();
  }

  function updateHeader() {
    var now = new Date().toISOString();
    document.getElementById("projectName").textContent = appState.project.name + " (" + appState.project.id + ")";
    document.getElementById("lastUpdated").textContent = "Last Updated: " + now.slice(0, 16).replace("T", " ");
  }

  function buildMaterialBillingRecords() {
    var today = DateUtils.todayIsoDate();
    return appState.materials.map(function (m) {
      var charge = BillingEngine.calcRecordCharge(m, rates, today);
      return {
        recordType: "Material",
        recordId: m.materialId,
        scaffoldId: m.assignedScaffoldId || "Unassigned",
        location: m.location,
        ownerType: m.ownershipType,
        status: m.status,
        daysStanding: charge.daysStanding,
        quantity: charge.quantity,
        applicableRate: charge.applicableRate,
        dailyCharge: charge.dailyCharge,
        monthlyEstimate: charge.monthlyEstimate,
        rule: charge.rule
      };
    });
  }

  function buildScaffoldRows() {
    var today = DateUtils.todayIsoDate();
    return appState.scaffolds.map(function (s) {
      var charge = BillingEngine.calcRecordCharge(s, rates, today);
      return {
        scaffoldId: s.scaffoldId,
        description: s.description,
        location: s.location,
        ownerType: s.ownerType,
        materialQuantity: s.materialQuantity,
        status: s.status,
        dateErected: s.dateErected,
        daysStanding: charge.daysStanding,
        rate: charge.applicableRate,
        dailyCost: charge.dailyCharge
      };
    });
  }

  function buildDashboardVm() {
    var records = buildMaterialBillingRecords();
    var active = appState.materials.filter(function (m) {
      return BillingEngine.isActiveStatus(m.status);
    });

    var totalOnSite = active.reduce(function (sum, m) { return sum + Number(m.quantity || 0); }, 0);
    var totalLaydown = appState.materials
      .filter(function (m) { return m.status === "Laydown Yard"; })
      .reduce(function (sum, m) { return sum + Number(m.quantity || 0); }, 0);
    var totalStanding = appState.materials
      .filter(function (m) { return m.status === "Standing"; })
      .reduce(function (sum, m) { return sum + Number(m.quantity || 0); }, 0);

    var totalStandingOver90 = records
      .filter(function (r) { return r.status === "Standing" && r.daysStanding > 90; })
      .reduce(function (sum, r) { return sum + r.quantity; }, 0);

    var daily = records.reduce(function (sum, r) { return sum + r.dailyCharge; }, 0);
    var monthly = BillingEngine.round(daily * 30);

    var contractorExposure = records
      .filter(function (r) { return r.ownerType === "Contractor Owned"; })
      .reduce(function (sum, r) { return sum + r.dailyCharge; }, 0);

    var facilityExposure = records
      .filter(function (r) { return r.ownerType === "Facility Owner Owned"; })
      .reduce(function (sum, r) { return sum + r.dailyCharge; }, 0);

    var utilizationPct = totalOnSite ? (totalStanding / totalOnSite) * 100 : 0;

    var alerts = records
      .filter(function (r) { return r.status === "Standing" && r.daysStanding > 90; })
      .map(function (r) {
        return r.recordId + " in " + r.location + " has stood for " + r.daysStanding + " days";
      });

    return {
      totalOnSite: totalOnSite,
      totalLaydown: totalLaydown,
      totalStanding: totalStanding,
      totalStandingOver90: totalStandingOver90,
      dailyBilling: daily,
      monthlyBilling: monthly,
      contractorExposure: contractorExposure,
      facilityExposure: facilityExposure,
      utilizationPct: utilizationPct,
      alerts: alerts
    };
  }

  function buildScaffoldVm() {
    var rows = buildScaffoldRows();
    var f = ui.scaffoldFilters;

    rows = rows.filter(function (r) {
      if (f.ownerType && r.ownerType !== f.ownerType) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.search) {
        var hay = (r.scaffoldId + " " + r.description + " " + r.location).toLowerCase();
        if (hay.indexOf(f.search.toLowerCase()) === -1) return false;
      }
      return true;
    });

    rows.sort(function (a, b) {
      if (f.sortBy === "dailyCost") return b.dailyCost - a.dailyCost;
      if (f.sortBy === "daysStanding") return b.daysStanding - a.daysStanding;
      return a.scaffoldId.localeCompare(b.scaffoldId);
    });

    return { rows: rows, filters: f };
  }

  function buildMaterialsVm() {
    var rows = appState.materials.slice().sort(function (a, b) {
      return a.materialId.localeCompare(b.materialId);
    });

    var totalsMap = {};
    appState.materials.forEach(function (m) {
      var key = m.ownershipType + " | " + m.status;
      totalsMap[key] = (totalsMap[key] || 0) + Number(m.quantity || 0);
    });

    var totals = Object.keys(totalsMap).sort().map(function (k) {
      return { label: k, quantity: totalsMap[k] };
    });

    return { rows: rows, totals: totals };
  }

  function buildBillingVm() {
    var records = buildMaterialBillingRecords();
    var byOwner = BillingEngine.aggregateBy(records, function (r) { return r.ownerType; }, function (r) { return r.dailyCharge; });
    var byScaffold = BillingEngine.aggregateBy(records, function (r) { return r.scaffoldId || "Unassigned"; }, function (r) { return r.dailyCharge; });
    var byArea = BillingEngine.aggregateBy(records, function (r) { return r.location; }, function (r) { return r.dailyCharge; });

    var totalDaily = records.reduce(function (s, r) { return s + r.dailyCharge; }, 0);
    var summary = {
      totalDaily: totalDaily,
      totalMonthly: BillingEngine.round(totalDaily * 30),
      over90Qty: records
        .filter(function (r) { return r.status === "Standing" && r.daysStanding > 90; })
        .reduce(function (s, r) { return s + r.quantity; }, 0),
      byOwner: byOwner,
      byScaffoldRows: Object.keys(byScaffold).sort().map(function (k) {
        return { label: "Scaffold: " + k, daily: BillingEngine.round(byScaffold[k]) };
      }),
      byAreaRows: Object.keys(byArea).sort().map(function (k) {
        return { label: "Area: " + k, daily: BillingEngine.round(byArea[k]) };
      })
    };

    return { records: records, summary: summary };
  }

  function buildAlertsVm() {
    var records = buildMaterialBillingRecords();

    var contractorOver90 = records
      .filter(function (r) {
        return r.ownerType === "Contractor Owned" && r.status === "Standing" && r.daysStanding > 90;
      })
      .map(function (r) {
        return r.recordId + " / " + r.location + " / " + r.daysStanding + " days / " + r.quantity + " units";
      });

    var idleLaydown = appState.materials
      .filter(function (m) { return m.status === "Laydown Yard" && Number(m.quantity) >= 500; })
      .map(function (m) {
        return m.materialId + " has " + m.quantity + " units idle in laydown at " + m.location;
      });

    var scaffoldRows = buildScaffoldRows();
    var highDailyScaffolds = scaffoldRows
      .filter(function (s) { return s.dailyCost >= 20; })
      .map(function (s) {
        return s.scaffoldId + " at " + s.location + " has high daily cost of " + BillingEngine.round(s.dailyCost) + " cents";
      });

    var standingByArea = {};
    appState.materials.forEach(function (m) {
      if (m.status === "Standing") {
        standingByArea[m.location] = (standingByArea[m.location] || 0) + Number(m.quantity || 0);
      }
    });

    var heavyAreas = Object.keys(standingByArea)
      .filter(function (area) { return standingByArea[area] >= 1500; })
      .map(function (area) {
        return area + " has " + standingByArea[area] + " standing units";
      });

    var overbillingIndicators = [];
    var activeContractor = records
      .filter(function (r) {
        return r.ownerType === "Contractor Owned" && (r.status === "Laydown Yard" || r.status === "Standing");
      })
      .reduce(function (s, r) { return s + r.quantity; }, 0);

    var activeFacility = records
      .filter(function (r) {
        return r.ownerType === "Facility Owner Owned" && BillingEngine.isActiveStatus(r.status);
      })
      .reduce(function (s, r) { return s + r.quantity; }, 0);

    if (activeContractor > activeFacility * 1.75) {
      overbillingIndicators.push("Contractor-owned active quantity is significantly higher than facility-owned baseline.");
    }

    records.forEach(function (r) {
      if (r.status === "Standing" && r.daysStanding > 120 && r.ownerType === "Contractor Owned") {
        overbillingIndicators.push(r.recordId + " has exceeded 120 standing days with premium rate exposure.");
      }
    });

    return {
      contractorOver90: contractorOver90,
      idleLaydown: idleLaydown,
      highDailyScaffolds: highDailyScaffolds,
      heavyAreas: heavyAreas,
      overbillingIndicators: overbillingIndicators
    };
  }

  function renderDashboardTab() {
    Renderers.renderDashboard(panels.dashboard, buildDashboardVm());
  }

  function renderScaffoldsTab() {
    Renderers.renderScaffolds(panels.scaffolds, buildScaffoldVm(), appState.locations);
  }

  function renderMaterialsTab() {
    Renderers.renderMaterials(panels.materials, buildMaterialsVm(), appState.scaffolds, appState.locations);
  }

  function renderBillingTab() {
    Renderers.renderBilling(panels.billing, buildBillingVm(), appState.scaffolds);
  }

  function renderAlertsTab() {
    Renderers.renderAlerts(panels.alerts, buildAlertsVm());
  }

  function renderAdminTab() {
    Renderers.renderAdmin(panels.admin, { rates: rates });
  }

  function persistAndRender() {
    snapshotBillingHistory();
    Store.saveState(appState);
    Store.saveRates(rates);
    recalcScaffoldMaterialQty();
    renderAll();
  }

  function snapshotBillingHistory() {
    var snap = {
      timestamp: new Date().toISOString(),
      totalDaily: buildBillingVm().summary.totalDaily
    };
    appState.billingHistory.push(snap);
    if (appState.billingHistory.length > 400) {
      appState.billingHistory = appState.billingHistory.slice(-400);
    }

    var today = DateUtils.todayIsoDate();
    appState.scaffolds.forEach(function (s) {
      var charge = BillingEngine.calcRecordCharge(s, rates, today);
      s.billingHistory.push({
        timestamp: snap.timestamp,
        dailyCharge: charge.dailyCharge,
        status: s.status,
        quantity: s.materialQuantity
      });
      if (s.billingHistory.length > 120) s.billingHistory = s.billingHistory.slice(-120);
    });
  }

  function recalcScaffoldMaterialQty() {
    appState.scaffolds.forEach(function (scaffold) {
      scaffold.materialQuantity = appState.materials
        .filter(function (m) {
          return m.assignedScaffoldId === scaffold.scaffoldId && m.status !== "Removed Off Site";
        })
        .reduce(function (sum, m) { return sum + Number(m.quantity || 0); }, 0);
    });
  }

  function addScaffold() {
    var id = value("newScaffoldId").trim();
    if (!id) return alert("Scaffold ID is required.");
    if (appState.scaffolds.some(function (s) { return s.scaffoldId === id; })) {
      return alert("Scaffold ID already exists.");
    }

    var status = value("newScaffoldStatus");
    var date = value("newScaffoldDate") || DateUtils.todayIsoDate();

    appState.scaffolds.push({
      scaffoldId: id,
      description: value("newScaffoldDesc"),
      location: value("newScaffoldLocation"),
      dateErected: date,
      lastModified: new Date().toISOString(),
      status: status,
      ownerType: value("newScaffoldOwner"),
      materialQuantity: Number(value("newScaffoldQty") || 0),
      standingSince: status === "Standing" ? date : "",
      statusHistory: [{ status: status, changedAt: DateUtils.todayIsoDate() }],
      billingHistory: []
    });

    persistAndRender();
  }

  function editScaffold(scaffoldId) {
    var scaffold = appState.scaffolds.find(function (s) { return s.scaffoldId === scaffoldId; });
    if (!scaffold) return;

    var desc = prompt("Description", scaffold.description);
    if (desc == null) return;
    var location = prompt("Location", scaffold.location);
    if (location == null) return;
    var owner = prompt("Owner Type (Contractor Owned / Facility Owner Owned)", scaffold.ownerType);
    if (owner == null) return;

    scaffold.description = desc;
    scaffold.location = location;
    scaffold.ownerType = owner;
    scaffold.lastModified = new Date().toISOString();

    persistAndRender();
  }

  function changeScaffoldStatus(scaffoldId) {
    var scaffold = appState.scaffolds.find(function (s) { return s.scaffoldId === scaffoldId; });
    if (!scaffold) return;

    var status = prompt("New status (On Site, Laydown Yard, Standing, Dismantled, Removed Off Site)", scaffold.status);
    if (status == null || !status.trim()) return;
    status = status.trim();

    scaffold.status = status;
    scaffold.lastModified = new Date().toISOString();
    scaffold.statusHistory.push({ status: status, changedAt: DateUtils.todayIsoDate() });

    if (status === "Standing") scaffold.standingSince = DateUtils.todayIsoDate();

    appState.materials.forEach(function (m) {
      if (m.assignedScaffoldId === scaffoldId && m.status !== "Removed Off Site") {
        m.status = status;
        m.location = scaffold.location;
        m.dateStatusLastChanged = DateUtils.todayIsoDate();
        m.statusHistory.push({ status: status, changedAt: DateUtils.todayIsoDate() });
      }
    });

    persistAndRender();
  }

  function assignMaterialToScaffold(scaffoldId) {
    var materialId = prompt("Material ID to assign to scaffold " + scaffoldId + ":");
    if (!materialId) return;

    var material = appState.materials.find(function (m) { return m.materialId === materialId.trim(); });
    if (!material) return alert("Material not found.");

    var scaffold = appState.scaffolds.find(function (s) { return s.scaffoldId === scaffoldId; });
    if (!scaffold) return;

    material.assignedScaffoldId = scaffoldId;
    material.location = scaffold.location;
    material.status = scaffold.status;
    material.dateStatusLastChanged = DateUtils.todayIsoDate();
    material.statusHistory.push({ status: material.status, changedAt: DateUtils.todayIsoDate() });

    persistAndRender();
  }

  function addMaterial() {
    var id = value("newMaterialId").trim();
    if (!id) return alert("Material ID is required.");
    if (appState.materials.some(function (m) { return m.materialId === id; })) {
      return alert("Material ID already exists.");
    }

    var status = value("newMaterialStatus");
    var assignedScaffoldId = value("newMaterialScaffold");
    var location = value("newMaterialLocation");

    if (assignedScaffoldId) {
      var scaffold = appState.scaffolds.find(function (s) { return s.scaffoldId === assignedScaffoldId; });
      if (scaffold) {
        location = scaffold.location;
        if (status === "On Site") status = scaffold.status;
      }
    }

    appState.materials.push({
      materialId: id,
      materialType: value("newMaterialType"),
      quantity: Number(value("newMaterialQty") || 0),
      ownershipType: value("newMaterialOwner"),
      location: location,
      assignedScaffoldId: assignedScaffoldId,
      status: status,
      datePlacedOnSite: value("newMaterialPlacedDate") || DateUtils.todayIsoDate(),
      dateStatusLastChanged: DateUtils.todayIsoDate(),
      standingSince: status === "Standing" ? DateUtils.todayIsoDate() : "",
      statusHistory: [{ status: status, changedAt: DateUtils.todayIsoDate() }]
    });

    persistAndRender();
  }

  function editMaterial(materialId) {
    var material = appState.materials.find(function (m) { return m.materialId === materialId; });
    if (!material) return;

    var qtyRaw = prompt("Quantity", material.quantity);
    if (qtyRaw == null) return;
    var owner = prompt("Owner Type (Contractor Owned / Facility Owner Owned)", material.ownershipType);
    if (owner == null) return;
    var status = prompt("Status (On Site, Laydown Yard, Standing, Dismantled, Removed Off Site)", material.status);
    if (status == null) return;
    var scaffoldId = prompt("Assigned Scaffold ID (blank for laydown/unassigned)", material.assignedScaffoldId || "");
    if (scaffoldId == null) return;

    material.quantity = Number(qtyRaw || 0);
    material.ownershipType = owner;
    material.status = status;
    material.assignedScaffoldId = scaffoldId.trim();
    material.dateStatusLastChanged = DateUtils.todayIsoDate();
    material.statusHistory.push({ status: material.status, changedAt: DateUtils.todayIsoDate() });

    if (material.status === "Standing") {
      material.standingSince = material.standingSince || DateUtils.todayIsoDate();
    }

    if (material.assignedScaffoldId) {
      var scaffold = appState.scaffolds.find(function (s) { return s.scaffoldId === material.assignedScaffoldId; });
      if (scaffold) material.location = scaffold.location;
    }

    persistAndRender();
  }

  function simulateBilling() {
    var scaffoldId = value("billingSimScaffold");
    var newStatus = value("billingSimStatus");

    var scaffold = appState.scaffolds.find(function (s) { return s.scaffoldId === scaffoldId; });
    if (!scaffold) return;

    var today = DateUtils.todayIsoDate();
    var current = BillingEngine.calcRecordCharge(scaffold, rates, today);

    var simulated = JSON.parse(JSON.stringify(scaffold));
    simulated.status = newStatus;
    if (newStatus === "Standing" && !simulated.standingSince) simulated.standingSince = today;
    var changed = BillingEngine.calcRecordCharge(simulated, rates, today);

    var delta = BillingEngine.round(changed.dailyCharge - current.dailyCharge);
    var result = "Current: " + current.dailyCharge + " cents/day | Simulated: " + changed.dailyCharge + " cents/day | Delta: " + delta + " cents/day";
    var resultNode = document.getElementById("billingSimResult");
    if (resultNode) resultNode.textContent = result;
  }

  function saveRatesFromForm() {
    rates.contractorOwned.onSite = Number(value("rate-contractor-onSite") || 0);
    rates.contractorOwned.laydownYard = Number(value("rate-contractor-laydownYard") || 0);
    rates.contractorOwned.standingUnder90 = Number(value("rate-contractor-standingUnder90") || 0);
    rates.contractorOwned.standingOver90 = Number(value("rate-contractor-standingOver90") || 0);
    rates.facilityOwnerOwned.onSiteFlat = Number(value("rate-facility-onSiteFlat") || 0);

    persistAndRender();
  }

  function resetRates() {
    rates = Store.resetRates();
    renderAll();
  }

  function resetDemo() {
    appState = Store.resetState();
    ensureDataShape();
    recalcScaffoldMaterialQty();
    renderAll();
  }

  function value(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }
})();
