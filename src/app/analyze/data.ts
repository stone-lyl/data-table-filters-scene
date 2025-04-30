import { subDays, subHours, subMinutes } from "date-fns";
import type { ColumnSchema } from "./types";

export const data = [
  {
    id: "1",
    // name: "Edge Api",
    firstName: "John",
    lastName: "Smith",
    url: "edge-api.acme.com/health",
    p95: 140,
    public: true,
    active: true,
    regions: ["ams", "gru", "syd"],
    tags: ["api", "enterprise"],
    date: subHours(new Date(), 1),
    cost: 1250.75, // Will display as 1.25k
    earning: 980.50, // Lower than cost
    bigNumber: "90054",
    btcAmount: "1.23456789", // 8 decimal places
  },
  {
    id: "2",
    // name: "Lambda Api",
    firstName: "John",
    lastName: "Doe",
    url: "lambda-api.acme.com/health",
    p95: 203,
    public: true,
    active: true,
    regions: ["ams", "gru", "syd"],
    tags: ["api"],
    date: subHours(new Date(), 10),
    cost: 8750.50, // Will display as 8.75k
    earning: 12500.75, // Higher than cost
    bigNumber: "18014394",
    btcAmount: "0.00123456", // 8 decimal places
  },

  {
    id: "3",
    // name: "App",
    firstName: "Sarah",
    lastName: "Davis",
    url: "app.acme.com",
    p95: 1301,
    public: false,
    active: true,
    regions: ["iad", "fra"],
    tags: ["app"],
    date: subHours(new Date(), 13),
    cost: 32000.00, // Will display as 32.00k
    earning: 29750.25, // Lower than cost
    bigNumber: "3602863968",
    btcAmount: "2.50000000", // 8 decimal places
  },
  {
    id: "4",
    // name: "Demo",
    firstName: "David",
    lastName: "Wilson",
    url: "demo.acme.com",
    p95: 2420,
    public: true,
    active: true,
    regions: ["iad"],
    tags: ["web", "enterprise"],
    date: subDays(new Date(), 4),
    cost: 450.25, // Will display as regular currency
    earning: 675.80, // Higher than cost
    bigNumber: "72057594037927936", // 2^56
    btcAmount: "0.10000001", // 8 decimal places
  },
  {
    id: "5",
    // name: "Documentation",
    firstName: "Jennifer",
    lastName: "Taylor",
    url: "docs.acme.com",
    p95: 943,
    public: true,
    active: true,
    regions: ["ams"],
    tags: ["api", "web"],
    date: subDays(new Date(), 6),
    cost: 125.99, // Will display as regular currency
    earning: 95.50, // Lower than cost
    bigNumber: "144115188075855872", // 2^57
    btcAmount: "5.67890123", // 8 decimal places
  },
  {
    id: "6",
    // name: "Boilerplate",
    firstName: "Robert",
    lastName: "Anderson",
    url: "boilerplate.acme.com",
    p95: undefined,
    public: true,
    active: false,
    regions: ["gru", "fra"],
    tags: ["web"],
    date: subDays(new Date(), 10),
    cost: 0,
    earning: 150.25, // Higher than cost (cost is 0)
    bigNumber: "288230376151711744", // 2^58
    btcAmount: "0.00000001", // 8 decimal places (smallest unit)
  },
  {
    id: "7",
    // name: "Dashboard",
    firstName: "Lisa",
    lastName: "Martinez",
    url: "app.acme.com/dashboard",
    p95: 967,
    public: false,
    active: true,
    regions: ["iad", "fra"],
    tags: ["web"],
    date: subHours(new Date(), 28),
    cost: 750000.49, // Will display as 750.00k
    earning: 566600,
    bigNumber: "576460752303423488", // 2^59
    btcAmount: "10.00000000", // 8 decimal places
  },
  {
    id: "8",
    // name: "E2E Testing",
    firstName: "Daniel",
    lastName: "Thompson",
    url: "staging-cypress-e2e.acme.com",
    p95: 1954,
    public: false,
    active: true,
    regions: ["iad"],
    tags: ["web"],
    date: subDays(new Date(), 12),
    cost: 1899999.99, // Will display as 1.90M
    earning:1899999, 
    bigNumber: "1152921504606846976", // 2^60
    btcAmount: "0.12345678", // 8 decimal places
  },
  {
    id: "9",
    // name: "Web App",
    firstName: "Lisa",
    lastName: "Garcia",
    url: "web-app.acme.com",
    p95: 1043,
    public: true,
    active: true,
    regions: ["iad"],
    tags: ["web"],
    date: subDays(new Date(), 15),
    cost: 2500000.00, // Will display as 2.50M
    earning: 260000.00,
    bigNumber: "2305843009213693952", // 2^61
    btcAmount: "3.14159265", // 8 decimal places (truncated)
  },
  {
    id: "10",
    // name: "Admin Panel",
    firstName: "Lisa",
    lastName: "Rodriguez",
    url: "admin.acme.com",
    p95: 1342,
    public: false,
    active: true,
    regions: ["gru", "syd"],
    tags: ["web"],
    date: subHours(new Date(), 5),
    cost: 1050.75,
    earning: 0,
    bigNumber: "4611686018427387904", // 2^62
    btcAmount: "0.87654321", // 8 decimal places
  },
  {
    id: "11",
    // name: "API Gateway",
    firstName: "Lisa",
    lastName: "Lee",
    url: "api-gateway.acme.com/health",
    p95: 190,
    public: true,
    active: true,
    regions: ["ams", "hkg"],
    tags: ["api", "enterprise"],
    date: subHours(new Date(), 3),
    cost: 5250500.00, // Will display as 5.25M
    earning: 5950500.00,
    bigNumber: "9223372036854775808", // 2^63
    btcAmount: "21.00000000", // 8 decimal places (max supply)
  },
  {
    id: "12",
    // name: "Analytics Service",
    firstName: "Andrew",
    lastName: "Clark",
    url: "analytics.acme.com",
    p95: 810,
    public: true,
    active: true,
    regions: ["iad", "fra", "hkg"],
    tags: ["app", "enterprise"],
    date: subDays(new Date(), 2),
    cost: 8750250.00, // Will display as 8.75M
    earning: 3750250.00,
    bigNumber: "18446744073709551616", // 2^64
    btcAmount: "0.00050000", // 8 decimal places
  },
  {
    id: "13",
    // name: "Storybook",
    firstName: "Emma",
    lastName: "Johnson",
    url: "storybook.acme.com",
    p95: 1252,
    public: false,
    active: true,
    regions: ["iad"],
    tags: ["web"],
    date: subMinutes(new Date(), 10),
    cost: 350.00,
    earning: 300.00,
    bigNumber: "36893488147419103232", // 2^65
    btcAmount: "1.00000000", // 8 decimal places
  },
  {
    id: "14",
    // name: "Marketing",
    firstName: "Michael",
    lastName: "Brown",
    url: "acme.com",
    p95: 659,
    public: true,
    active: true,
    regions: ["hkg", "fra", "iad"],
    tags: ["web"],
    date: subDays(new Date(), 1),
    cost: 12500990.00, // Will display as 12.50M
    earning: 150090.00, // Will display as 12.50M
    bigNumber: "73786976294838206464", // 2^66
    btcAmount: "0.33333333", // 8 decimal places
  },
  {
    id: "15",
    // name: "Support Portal",
    firstName: "Michelle",
    lastName: "Lewis",
    url: "support.acme.com",
    p95: 752,
    public: true,
    active: true,
    regions: ["gru", "iad"],
    tags: ["web"],
    date: subMinutes(new Date(), 30),
    cost: 950.25,
    earning: 911,
    bigNumber: "147573952589676412928", // 2^67
    btcAmount: "0.05555555", // 8 decimal places
  },
  {
    id: "16",
    // name: "User Management",
    firstName: "Michelle",
    lastName: "Walker",
    url: "user-mgmt.acme.com",
    p95: 980,
    public: false,
    active: true,
    regions: ["gru", "syd", "fra"],
    tags: ["app"],
    date: subDays(new Date(), 7),
    cost: 1850.50,
    earning: 2900,
    bigNumber: "295147905179352825856", // 2^68
    btcAmount: "0.99999999", // 8 decimal places
  },
  {
    id: "17",
    // name: "Payment Gateway",
    firstName: "Elizabeth",
    lastName: "Hall",
    url: "payments.acme.com",
    p95: 156,
    public: true,
    active: true,
    regions: ["ams", "hkg", "syd"],
    tags: ["api", "enterprise"],
    date: subHours(new Date(), 8),
    cost: 7500.00,
    earning: 12330,
    bigNumber: "590295810358705651712", // 2^69
    btcAmount: "0.00000100", // 8 decimal places
  },
  {
    id: "18",
    // name: "Notification Service",
    firstName: "Ryan",
    lastName: "Young",
    url: "notify.acme.com",
    p95: 345,
    public: false,
    active: true,
    regions: ["iad"],
    tags: ["api"],
    date: subDays(new Date(), 11),
    cost: 625.75,
    earning: 233.43,
    bigNumber: "1180591620717411303424", // 2^70
    btcAmount: "0.01010101", // 8 decimal places
  },
  {
    id: "19",
    // name: "File Storage",
    firstName: "Sophia",
    lastName: "Allen",
    url: "storage.acme.com",
    p95: 1220,
    public: true,
    active: true,
    regions: ["gru", "hkg"],
    tags: ["web", "enterprise"],
    date: subDays(new Date(), 3),
    cost: 4250.50,
    earning: 2391.32,
    bigNumber: "2361183241434822606848", // 2^71
    btcAmount: "0.10101010", // 8 decimal places
  },
  {
    id: "20",
    // name: "CDN",
    firstName: "Sophia",
    lastName: "King",
    url: "cdn.acme.com",
    p95: 89,
    public: true,
    active: true,
    regions: ["ams", "iad", "hkg"],
    tags: ["web"],
    date: subDays(new Date(), 2),
    cost: 9999.99,
    earning: 100003,
    bigNumber: "4722366482869645213696", // 2^72
    btcAmount: "15.55555555", // 8 decimal places
  },
  {
    id: "21",
    // name: "Auth Service",
    firstName: "Olivia",
    lastName: "Green",
    url: "auth.acme.com",
    p95: 542,
    public: false,
    active: true,
    regions: ["gru", "syd"],
    tags: ["api"],
    date: subHours(new Date(), 16),
    cost: 2100.25,
    earning: 31021.22,
    bigNumber: "9444732965739290427392", // 2^73
    btcAmount: "0.00777777", // 8 decimal places
  },
] satisfies ColumnSchema[];
