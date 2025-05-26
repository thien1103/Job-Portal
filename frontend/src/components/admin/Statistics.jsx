import React, { useState, useEffect } from "react";
import { ADMIN_API_END_POINT } from "@/utils/constant";
import { Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const Statistics = () => {
  const [statistics, setStatistics] = useState(null);

  // Fetch statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch(`${ADMIN_API_END_POINT}/statistics`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setStatistics(data.statistics);
        } else {
          console.error("Error:", data);
          setStatistics(null);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setStatistics(null);
      }
    };
    fetchStatistics();
  }, []);

  if (!statistics) {
    return <div className="text-center p-4">Loading statistics...</div>;
  }

  // Prepare data for Pie Chart (roleStats)
  const roleStatsData = {
    labels: ["Applicants", "Recruiters", "Admins"],
    datasets: [
      {
        data: [
          statistics.roleStats.applicant,
          statistics.roleStats.recruiter,
          statistics.roleStats.admin,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  // Calculate monthly growth for Applicants and Recruiters
  const totalUsers = statistics.roleStats.applicant + statistics.roleStats.recruiter + statistics.roleStats.admin;
  const applicantProportion = statistics.roleStats.applicant / totalUsers;
  const recruiterProportion = statistics.roleStats.recruiter / totalUsers;

  // Initialize arrays for 12 months (January to December)
  const months = [
    "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
    "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"
  ];

  const applicantGrowth = new Array(12).fill(0);
  const recruiterGrowth = new Array(12).fill(0);

  // Distribute new users by month based on proportions
  statistics.newUsers.byMonth.forEach((entry) => {
    const monthIndex = months.indexOf(entry.month);
    if (monthIndex !== -1) {
      applicantGrowth[monthIndex] = Math.round(entry.count * applicantProportion);
      recruiterGrowth[monthIndex] = Math.round(entry.count * recruiterProportion);
    }
  });

  // Prepare data for Line Charts
  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const applicantChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Applicants Growth",
        data: applicantGrowth,
        borderColor: "#FF6384",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  const recruiterChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Recruiters Growth",
        data: recruiterGrowth,
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
        },
      },
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
    },
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Statistics Dashboard</h2>

      {/* Summary Cards with Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-blue-800">Total Users</h3>
          <p className="text-2xl text-blue-900">{statistics.totalUsers}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-green-800">Total Jobs</h3>
          <p className="text-2xl text-green-900">{statistics.totalJobs}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-purple-800">Total Companies</h3>
          <p className="text-2xl text-purple-900">{statistics.totalCompanies}</p>
        </div>
        <div className="bg-orange-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-orange-800">Total Applications</h3>
          <p className="text-2xl text-orange-900">{statistics.totalApplications}</p>
        </div>
        <div className="bg-teal-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold text-teal-800">New Jobs (Last 7 Days)</h3>
          <p className="text-2xl text-teal-900">{statistics.newJobsLast7Days}</p>
        </div>
      </div>

      {/* Pie Chart for Role Distribution */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">User Role Distribution</h3>
        <div className="flex justify-center">
          <div className="w-64 h-64">
            <Pie data={roleStatsData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Applicants Growth */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Applicants Growth (2025)</h3>
          <div className="h-64">
            <Line data={applicantChartData} options={chartOptions} />
          </div>
        </div>

        {/* Recruiters Growth */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Recruiters Growth (2025)</h3>
          <div className="h-64">
            <Line data={recruiterChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* New Users Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Day */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">New Users by Day</h3>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Count</th>
              </tr>
            </thead>
            <tbody>
              {statistics.newUsers.byDay.map((entry, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{entry.date}</td>
                  <td className="p-2">{entry.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* By Week */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">New Users by Week</h3>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Week</th>
                <th className="p-2 text-left">Count</th>
              </tr>
            </thead>
            <tbody>
              {statistics.newUsers.byWeek.map((entry, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{entry.week}</td>
                  <td className="p-2">{entry.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* By Month */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">New Users by Month</h3>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Month</th>
                <th className="p-2 text-left">Count</th>
              </tr>
            </thead>
            <tbody>
              {statistics.newUsers.byMonth.map((entry, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{entry.month}</td>
                  <td className="p-2">{entry.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* By Year */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">New Users by Year</h3>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Year</th>
                <th className="p-2 text-left">Count</th>
              </tr>
            </thead>
            <tbody>
              {statistics.newUsers.byYear.map((entry, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{entry.year}</td>
                  <td className="p-2">{entry.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Statistics;