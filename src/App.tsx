/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  DollarSign, 
  Truck, 
  Clock, 
  ChevronDown, 
  Menu, 
  X,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  Filler,
  LogarithmicScale
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  LogarithmicScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- CONSTANTS ---
const BRAND_PRIMARY = "#5C2A0E"; // Deep Brown
const BRAND_GOLD = "#D4A017";    // Gold/Amber
const BRAND_DARK = "#0c0d0e";
const BRAND_SURFACE = "#1a1b1e";
const BRAND_TEAL = "#14b8a6";
const BRAND_GRAY = "#f4f4f4";

const SITES = ["BSI", "BTR", "MTI", "PANI", "SCM"] as const;
type Site = (typeof SITES)[number];

// --- HARDCODED DATA ---
const MONTHS = ["Jan", "Feb", "Mar"];

const SITE_COLORS: Record<string, string> = {
  BSI: BRAND_GOLD,
  BTR: BRAND_TEAL,
  MTI: "#3b82f6",
  PANI: "#a855f7",
  SCM: "#6b7280",
};

// Overview Data
const OVERVIEW_KPIS = {
  mtd: {
    logisticCost: 2.11, // $M
    goodsValue: 56.6, // $M
    costPercent: 3.72, // %
  },
  ytd: {
    logisticCost: 5.43, // $M
    goodsValue: 122.6, // $M
    costPercent: 4.43, // %
  }
};

const MONTHLY_TREND_DATA = {
  labels: MONTHS,
  logisticCost: [1.6, 1.9, 2.11],
  goodsValue: [38.8, 40.8, 56.6],
  costPercent: [4.12, 4.65, 5.44],
};

const SITE_SHARE_MTD = {
  cost: {
    BSI: 0.70, BTR: 0.51, MTI: 0.40, PANI: 0.30, SCM: 0.21
  },
  value: {
    BSI: 24.0, BTR: 12.0, MTI: 10.0, PANI: 6.0, SCM: 4.6
  }
};

// Unit Cost Data
const UNIT_COST_DATA = {
  perTon: {
    BSI: [73, 66, 120],
    BTR: [145, 130, 185],
    MTI: [233, 269, 269],
    PANI: [263, 148, 193],
    SCM: [353, 268, 278],
    ytd: { BSI: 87, BTR: 151, MTI: 256, PANI: 192, SCM: 296 }
  },
  perCbm: {
    BSI: [25, 12, 58],
    BTR: [58, 57, 60],
    MTI: [107, 131, 100],
    PANI: [102, 50, 50],
    SCM: [87, 90, 110],
    ytd: { BSI: 24, BTR: 58, MTI: 111, PANI: 57, SCM: 93 }
  }
};

const COMMODITY_DATA = [
  { site: "BTR", commodity: "Copper", mtd: 506, ytd: 2145, unit: "TON" },
  { site: "BTR", commodity: "Pyrite", mtd: 52817, ytd: 138171, unit: "TON" },
  { site: "BSI", commodity: "Doré", mtd: 3109, ytd: 10970, unit: "KG" },
  { site: "PANI", commodity: "Doré", mtd: 58, ytd: 102, unit: "KG" },
];

// Freight Operations Data
const FREIGHT_DATA = {
  air: {
    BSI: [8, 10, 11], BTR: [2, 4, 3], MTI: [12, 6, 7], PANI: [20, 16, 12], SCM: [15, 9, 8]
  },
  sea: {
    labels: ["Mar-26", "YTD"],
    types: ["LCT BSI/MRW/GTO", "LCT BTR", "Public Vessel"],
    mar: [4, 21, 26],
    ytd: [12, 91, 110]
  },
  land: {
    labels: MONTHS,
    types: ["Low Bed HE", "Trailer 20/40ft", "Bulk Cement 20T", "Fuel Truck", "Tronton/Fuso/CDD"],
    data: [
      [8, 15, 41],
      [136, 75, 81],
      [158, 147, 210],
      [898, 1081, 1174],
      [1774, 2288, 2624]
    ]
  }
};

// Transit Time Data
const TRANSIT_DATA = {
  trend: [5.8, 4.7, 4.7],
  hubs: ["Jakarta", "Surabaya", "Makassar", "Bungku"],
  matrix: {
    Jakarta: { BSI: 1.8, BTR: 3.3, MTI: 5.8, PANI: 6.0, SCM: 5.9 },
    Surabaya: { BSI: 0.9, BTR: 1.1, MTI: 4.8, PANI: 5.5, SCM: 4.6 },
    Makassar: { BSI: null, BTR: null, MTI: 5.8, PANI: 4.2, SCM: 6.8 },
    Bungku: { BSI: null, BTR: null, MTI: 4.9, PANI: null, SCM: 5.5 },
  }
};

// --- COMPONENTS ---

const Card = ({ children, className, title, borderAccent }: { children: React.ReactNode; className?: string; title?: string; borderAccent?: string }) => (
  <div className={cn(
    "bg-[#1a1b1e] p-4 border border-gray-800 rounded flex flex-col",
    borderAccent === "teal" && "border-b-2 border-b-teal-500",
    borderAccent === "gold" && "border-b-2 border-b-[#D4A017]",
    className
  )}>
    {title && <h3 className="text-[11px] font-bold uppercase text-gray-400 mb-4 tracking-wider">{title}</h3>}
    {children}
  </div>
);

const KPICard = ({ label, value, delta, sublabel, variant = "neutral" }: { label: string; value: string; delta?: string; sublabel?: string; variant?: "neutral" | "teal" | "gold" }) => {
  const isUp = delta?.startsWith("▲");
  return (
    <div className={cn(
      "bg-[#1a1b1e] p-3 border border-gray-800 rounded flex flex-col justify-between h-24",
      variant === "teal" && "border-b-2 border-b-teal-500",
      variant === "gold" && "border-b-2 border-b-[#D4A017]"
    )}>
      <p className="text-[11px] text-gray-400 uppercase tracking-tight font-medium">{label}</p>
      <div className="flex items-end justify-between">
        <span className={cn(
          "text-2xl font-semibold",
          variant === "neutral" ? "text-white" : variant === "teal" ? "text-teal-400" : "text-[#D4A017]"
        )}>{value}</span>
        {delta && (
          <span className={cn("text-[10px] font-bold", isUp ? "text-red-500" : "text-green-500")}>
            {delta}
          </span>
        )}
        {sublabel && (
          <span className="text-[10px] text-gray-500 tracking-tighter uppercase font-bold">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

const PageHeader = ({ title }: { title: string }) => (
  <div className="mb-6">
    <h2 className="text-xl font-medium text-white">{title}</h2>
  </div>
);

const Table = ({ headers, rows, totals }: { headers: string[]; rows: any[][]; totals?: any[] }) => (
  <div className="overflow-x-auto border border-gray-800 rounded bg-[#1a1b1e]">
    <table className="w-full text-left text-xs border-collapse">
      <thead className="bg-[#111214] text-gray-500 uppercase tracking-wider sticky top-0">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-4 py-3 font-bold border-b border-gray-800">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-gray-800 hover:bg-[#2a2b2e]/30 transition-colors">
            {row.map((cell, j) => (
              <td key={j} className={cn("px-4 py-3 text-gray-300", typeof cell === "number" && "text-right font-mono")}>
                {typeof cell === "number" && !headers[j].includes("%") ? cell.toLocaleString() : cell}
              </td>
            ))}
          </tr>
        ))}
        {totals && (
          <tr className="bg-[#111214] font-bold text-white border-t border-gray-700">
            {totals.map((t, i) => (
              <td key={i} className={cn("px-4 py-3", typeof t === "number" && "text-right font-mono")}>
                {typeof t === "number" ? t.toLocaleString() : t}
              </td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// --- PAGES ---

function OverviewPage() {
  const trendData = {
    labels: MONTHS,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Logistic Cost ($M)',
        data: MONTHLY_TREND_DATA.logisticCost,
        backgroundColor: BRAND_GOLD,
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'line' as const,
        label: 'Goods Value ($M)',
        data: MONTHLY_TREND_DATA.goodsValue,
        borderColor: BRAND_TEAL,
        borderWidth: 2,
        pointRadius: 4,
        fill: false,
        yAxisID: 'y1',
        order: 1,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Cost ($M)', color: '#9ca3af' },
        grid: { color: '#374151' },
        ticks: { color: '#9ca3af' }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'Value ($M)', color: '#9ca3af' },
        grid: { drawOnChartArea: false },
        ticks: { color: '#9ca3af' }
      },
      x: {
        ticks: { color: '#9ca3af' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { theme: 'dark' }
    }
  };

  const donutConfig = (data: Record<string, number>, label: string) => ({
    labels: SITES,
    datasets: [{
      data: SITES.map(s => data[s]),
      backgroundColor: SITES.map(s => SITE_COLORS[s]),
      borderColor: '#1a1b1e',
      borderWidth: 2,
      hoverOffset: 4
    }],
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Total Logistic Cost (MTD)" value={`$${OVERVIEW_KPIS.mtd.logisticCost}M`} delta="▲ 4.2%" />
        <KPICard label="Total Goods Value (MTD)" value={`$${OVERVIEW_KPIS.mtd.goodsValue}M`} delta="▼ 1.8%" />
        <KPICard label="Logistics Cost % (MTD)" value={`${OVERVIEW_KPIS.mtd.costPercent}%`} sublabel="Target 5.00%" variant="teal" />
        <KPICard label="Total Logistic Cost (YTD)" value={`$${OVERVIEW_KPIS.ytd.logisticCost}M`} />
        <KPICard label="Total Goods Value (YTD)" value={`$${OVERVIEW_KPIS.ytd.goodsValue}M`} />
        <KPICard label="Logistics Cost % (YTD)" value={`${OVERVIEW_KPIS.ytd.costPercent}%`} variant="teal" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Card title="Monthly Logistic Cost vs. Goods Value" className="col-span-12 lg:col-span-8 h-80">
          <div className="flex-1 min-h-0">
            <Bar data={trendData} options={trendOptions} />
          </div>
        </Card>
        <Card title="Logistics Cost % Trend" className="col-span-12 lg:col-span-4 h-80">
          <div className="space-y-6 mt-4">
            {MONTHS.map((month, idx) => {
              const val = MONTHLY_TREND_DATA.costPercent[idx];
              const isOver = val > 5;
              return (
                <div key={month}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400 font-bold uppercase">{month} 2026</span>
                    <span className={cn("font-bold", isOver ? "text-amber-500" : "text-teal-400")}>{val}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full", isOver ? "bg-amber-500" : "bg-teal-500")} 
                      style={{ width: `${(val / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            <div className="pt-4 border-t border-gray-800">
               <p className="text-[10px] text-gray-500 flex items-start gap-2">
                 <Info className="w-3 h-3 mt-0.5 shrink-0" />
                 Target threshold is 5.0%. Values above this limit are highlighted in amber.
               </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Cost Share by Site MTD">
          <div className="flex flex-col sm:flex-row items-center gap-8 h-52">
            <div className="w-40 h-40">
              <Doughnut data={donutConfig(SITE_SHARE_MTD.cost, "Cost")} options={{ plugins: { legend: { display: false } }, cutout: '70%' }} />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-y-2 gap-x-4">
              {SITES.map(site => {
                const val = SITE_SHARE_MTD.cost[site];
                const total = OVERVIEW_KPIS.mtd.logisticCost;
                const pct = Math.round((val / total) * 100);
                return (
                  <div key={site} className="flex items-center gap-2 text-[11px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SITE_COLORS[site] }}></div>
                    <span className="text-gray-400 font-bold uppercase w-10">{site}</span>
                    <span className="text-gray-300 ml-auto font-mono text-right flex-1">${val.toFixed(2)}M ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
        <Card title="Goods Value Share by Site MTD">
          <div className="flex flex-col sm:flex-row items-center gap-8 h-52">
            <div className="w-40 h-40">
              <Doughnut data={donutConfig(SITE_SHARE_MTD.value, "Value")} options={{ plugins: { legend: { display: false } }, cutout: '70%' }} />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-y-2 gap-x-4">
              {SITES.map(site => {
                const val = SITE_SHARE_MTD.value[site];
                const total = OVERVIEW_KPIS.mtd.goodsValue;
                const pct = Math.round((val / total) * 100);
                return (
                  <div key={site} className="flex items-center gap-2 text-[11px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SITE_COLORS[site] }}></div>
                    <span className="text-gray-400 font-bold uppercase w-10">{site}</span>
                    <span className="text-gray-300 ml-auto font-mono text-right flex-1">${val.toFixed(1)}M ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CostBySitePage() {
  const tableRows = SITES.map(site => {
    const costMtd = SITE_SHARE_MTD.cost[site];
    const valueMtd = SITE_SHARE_MTD.value[site];
    const pctMtd = ((costMtd / valueMtd) * 100).toFixed(2);
    // Rough estimate for YTD based on share
    return [site, `$${costMtd}M`, `$${valueMtd}M`, `${pctMtd}%`, "...", "...", "..."];
  });

  const costVsYtdData = {
    labels: SITES,
    datasets: [
      {
        label: 'MTD Cost ($M)',
        data: SITES.map(s => SITE_SHARE_MTD.cost[s]),
        backgroundColor: BRAND_GOLD,
      },
      {
        label: 'YTD Cost ($M)',
        data: SITES.map(s => SITE_SHARE_MTD.cost[s] * 2.5), // Simulated YTD
        backgroundColor: '#4b5563',
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Logistics Cost MTD vs YTD by Site ($M)" className="h-80">
          <Bar data={costVsYtdData} options={{ 
            responsive: true, 
            maintainAspectRatio: false,
            scales: { y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }, x: { ticks: { color: '#9ca3af' } } },
            plugins: { legend: { display: true, position: 'bottom', labels: { color: '#9ca3af' } } }
          }} />
        </Card>
        <Card title="Goods Value MTD vs YTD by Site ($M)" className="h-80">
          <Bar data={{
            labels: SITES,
            datasets: [
              { label: 'MTD Value', data: SITES.map(s => SITE_SHARE_MTD.value[s]), backgroundColor: BRAND_TEAL },
              { label: 'YTD Value', data: SITES.map(s => SITE_SHARE_MTD.value[s] * 2.1), backgroundColor: '#4b5563' }
            ]
          }} options={{ 
            responsive: true, 
            maintainAspectRatio: false,
            scales: { y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }, x: { ticks: { color: '#9ca3af' } } },
            plugins: { legend: { display: true, position: 'bottom', labels: { color: '#9ca3af' } } }
          }} />
        </Card>
      </div>

      <Card title="YTD Cost % by Site (Target 5%)" className="h-80">
        <Bar 
          data={{
            labels: SITES,
            datasets: [{
              label: 'Cost %',
              data: [4.8, 5.2, 3.9, 6.1, 4.4], // Example YTD % per site
              backgroundColor: (ctx) => (ctx.raw as number) > 5 ? '#f59e0b' : '#14b8a6',
            }]
          }} 
          options={{
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { 
                grid: { color: '#374151' }, 
                ticks: { color: '#9ca3af' },
                max: 8
              },
              y: { ticks: { color: '#9ca3af' } }
            },
            plugins: {
              legend: { display: false },
              annotation: { // If available, otherwise we use custom line
              }
            }
          }} 
        />
      </Card>

      <Table 
        headers={["Site", "MTD Cost", "MTD Goods Value", "MTD %", "YTD Cost", "YTD Goods Value", "YTD %"]} 
        rows={tableRows}
      />
    </div>
  )
}

function UnitCostPage() {
  const chartOptions = (yTitle: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#9ca3af', boxWidth: 12 } },
    },
    scales: {
      y: { title: { display: true, text: yTitle, color: '#9ca3af' }, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
      x: { ticks: { color: '#9ca3af' } }
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="$/ton by Site (3 Months)" className="h-80">
          <Bar data={{
            labels: SITES,
            datasets: MONTHS.map((m, i) => ({
              label: m,
              data: SITES.map(s => UNIT_COST_DATA.perTon[s as keyof typeof UNIT_COST_DATA.perTon][i]),
              backgroundColor: i === 0 ? '#4b5563' : i === 1 ? '#6b7280' : BRAND_GOLD,
            }))
          }} options={chartOptions("USD / Ton")} />
        </Card>
        <Card title="$/m³ by Site (3 Months)" className="h-80">
          <Bar data={{
            labels: SITES,
            datasets: MONTHS.map((m, i) => ({
              label: m,
              data: SITES.map(s => UNIT_COST_DATA.perCbm[s as keyof typeof UNIT_COST_DATA.perCbm][i]),
              backgroundColor: i === 0 ? '#4b5563' : i === 1 ? '#6b7280' : BRAND_TEAL,
            }))
          }} options={chartOptions("USD / CBM")} />
        </Card>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 tracking-widest px-1">YTD Unit Cost Summary Cards</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {SITES.map(site => (
            <div key={site} className="bg-[#1a1b1e] border border-gray-800 p-3 rounded">
               <p className="text-[10px] text-gray-500 font-bold uppercase">{site} YTD</p>
               <div className="mt-2 space-y-1">
                 <div className="flex justify-between items-baseline">
                   <span className="text-[10px] text-gray-400">TON:</span>
                   <span className="text-lg font-semibold text-white">${UNIT_COST_DATA.perTon.ytd[site as keyof typeof UNIT_COST_DATA.perTon.ytd]}</span>
                 </div>
                 <div className="flex justify-between items-baseline">
                   <span className="text-[10px] text-gray-400">CBM:</span>
                   <span className="text-lg font-semibold text-teal-400">${UNIT_COST_DATA.perCbm.ytd[site as keyof typeof UNIT_COST_DATA.perCbm.ytd]}</span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <Card title="Commodity Shipped Out MTD vs YTD" className="h-80">
        <Bar data={{
          labels: COMMODITY_DATA.map(d => `${d.site} - ${d.commodity}`),
          datasets: [
            { label: 'MTD', data: COMMODITY_DATA.map(d => d.mtd), backgroundColor: BRAND_GOLD },
            { label: 'YTD', data: COMMODITY_DATA.map(d => d.ytd), backgroundColor: '#4b5563' }
          ]
        }} options={{
          ...chartOptions("Units (Log Scale)"),
          scales: {
            y: { type: 'logarithmic', grid: { color: '#374151' }, ticks: { color: '#9ca3af', callback: function(value) { return value.toLocaleString(); } } },
            x: { ticks: { color: '#9ca3af' } }
          }
        }} />
      </Card>
    </div>
  )
}

function FreightOpsPage() {
  const tripSummaryData = [
    ["Low Bed HE", 41, 64],
    ["Trailer 20/40ft", 81, 292],
    ["Bulk Cement 20T", 210, 515],
    ["Fuel Truck", 1174, 3153],
    ["Tronton/Fuso/CDD", 2624, 6686],
  ];

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Air Freight Frequency by Site (3 Months)" className="h-80">
           <Bar data={{
             labels: MONTHS,
             datasets: SITES.map(site => ({
               label: site,
               data: FREIGHT_DATA.air[site as keyof typeof FREIGHT_DATA.air],
               backgroundColor: SITE_COLORS[site],
             }))
           }} options={{
             responsive: true, maintainAspectRatio: false,
             scales: { y: { stacked: true, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }, x: { stacked: true, ticks: { color: '#9ca3af' } } },
             plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', boxWidth: 10 } } }
           }} />
        </Card>
        <Card title="Sea Freight Trips (Monthly Breakdown)" className="h-80">
           <Bar data={{
             labels: MONTHS,
             datasets: FREIGHT_DATA.sea.types.map((type, i) => ({
               label: type,
               data: i === 0 ? [4,4,4] : i === 1 ? [21,37,33] : [26,43,41],
               backgroundColor: i === 0 ? BRAND_GOLD : i === 1 ? BRAND_TEAL : '#3b82f6'
             }))
           }} options={{
             responsive: true, maintainAspectRatio: false,
             scales: { y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }, x: { ticks: { color: '#9ca3af' } } },
             plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', boxWidth: 10 } } }
           }} />
        </Card>
       </div>

       <Card title="Land Freight Trips by Vehicle Type (Monthly Trends)" className="h-96">
           <Bar data={{
             labels: MONTHS,
             datasets: FREIGHT_DATA.land.types.map((type, i) => ({
               label: type,
               data: FREIGHT_DATA.land.data[i],
               backgroundColor: [BRAND_GOLD, BRAND_TEAL, '#3b82f6', '#a855f7', '#6b7280'][i]
             }))
           }} options={{
             responsive: true, maintainAspectRatio: false,
             scales: { y: { stacked: true, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }, x: { stacked: true, ticks: { color: '#9ca3af' } } },
             plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', boxWidth: 10 } } }
           }} />
       </Card>

       <Table headers={["Vehicle/Mode Type", "Mar-26 Trips", "YTD Trips"]} rows={tripSummaryData} />
    </div>
  )
}

function TransitTimePage() {
  const getHeatmapColor = (val: number | null) => {
    if (val === null) return "bg-[#141518]";
    if (val <= 2) return "bg-green-900/40 text-green-400 border border-green-800/50";
    if (val <= 4) return "bg-yellow-900/40 text-yellow-400 border border-yellow-800/50";
    if (val <= 5.5) return "bg-orange-900/40 text-orange-400 border border-orange-800/50";
    return "bg-red-900/40 text-red-400 border border-red-800/50";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card title="Avg Hub Transit Time (Months)" className="lg:col-span-4 h-80">
          <Bar data={{
            labels: MONTHS,
            datasets: [{
              label: 'Avg Days',
              data: TRANSIT_DATA.trend,
              backgroundColor: (ctx) => (ctx.raw as number) > 5 ? '#f59e0b' : '#14b8a6',
            }]
          }} options={{
            responsive: true, maintainAspectRatio: false,
            scales: { 
              y: { min: 0, max: 8, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
              x: { ticks: { color: '#9ca3af' } }
            },
            plugins: { legend: { display: false } }
          }} />
        </Card>

        <Card title="Transit Days by Site & Hub" className="lg:col-span-8 h-80">
           <Bar data={{
             labels: SITES,
             datasets: TRANSIT_DATA.hubs.map((hub, i) => ({
               label: hub,
               data: SITES.map(site => TRANSIT_DATA.matrix[hub as keyof typeof TRANSIT_DATA.matrix][site as Site]),
               backgroundColor: [BRAND_GOLD, BRAND_TEAL, '#3b82f6', '#a855f7'][i]
             }))
           }} options={{
             responsive: true, maintainAspectRatio: false,
             scales: { 
               y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
               x: { ticks: { color: '#9ca3af' } }
             },
             plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', boxWidth: 10 } } }
           }} />
        </Card>
      </div>

      <Card title="Hub × Site Transit Time Heatmap (Avg Days)">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="text-gray-500 uppercase tracking-widest font-bold">
                <th className="px-4 py-3 text-left">HUB / SITE</th>
                {SITES.map(s => <th key={s} className="px-4 py-3">{s}</th>)}
                <th className="px-4 py-3 bg-[#111214]">AVG</th>
              </tr>
            </thead>
            <tbody>
              {TRANSIT_DATA.hubs.map(hub => {
                const values = SITES.map(s => TRANSIT_DATA.matrix[hub as keyof typeof TRANSIT_DATA.matrix][s as Site]);
                const avg = values.filter(v => v !== null).reduce((a, b) => a! + b!, 0) / values.filter(v => v !== null).length;
                return (
                  <tr key={hub} className="border-b border-gray-800/50">
                    <td className="px-4 py-4 text-left font-bold text-gray-400 uppercase tracking-wider">{hub}</td>
                    {values.map((v, i) => (
                      <td key={i} className="px-2 py-2">
                        <div className={cn("py-2 rounded font-mono text-sm", getHeatmapColor(v))}>
                          {v !== null ? v.toFixed(1) : "—"}
                        </div>
                      </td>
                    ))}
                    <td className="px-4 py-4 font-bold text-gray-300 bg-[#111214]">{avg.toFixed(1)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#111214] font-bold text-gray-300">
                <td className="px-4 py-4 text-left uppercase">Overall Site Avg</td>
                {SITES.map(site => {
                  const vals = TRANSIT_DATA.hubs.map(h => TRANSIT_DATA.matrix[h as keyof typeof TRANSIT_DATA.matrix][site as Site]).filter(v => v !== null);
                  const avg = vals.length ? vals.reduce((a, b) => a! + b!, 0) / vals.length : 0;
                  return <td key={site} className="px-4 py-4">{avg.toFixed(1)}</td>
                })}
                <td className="px-4 py-4 text-amber-500 underline decoration-2">4.7</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}

// --- MAIN LAYOUT ---

export default function App() {
  const [activePage, setActivePage] = useState<'overview' | 'cost' | 'unit' | 'freight' | 'transit'>('overview');
  const [siteFilter, setSiteFilter] = useState<string>('All');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'cost', label: 'Cost By Site', icon: BarChart3 },
    { id: 'unit', label: 'Unit Cost', icon: DollarSign },
    { id: 'freight', label: 'Freight Ops', icon: Truck },
    { id: 'transit', label: 'Transit Time', icon: Clock },
  ];

  return (
    <div className="flex bg-[#0c0d0e] text-[#f4f4f4] font-sans h-screen overflow-hidden selection:bg-[#D4A017] selection:text-[#5C2A0E]">
      {/* SIDEBAR */}
      <aside className={cn(
        "bg-[#141518] border-r border-[#D4A017]/20 flex flex-col transition-all duration-300 z-50",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="h-16 flex items-center px-4 border-b border-gray-800 justify-between">
           <div className={cn("flex items-center gap-3 overflow-hidden transition-all", !sidebarOpen && "hidden")}>
             <div className="w-8 h-8 bg-[#5C2A0E] border border-[#D4A017] flex items-center justify-center font-bold text-[#D4A017] rounded-sm flex-shrink-0">M</div>
             <div className="whitespace-nowrap">
               <p className="text-[10px] font-bold text-[#D4A017] tracking-tighter uppercase leading-none">Merdeka</p>
               <p className="text-[12px] font-medium leading-none mt-1">Copper Gold</p>
             </div>
           </div>
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-[#2a2b2e] rounded transition-colors text-gray-500">
             {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
           </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all group",
                activePage === item.id 
                  ? "bg-[#5C2A0E] border-l-2 border-[#D4A017] text-white shadow-lg shadow-black/40" 
                  : "text-gray-500 hover:bg-[#1a1b1e] hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", activePage === item.id ? "text-[#D4A017]" : "group-hover:text-gray-300")} />
              {sidebarOpen && <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-4 mt-auto">
            <div className="p-3 bg-[#2a2b2e]/30 rounded border border-gray-800">
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1.5">Reporting Period</p>
              <p className="text-xs text-[#D4A017] font-medium">Q1 - Mar 2026</p>
            </div>
            <p className="text-[9px] text-gray-600 mt-4 leading-relaxed uppercase tracking-tighter">
              INTERNAL LOGISTICS SYSTEM<br/>v4.2.1 | PRODUCTION
            </p>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-16 bg-[#1a1b1e] border-b border-gray-800 flex items-center justify-between px-6 shrink-0 relative">
          <div className="flex items-center gap-4">
             <h1 className="text-lg font-medium text-white tracking-tight">
               {menuItems.find(m => m.id === activePage)?.label} <span className="hidden sm:inline text-gray-500 ml-2 text-sm">Dashboard</span>
             </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex bg-[#0c0d0e] border border-[#D4A017]/30 rounded p-0.5 overflow-hidden">
               <button className="px-4 py-1 text-xs font-bold bg-[#D4A017] text-[#5C2A0E] rounded-sm transition-all">MTD</button>
               <button className="px-4 py-1 text-xs font-bold text-gray-500 hover:text-gray-300 transition-all">YTD</button>
            </div>

            <div className="relative group">
              <select className="appearance-none bg-[#2a2b2e] border border-gray-700 rounded pl-3 pr-8 py-1.5 text-xs text-white outline-none focus:border-[#D4A017] cursor-pointer transition-all">
                <option>March 2026</option>
                <option>February 2026</option>
                <option>January 2026</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-[#D4A017] transition-colors" />
            </div>
          </div>
        </header>

        {/* SUB-HEADER FILTERS */}
        <div className="h-12 bg-[#111214] border-b border-gray-800 flex items-center px-6 gap-3 shrink-0 overflow-x-auto scroller-hidden">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest whitespace-nowrap mr-2">Filt Site:</span>
          {["All", ...SITES].map(site => (
            <button
              key={site}
              onClick={() => setSiteFilter(site)}
              className={cn(
                "px-3 py-1 text-[11px] font-bold rounded-full border transition-all truncate uppercase tracking-tighter",
                siteFilter === site 
                  ? "bg-[#D4A017]/20 border-[#D4A017] text-[#D4A017]" 
                  : "bg-transparent border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-400"
              )}
            >
              {site}
            </button>
          ))}
        </div>

        {/* PAGE_CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0c0d0e] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed">
          {activePage === 'overview' && <OverviewPage />}
          {activePage === 'cost' && <CostBySitePage />}
          {activePage === 'unit' && <UnitCostPage />}
          {activePage === 'freight' && <FreightOpsPage />}
          {activePage === 'transit' && <TransitTimePage />}
        </div>

        {/* FOOTER BAR */}
        <footer className="h-7 bg-[#0c0d0e] border-t border-gray-800 flex items-center px-6 justify-between text-[10px] text-gray-500 font-mono tracking-tighter uppercase shrink-0">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> SYSTEM STATUS: OPTIMIZED</span>
            <span className="hidden sm:inline">DATA: EXTERNAL REPLICATION LAG 0.0s</span>
          </div>
          <div className="flex gap-4">
             <span>LAST SYNC: MAR 24, 2026 09:12:44 AM</span>
             <span className="text-gray-700">|</span>
             <span className="hover:text-gray-300 cursor-help flex items-center gap-1"><Info className="w-2.5 h-2.5" /> REFRESH POLICY: MANUAL (LIVE)</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
