import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, ArrowUpCircle } from 'lucide-react';
import './LoyaltyStats.css';

const apiURL = import.meta.env.VITE_API_BASE_URL;

const LoyaltyProgressBar = ({ progress, currentTier, nextTier, hasNextTier }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="loyalty-progress-container">
      <div className="loyalty-progress-info">
        <span className="progress-label">Progress in {currentTier.name}</span>
        <span className="progress-percentage">{Math.round(clampedProgress)}%</span>
      </div>

      <div className="loyalty-progress-bar">
        <div
          className="loyalty-progress-fill"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: currentTier.color,
            '--progress-width': `${clampedProgress}%`
          }}
        ></div>

        {hasNextTier && (
          <div className="next-tier-marker">
            <div className="marker-dot" style={{ backgroundColor: nextTier.color }}></div>
            <div className="marker-label">{nextTier.name}</div>
          </div>
        )}
      </div>

      <div className="tier-labels">
        <div className="current-tier-label" style={{ color: currentTier.color }}>
          {currentTier.name}
        </div>
        {hasNextTier && (
          <div className="next-tier-label" style={{ color: nextTier.color }}>
            {nextTier.name}
          </div>
        )}
      </div>
    </div>
  );
};

const LoyaltyTierCard = ({ tier, pointsRequired, bookingsRequired, isCurrentTier, isNextTier }) => {
  return (
    <div className={`loyalty-tier-card ${isCurrentTier ? 'current-tier' : ''} ${isNextTier ? 'next-tier' : ''}`}>
      <div className="tier-card-header" style={{ backgroundColor: tier.color }}>
        <Shield size={24} className="tier-icon" />
        <h3 className="tier-name">{tier.name}</h3>
      </div>

      <div className="tier-card-body">
        <div className="tier-requirement">
          <p className="requirement-label">Points Required:</p>
          <p className="requirement-value">{pointsRequired.toLocaleString()}</p>
        </div>

        <div className="tier-requirement">
          <p className="requirement-label">Bookings Required:</p>
          <p className="requirement-value">{bookingsRequired}</p>
        </div>

        <div className="tier-status">
          {isCurrentTier && (
            <div className="current-tier-indicator">
              <CheckCircle size={18} />
              <span>Your Current Tier</span>
            </div>
          )}

          {isNextTier && (
            <div className="next-tier-indicator">
              <ArrowUpCircle size={18} />
              <span>Your Next Tier</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoyaltyStats = () => {
  const [customerData, setCustomerData] = useState({
    currentPoints: 0,
    currentClass: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loyaltyClasses = [
    { id: 0, name: "Bronze", color: "#CD7F32" },
    { id: 1, name: "Silver", color: "#C0C0C0" },
    { id: 2, name: "Gold", color: "#FFD700" },
    { id: 3, name: "Platinum", color: "#E5E4E2" },
    { id: 4, name: "Diamond", color: "#B9F2FF" }
  ];

  const tierPointsThresholds = [
    { classId: 0, points: 0 },
    { classId: 1, points: 2500 },
    { classId: 2, points: 7500 },
    { classId: 3, points: 15000 },
    { classId: 4, points: 30000 }
  ];

  const tierBookingThresholds = [
    { classId: 0, bookings: 0 },
    { classId: 1, bookings: 5 },
    { classId: 2, bookings: 15 },
    { classId: 3, bookings: 30 },
    { classId: 4, bookings: 50 }
  ];

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const customerId = localStorage.getItem('userId');
        if (!customerId) {
          throw new Error("User ID not found in localStorage");
        }
        const response = await fetch(`${apiURL}/Customer/${customerId}`, {
          headers: { accept: "application/json" }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch customer data");
        }
        const data = await response.json();

        // Postavimo samo potrebne podatke
        setCustomerData({
          currentPoints: data.loyaltyPoints,
          currentClass: data.loyaltyClass
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  if (loading) {
    return <div>Loading loyalty data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const currentTier = loyaltyClasses[customerData.currentClass];
  const currentTierThreshold = tierPointsThresholds[customerData.currentClass].points;

  const hasNextTier = customerData.currentClass < loyaltyClasses.length - 1;
  const nextTierIndex = hasNextTier ? customerData.currentClass + 1 : customerData.currentClass;
  const nextTier = loyaltyClasses[nextTierIndex];
  const nextTierThreshold = tierPointsThresholds[nextTierIndex].points;

  const pointsToMaintain = Math.max(0, currentTierThreshold - customerData.currentPoints);
  const pointsForNextTier = hasNextTier ? nextTierThreshold - customerData.currentPoints : 0;

  const calculateProgress = () => {
    if (customerData.currentClass === 0) {
      return (customerData.currentPoints / tierPointsThresholds[1].points) * 100;
    }

    const lowerThreshold = tierPointsThresholds[customerData.currentClass].points;
    const upperThreshold = hasNextTier
      ? tierPointsThresholds[customerData.currentClass + 1].points
      : lowerThreshold * 1.5;

    const pointsInTier = customerData.currentPoints - lowerThreshold;
    const tierRange = upperThreshold - lowerThreshold;

    return Math.min(100, (pointsInTier / tierRange) * 100);
  };

  return (
    <div className="loyalty-stats-container">
      <div className="loyalty-stats-content">
        <div className="loyalty-header">
          <Shield size={32} className="loyalty-icon" style={{ color: currentTier.color }} />
          <h1>Loyalty Status</h1>
        </div>

        <div className="current-status-card">
          <div className="status-header">
            <h2>Your Current Status</h2>
            <span className="points-badge">{customerData.currentPoints} points</span>
          </div>

          <div className="tier-badge" style={{ backgroundColor: currentTier.color }}>
            {currentTier.name}
          </div>

          <LoyaltyProgressBar
            progress={calculateProgress()}
            currentTier={currentTier}
            nextTier={nextTier}
            hasNextTier={hasNextTier}
          />

          <div className="tier-requirements">
            {pointsToMaintain > 0 ? (
              <p className="maintain-message">
                You need <span className="highlight">{pointsToMaintain}</span> more points to maintain your {currentTier.name} status.
              </p>
            ) : (
              <p className="maintain-message">
                You have secured your {currentTier.name} status for now!
              </p>
            )}

            {hasNextTier && (
              <p className="upgrade-message">
                Collect <span className="highlight">{pointsForNextTier}</span> more points to upgrade to {nextTier.name}.
              </p>
            )}
          </div>
        </div>

        <div className="tier-cards-container">
          <h2>Loyalty Tiers</h2>
          <div className="tier-cards">
            {loyaltyClasses.map((tier, index) => (
              <LoyaltyTierCard
                key={tier.id}
                tier={tier}
                pointsRequired={tierPointsThresholds[index].points}
                bookingsRequired={tierBookingThresholds[index].bookings}
                isCurrentTier={tier.id === customerData.currentClass}
                isNextTier={tier.id === nextTierIndex && hasNextTier}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyStats;
