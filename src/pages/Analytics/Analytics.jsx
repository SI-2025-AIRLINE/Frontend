import React, { useState, useEffect } from "react";
import { Card, CardContent, CardYearMonthDropdown, CardMonthDropdown } from "@/components/ui/card";
import { BarChart, LineChart, PieChart, Pie, Cell, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar } from "recharts";
import './Analytics.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;

function AirlineAdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bookingTrendsData, setBookingTrendsData] = useState([]);
  const [bookingTrendsLoading, setBookingTrendsLoading] = useState(false);

  const getBookingTrendsYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, i) => {
      const year = currentYear - 3 + i;
      return { value: year, label: year.toString() };
    });
  };

  const getBookingTrendsMonths = (selectedYear) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const maxMonth = parseInt(selectedYear) === currentYear ? currentMonth : 11;
    return months.slice(0, maxMonth + 1).map(m => ({ value: m, label: m }));
  };

  const bookingTrendsYears = getBookingTrendsYears();
  const initialYear = bookingTrendsYears[bookingTrendsYears.length - 1].value;
  const initialMonths = getBookingTrendsMonths(initialYear);
  const initialMonth = initialMonths[initialMonths.length - 1].value;

  const [selectedBookingYear, setSelectedBookingYear] = useState(initialYear);
  const [availableBookingMonths, setAvailableBookingMonths] = useState(initialMonths);
  const [selectedBookingMonth, setSelectedBookingMonth] = useState(initialMonth);

  const [selectedCanceledFlightsYear, setSelectedCanceledFlightsYear] = useState(initialYear);
  const [availableCanceledFlightsMonths, setAvailableCanceledFlightsMonths] = useState(initialMonths);
  const [selectedCanceledFlightsMonth, setSelectedCanceledFlightsMonth] = useState(initialMonth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/analytics`);
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const updatedMonths = getBookingTrendsMonths(selectedBookingYear);
    setAvailableBookingMonths(updatedMonths);
    setSelectedBookingMonth(updatedMonths[updatedMonths.length - 1].value);
  }, [selectedBookingYear]);

  function monthNameToNumber(monthName) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const index = months.findIndex(
      m => m.toLowerCase() === monthName.toLowerCase()
    );
    return index === -1 ? null : index + 1;
  }

  useEffect(() => {
    const fetchBookingTrends = async () => {
      setBookingTrendsLoading(true);
      try {
        const response = await fetch(`${apiURL}/Analytics/booking-trends/${selectedBookingYear}/${monthNameToNumber(selectedBookingMonth)}`);
        const data = await response.json();
        const key = `${selectedBookingYear}-${selectedBookingMonth}`;
        const trendsArray = data[key] || [];
        setBookingTrendsData(trendsArray);
      } catch (error) {
        console.error("Error fetching booking trends:", error);
        setBookingTrendsData([]);
      } finally {
        setBookingTrendsLoading(false);
      }
    };
    fetchBookingTrends();
  }, [selectedBookingYear, selectedBookingMonth]);

  if (loading || !analyticsData) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  const punctualityData = [
    { name: "On Time", value: analyticsData.flightStatistics.normal },
    { name: "Delayed", value: analyticsData.flightStatistics.delayed },
    { name: "Cancelled", value: analyticsData.flightStatistics.cancelled },
  ];

  const busiestRoutesData = analyticsData.busiestRoutes;
  const occupancyData = analyticsData.averageOccupancy;

  const renderBookingTrendsContent = () => {
    if (bookingTrendsLoading) {
      return <div className="loading-spinner" style={{ textAlign: "center", padding: "1rem" }}></div>;
    }
    if (!bookingTrendsLoading && bookingTrendsData.length === 0) {
      return (
      <div className="loading-spinner" style={{ textAlign: "center", padding: "1rem" }}></div>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={bookingTrendsData}>
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="bookings" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const loyaltyData = [
    { program: "Miles Earned", value: 12000 },
    { program: "Miles Redeemed", value: 8000 },
  ];

  // Returns an array of the last 5 months as { value, label } objects, including the current month
  function getLastFiveMonths() {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const now = new Date();
    const result = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        value: months[d.getMonth()],
        label: months[d.getMonth()],
        year: d.getFullYear()
      });
    }
    return result;
  }

  const cancelledFlightsMonths = getLastFiveMonths().map(m => ({
    value: m.value,
    label: m.label
  }));

  // Prepare cancelledFlightsData for the last 5 months using analyticsData
  const cancelledFlightsData = analyticsData.cancelledFlightPercentage;

  const renderCancelledContent = (selectedMonth) => {
    console.log("Selected Month:", selectedMonth);
    const data = cancelledFlightsData.find(
      d => d.month === selectedMonth
    );
    console.log("Cancelled Data:", data);
    return (
      <div style={{ textAlign: "center", padding: "1rem" }}>
        <h3 style={{ margin: 0 }}>
          {selectedMonth}
        </h3>
        <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#ff8042" }}>
          {data ? data.percentage : "-"}%
        </p>
        <span style={{ color: "#888" }}>Cancelled Flights</span>
      </div>
    );
  };

  // Sort routeRevenueStatistics by revenue descending
  const sortedRouteRevenueStatistics = analyticsData.routeRevenueStatistics
    ? [...analyticsData.routeRevenueStatistics].sort((a, b) => b.revenue - a.revenue)
    : [];

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
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h2 className="analytics-card-title">Average Flight Occupancy</h2>
            <BarChart width={300} height={200} data={occupancyData}>
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="occupancy" fill="#ff8042" />
            </BarChart>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h2 className="analytics-card-title">Cancelled Flights %</h2>
            <CardMonthDropdown
              months={cancelledFlightsMonths}
              renderContent={renderCancelledContent}
              onMonthChange={(month) => setSelectedCanceledFlightsMonth(month)}
              initialMonth={initialMonth}
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
              months={availableBookingMonths}
              renderContent={renderBookingTrendsContent}
              onYearChange={(year) => setSelectedBookingYear(year)}
              onMonthChange={(month) => setSelectedBookingMonth(month)} 
              initialYear={initialYear}
              initialMonth={initialMonth}
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
            <BarChart width={300} height={200} data={analyticsData.mostPopularDestinations}>
              <XAxis dataKey="destination" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="passengerCount" fill="#ffc658" />
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
              <th className="analytics-table-header" rowSpan={2}>Route</th>
              <th className="analytics-table-header" rowSpan={2}>Revenue</th>
              <th className="analytics-table-header" colSpan={3}>Average ticket price</th>
            </tr>
            <tr>
              <th className="analytics-table-header">Economy</th>
              <th className="analytics-table-header">Business</th>
              <th className="analytics-table-header">First Class</th>
            </tr>
          </thead>
          <tbody>
            {sortedRouteRevenueStatistics && sortedRouteRevenueStatistics.length > 0 ? (
              sortedRouteRevenueStatistics.map((routeStat, idx) => (
                <tr key={idx}>
                  <td className="analytics-table-cell">{routeStat.route}</td>
                  <td className="analytics-table-cell">${routeStat.revenue}</td>
                  <td className="analytics-table-cell">${routeStat.avg_ticket_price.economy}</td>
                  <td className="analytics-table-cell">${routeStat.avg_ticket_price.business}</td>
                  <td className="analytics-table-cell">${routeStat.avg_ticket_price.first_class}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="analytics-table-cell" colSpan={5}>No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AirlineAdminAnalytics;
