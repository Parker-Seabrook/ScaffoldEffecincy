(function () {
  window.SeedData = {
    project: {
      id: "PROJ-001",
      name: "Refinery Turnaround - Scaffold Efficiency Pilot",
      client: "Gulf Coast Facility Owner",
      timezone: "Etc/UTC",
      createdAt: "2026-01-01T08:00:00Z"
    },
    locations: [
      { id: "U100", name: "Unit 100 - Crude" },
      { id: "U200", name: "Unit 200 - Hydrotreater" },
      { id: "U300", name: "Unit 300 - Utilities" },
      { id: "YARD-A", name: "Main Laydown Yard A" }
    ],
    scaffolds: [
      {
        scaffoldId: "SCF-1001",
        description: "Pipe rack access tower",
        location: "Unit 100 - Crude",
        dateErected: "2026-03-12",
        lastModified: "2026-04-04T10:00:00Z",
        status: "Standing",
        ownerType: "Contractor Owned",
        materialQuantity: 1800,
        standingSince: "2026-03-12",
        statusHistory: [
          { status: "On Site", changedAt: "2026-03-10" },
          { status: "Standing", changedAt: "2026-03-12" }
        ],
        billingHistory: []
      },
      {
        scaffoldId: "SCF-2008",
        description: "Reactor maintenance scaffold",
        location: "Unit 200 - Hydrotreater",
        dateErected: "2025-11-20",
        lastModified: "2026-04-01T11:15:00Z",
        status: "Standing",
        ownerType: "Contractor Owned",
        materialQuantity: 2300,
        standingSince: "2025-11-20",
        statusHistory: [
          { status: "On Site", changedAt: "2025-11-17" },
          { status: "Standing", changedAt: "2025-11-20" }
        ],
        billingHistory: []
      },
      {
        scaffoldId: "SCF-3013",
        description: "Steam drum platform",
        location: "Unit 300 - Utilities",
        dateErected: "2026-02-15",
        lastModified: "2026-04-03T08:30:00Z",
        status: "Standing",
        ownerType: "Facility Owner Owned",
        materialQuantity: 1100,
        standingSince: "2026-02-15",
        statusHistory: [
          { status: "On Site", changedAt: "2026-02-14" },
          { status: "Standing", changedAt: "2026-02-15" }
        ],
        billingHistory: []
      },
      {
        scaffoldId: "SCF-1099",
        description: "Pump alley temporary support",
        location: "Unit 100 - Crude",
        dateErected: "2026-01-10",
        lastModified: "2026-03-25T14:00:00Z",
        status: "Dismantled",
        ownerType: "Contractor Owned",
        materialQuantity: 600,
        standingSince: "2026-01-10",
        statusHistory: [
          { status: "On Site", changedAt: "2026-01-08" },
          { status: "Standing", changedAt: "2026-01-10" },
          { status: "Dismantled", changedAt: "2026-03-25" }
        ],
        billingHistory: []
      }
    ],
    materials: [
      {
        materialId: "MAT-0001",
        materialType: "Ringlock Ledger",
        quantity: 650,
        ownershipType: "Contractor Owned",
        location: "Main Laydown Yard A",
        assignedScaffoldId: "",
        status: "Laydown Yard",
        datePlacedOnSite: "2026-02-01",
        dateStatusLastChanged: "2026-03-30",
        statusHistory: [
          { status: "On Site", changedAt: "2026-02-01" },
          { status: "Laydown Yard", changedAt: "2026-03-30" }
        ]
      },
      {
        materialId: "MAT-0002",
        materialType: "Ringlock Standard",
        quantity: 1200,
        ownershipType: "Contractor Owned",
        location: "Unit 100 - Crude",
        assignedScaffoldId: "SCF-1001",
        status: "Standing",
        datePlacedOnSite: "2026-03-09",
        dateStatusLastChanged: "2026-03-12",
        statusHistory: [
          { status: "On Site", changedAt: "2026-03-09" },
          { status: "Standing", changedAt: "2026-03-12" }
        ]
      },
      {
        materialId: "MAT-0003",
        materialType: "Base Plate",
        quantity: 600,
        ownershipType: "Contractor Owned",
        location: "Unit 200 - Hydrotreater",
        assignedScaffoldId: "SCF-2008",
        status: "Standing",
        datePlacedOnSite: "2025-11-18",
        dateStatusLastChanged: "2025-11-20",
        statusHistory: [
          { status: "On Site", changedAt: "2025-11-18" },
          { status: "Standing", changedAt: "2025-11-20" }
        ]
      },
      {
        materialId: "MAT-0004",
        materialType: "Toe Board",
        quantity: 1700,
        ownershipType: "Facility Owner Owned",
        location: "Unit 300 - Utilities",
        assignedScaffoldId: "SCF-3013",
        status: "Standing",
        datePlacedOnSite: "2026-02-13",
        dateStatusLastChanged: "2026-02-15",
        statusHistory: [
          { status: "On Site", changedAt: "2026-02-13" },
          { status: "Standing", changedAt: "2026-02-15" }
        ]
      },
      {
        materialId: "MAT-0005",
        materialType: "Access Stair",
        quantity: 450,
        ownershipType: "Facility Owner Owned",
        location: "Main Laydown Yard A",
        assignedScaffoldId: "",
        status: "On Site",
        datePlacedOnSite: "2026-03-20",
        dateStatusLastChanged: "2026-03-20",
        statusHistory: [
          { status: "On Site", changedAt: "2026-03-20" }
        ]
      },
      {
        materialId: "MAT-0006",
        materialType: "Diagonal Brace",
        quantity: 900,
        ownershipType: "Contractor Owned",
        location: "Unit 200 - Hydrotreater",
        assignedScaffoldId: "SCF-2008",
        status: "Standing",
        datePlacedOnSite: "2025-11-18",
        dateStatusLastChanged: "2025-11-20",
        statusHistory: [
          { status: "On Site", changedAt: "2025-11-18" },
          { status: "Standing", changedAt: "2025-11-20" }
        ]
      },
      {
        materialId: "MAT-0007",
        materialType: "Plank",
        quantity: 300,
        ownershipType: "Contractor Owned",
        location: "Unit 100 - Crude",
        assignedScaffoldId: "SCF-1099",
        status: "Dismantled",
        datePlacedOnSite: "2026-01-08",
        dateStatusLastChanged: "2026-03-25",
        statusHistory: [
          { status: "On Site", changedAt: "2026-01-08" },
          { status: "Standing", changedAt: "2026-01-10" },
          { status: "Dismantled", changedAt: "2026-03-25" }
        ]
      }
    ],
    billingHistory: []
  };
})();
