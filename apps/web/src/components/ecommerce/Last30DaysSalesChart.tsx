import { ApexOptions } from "apexcharts";
import { TrendingUp } from "lucide-react";
import Chart from "react-apexcharts";

import { useGetLast30DaysAnalyticsQuery } from "../../features/sale/saleApi";
import Loading from "../common/Loading";

/* -------------------------------- helpers -------------------------------- */

const formatCurrency = (value = 0) => `৳${value.toLocaleString()}`;

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

/* -------------------------------------------------------------------------- */

export default function Last30DaysSalesChart() {
  const { data, isLoading, isError } = useGetLast30DaysAnalyticsQuery();
  const analytics = data?.data;

  if (isLoading) {
    return <Loading message="Loading analytics..." />;
  }

  if (isError || !analytics) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/10">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load sales analytics
        </p>
      </div>
    );
  }

  /* ----------------------------- CHART DATA -------------------------------- */

  const categories = analytics.dailySales.map((s) => formatDate(s.date));

  const series = [
    {
      name: "Sales",
      data: analytics.dailySales.map((s) => s.total),
    },
    {
      name: "Orders",
      data: analytics.dailySales.map((s) => s.orders),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#465fff", "#34d399"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: "#9ca3af" },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#9ca3af" },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      theme: "light",
      y: [
        {
          formatter: (val) => formatCurrency(val),
        },
        {
          formatter: (val) => `${val}`,
        },
      ],
    },
  };

  /* ---------------------------- SUMMARY CARDS ------------------------------- */

  const summaries = [
    {
      label: "Total Sales",
      value: formatCurrency(analytics.totalSales),
      bg: "bg-blue-50 dark:bg-blue-900/10",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Orders",
      value: analytics.totalOrders,
      bg: "bg-green-50 dark:bg-green-900/10",
      text: "text-green-600 dark:text-green-400",
    },
    {
      label: "Average Order Value",
      value: `৳${analytics.averageOrderValue.toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })}`,
      bg: "bg-purple-50 dark:bg-purple-900/10",
      text: "text-purple-600 dark:text-purple-400",
      icon: TrendingUp,
    },
  ];

  /* -------------------------------------------------------------------------- */

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/5 dark:bg-white/3">
      {/* HEADER */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Last 30 Days Sales Performance
        </h3>

        {/* SUMMARY */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {summaries.map((item) => (
            <div key={item.label} className={`rounded-lg p-4 ${item.bg}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.label}
              </p>

              <p
                className={`mt-1 flex items-center gap-2 text-2xl font-bold ${item.text}`}
              >
                {item.value}
                {item.icon && <item.icon className="h-5 w-5" />}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CHART */}
      <Chart options={options} series={series} type="area" height={350} />
    </div>
  );
}

