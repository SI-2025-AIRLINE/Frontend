import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { Card, CardContent, CardYearMonthDropdown } from "@/components/ui/card";
import { BarChart, LineChart, PieChart, Pie, Cell, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar } from "recharts";
import './Analytics.css';

function AirlineAdminAnalytics() {
  const punctualityData = [
    { name: "On Time", value: 70 },
    { name: "Delayed", value: 20 },
    { name: "Cancelled", value: 10 },
  ];

  const busiestRoutesData = [
    { route: "NYC - LAX", flights: 180 },
    { route: "ATL - ORD", flights: 150 },
    { route: "DFW - DEN", flights: 130 },
  ];

  const bookingTrendsData = [
    { week: "Week 1", bookings: 500 },
    { week: "Week 2", bookings: 650 },
    { week: "Week 3", bookings: 700 },
    { week: "Week 4", bookings: 620 },
  ];

  // Dropdown options for years and months (reuse for booking trends)
  const bookingTrendsYears = [
    { value: 2021, label: "2021" },
    { value: 2022, label: "2022" },
    { value: 2023, label: "2023" },
  ];
  const bookingTrendsMonths = [
    { value: "January", label: "January" },
    { value: "February", label: "February" },
    { value: "March", label: "March" },
    { value: "April", label: "April" },
    { value: "May", label: "May" },
    { value: "June", label: "June" },
  ];

  // Mocked booking trends data by year and month, each with weeks 1-4
  const bookingTrendsDataByYearMonth = {
    "2021-January": [
      { week: "Week 1", bookings: 320 },
      { week: "Week 2", bookings: 410 },
      { week: "Week 3", bookings: 390 },
      { week: "Week 4", bookings: 370 },
    ],
    "2021-February": [
      { week: "Week 1", bookings: 350 },
      { week: "Week 2", bookings: 420 },
      { week: "Week 3", bookings: 400 },
      { week: "Week 4", bookings: 380 },
    ],
    "2022-January": [
      { week: "Week 1", bookings: 500 },
      { week: "Week 2", bookings: 650 },
      { week: "Week 3", bookings: 700 },
      { week: "Week 4", bookings: 620 },
    ],
    "2022-February": [
      { week: "Week 1", bookings: 540 },
      { week: "Week 2", bookings: 600 },
      { week: "Week 3", bookings: 670 },
      { week: "Week 4", bookings: 630 },
    ],
    "2023-January": [
      { week: "Week 1", bookings: 700 },
      { week: "Week 2", bookings: 800 },
      { week: "Week 3", bookings: 850 },
      { week: "Week 4", bookings: 790 },
    ],
    "2023-February": [
      { week: "Week 1", bookings: 720 },
      { week: "Week 2", bookings: 810 },
      { week: "Week 3", bookings: 860 },
      { week: "Week 4", bookings: 800 },
    ],
    // ...add more months as needed...
    "2023-March": [
      { week: "Week 1", bookings: 750 },
      { week: "Week 2", bookings: 830 },
      { week: "Week 3", bookings: 870 },
      { week: "Week 4", bookings: 820 },
    ],
    "2023-April": [
      { week: "Week 1", bookings: 730 },
      { week: "Week 2", bookings: 820 },
      { week: "Week 3", bookings: 860 },
      { week: "Week 4", bookings: 810 },
    ],
    "2023-May": [
      { week: "Week 1", bookings: 760 },
      { week: "Week 2", bookings: 840 },
      { week: "Week 3", bookings: 880 },
      { week: "Week 4", bookings: 830 },
    ],
    "2023-June": [
      { week: "Week 1", bookings: 780 },
      { week: "Week 2", bookings: 850 },
      { week: "Week 3", bookings: 890 },
      { week: "Week 4", bookings: 850 },
    ],
  };

  // Booking trends dropdown content renderer
  const renderBookingTrendsContent = (selectedYear, selectedMonth) => {
    const key = `${selectedYear}-${selectedMonth}`;
    const data = bookingTrendsDataByYearMonth[key] || [
      { week: "Week 1", bookings: 0 },
      { week: "Week 2", bookings: 0 },
      { week: "Week 3", bookings: 0 },
      { week: "Week 4", bookings: 0 },
    ];
    return (
      <LineChart width={300} height={200} data={data}>
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    );
  };

  const loyaltyData = [
    { program: "Miles Earned", value: 12000 },
    { program: "Miles Redeemed", value: 8000 },
  ];

  // Mocked data for cancelled flights percentage per month
  const cancelledFlightsData = [
    { year: 2021, month: "January", percentage: 2.1 },
    { year: 2021, month: "February", percentage: 1.7 },
    { year: 2021, month: "March", percentage: 2.9 },
    { year: 2021, month: "April", percentage: 2.2 },
    { year: 2022, month: "January", percentage: 2.5 },
    { year: 2022, month: "February", percentage: 1.8 },
    { year: 2022, month: "March", percentage: 3.1 },
    { year: 2022, month: "April", percentage: 2.0 },
    { year: 2022, month: "May", percentage: 2.7 },
    { year: 2022, month: "June", percentage: 1.9 },
    { year: 2023, month: "January", percentage: 2.3 },
    { year: 2023, month: "February", percentage: 1.6 },
    { year: 2023, month: "March", percentage: 2.8 },
    { year: 2023, month: "April", percentage: 2.1 },
    { year: 2023, month: "May", percentage: 2.4 },
    { year: 2023, month: "June", percentage: 1.5 },
  ];

  // Dropdown options for years and months
  const cancelledFlightsYears = [
    { value: 2021, label: "2021" },
    { value: 2022, label: "2022" },
    { value: 2023, label: "2023" },
  ];
  const cancelledFlightsMonths = [
    { value: "January", label: "January" },
    { value: "February", label: "February" },
    { value: "March", label: "March" },
    { value: "April", label: "April" },
    { value: "May", label: "May" },
    { value: "June", label: "June" },
  ];

  // Render content for the dropdown
  const renderCancelledContent = (selectedYear, selectedMonth) => {
    const data = cancelledFlightsData.find(
      d => d.year === Number(selectedYear) && d.month === selectedMonth
    );
    return (
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <h3 style={{ margin: 0 }}>
          {selectedMonth} {selectedYear}
        </h3>
        <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#ff8042" }}>
          {data ? data.percentage : "-"}%
        </p>
        <span style={{ color: "#888" }}>Cancelled Flights</span>
      </div>
    );
  };

  return (
    <div className="analytics-container">
      <h1 className="analytics-title">Analytics</h1>

      {/* Flight Operations */}
      <h2 className="analytics-section-title">Flight Operations</h2>
      <div className="analytics-section analytics-grid">
        <Card className="analytics-card">
          <CardContent>
            <h2 className="analytics-card-title">Flight Punctuality</h2>
            <PieChart width={300} height={200}>
              <Pie data={punctualityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label>
                {punctualityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#82ca9d", "#ffc658", "#ff8042"][index % 3]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h2 className="analytics-card-title">Busiest Routes</h2>
            <BarChart width={300} height={200} data={busiestRoutesData}>
              <XAxis dataKey="route" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="flights" fill="#82ca9d" />
            </BarChart>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h2 className="analytics-card-title">Average Flight Occupancy</h2>
            <BarChart width={300} height={200} data={[
              { month: "Jan", occupancy: 78 },
              { month: "Feb", occupancy: 82 },
              { month: "Mar", occupancy: 85 },
              { month: "Apr", occupancy: 80 },
            ]}>
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="occupancy" fill="#ff8042" />
            </BarChart>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h2 className="analytics-card-title">Cancelled Flights % Per Month</h2>
            <CardYearMonthDropdown
              years={cancelledFlightsYears}
              months={cancelledFlightsMonths}
              renderContent={renderCancelledContent}
            />
          </CardContent>
        </Card>
      </div>

      {/* Passenger Insights */}
      <h2 className="analytics-section-title">Passenger Insights</h2>
      <div className="analytics-section analytics-grid">
        <Card className="analytics-card">
          <CardContent>
            <h2 className="analytics-card-title">Booking Trends</h2>
            <CardYearMonthDropdown
              years={bookingTrendsYears}
              months={bookingTrendsMonths}
              renderContent={renderBookingTrendsContent}
            />
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h2 className="analytics-card-title">Loyalty Program Activity</h2>
            <BarChart width={300} height={200} data={loyaltyData}>
              <XAxis dataKey="program" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h2 className="analytics-card-title">Top Destinations</h2>
            <BarChart width={300} height={200} data={[
              { destination: "Los Angeles", passengers: 1200 },
              { destination: "Chicago", passengers: 950 },
              { destination: "Denver", passengers: 800 },
            ]}>
              <XAxis dataKey="destination" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="passengers" fill="#ffc658" />
            </BarChart>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Financials */}
      <h2 className="analytics-section-title">Revenue & Financials</h2>
      <div className="analytics-section analytics-table-wrapper">
        <table className="analytics-table">
          <thead>
            <tr>
              <th className="analytics-table-header">Route</th>
              <th className="analytics-table-header">Revenue</th>
              <th className="analytics-table-header">Avg Ticket Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="analytics-table-cell">NYC - LAX</td>
              <td className="analytics-table-cell">$350,000</td>
              <td className="analytics-table-cell">$280</td>
            </tr>
            <tr>
              <td className="analytics-table-cell">ATL - ORD</td>
              <td className="analytics-table-cell">$270,000</td>
              <td className="analytics-table-cell">$250</td>
            </tr>
            <tr>
              <td className="analytics-table-cell">DFW - DEN</td>
              <td className="analytics-table-cell">$190,000</td>
              <td className="analytics-table-cell">$210</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AirlineAdminAnalytics;