import React from 'react';
import '../styles/components/Skeleton.css';

export const Skeleton = ({ width, height, borderRadius = '8px', className = '' }) => {
  return (
    <div
      className={`sgc-skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="view-section active">
      <div className="sgc-page-header">
        <div className="sgc-page-title-block">
          <Skeleton width="180px" height="32px" />
          <Skeleton width="280px" height="16px" style={{ marginTop: '8px' }} />
        </div>
        <Skeleton width="150px" height="40px" />
      </div>

      <div className="sgc-kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '1.75rem' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="sgc-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Skeleton width="48px" height="48px" borderRadius="14px" />
            <div>
              <Skeleton width="80px" height="12px" />
              <Skeleton width="40px" height="24px" style={{ marginTop: '8px' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.25rem' }}>
        <div className="sgc-card">
          <Skeleton width="150px" height="24px" style={{ marginBottom: '20px' }} />
          <Skeleton width="100%" height="280px" />
        </div>
        <div className="sgc-card">
          <Skeleton width="150px" height="24px" style={{ marginBottom: '20px' }} />
          <Skeleton width="100%" height="280px" />
        </div>
      </div>
    </div>
  );
};
