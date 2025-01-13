export interface FormData {
  parkingStalls: number;
  approachWidth: number;
  drivewayWidth: number;
  buildingArea: number;
  taperedDriveway: boolean;
}

export interface SiteMetrics {
  propertyArea: number;
  imperviousSurface: number;
  drivewayArea: number;
  parkingArea: number;
  parkingStallsArea: number;
  handicappedStallsCount: number;
  totalParkingStalls: number;
  sidewalkArea: number;
  garbageArea: number;
  actualBuildingArea: number;
  approachArea: number;
  bikeParkingArea: number;
}

// SitePlanGenerator.tsx
import React, { useState, ChangeEvent } from 'react';

import './SitePlanDesigner.scss';
import { Card, CardHeader, CardTitle, CardContent, Input } from '../../components/ui';

const initialFormData: FormData = {
  parkingStalls: 4,
  approachWidth: 20,
  drivewayWidth: 24,
  buildingArea: 1500,
  taperedDriveway: true
};

const initialMetrics: SiteMetrics = {
  propertyArea: 12192,
  imperviousSurface: 12192,
  drivewayArea: 521,
  parkingArea: 936,
  parkingStallsArea: 1156,
  handicappedStallsCount: 0,
  totalParkingStalls: 8,
  sidewalkArea: 0,
  garbageArea: 2808,
  actualBuildingArea: 5851,
  approachArea: 62,
  bikeParkingArea: 0
};

const SitePlanGenerator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [metrics, setMetrics] = useState<SiteMetrics>(initialMetrics);

  const handleInputChange = (field: keyof FormData, value: number | boolean): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberInput = (e: ChangeEvent<HTMLInputElement>, field: keyof FormData): void => {
    const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      handleInputChange(field, value);
    }
  };

  const formatMetricValue = (key: keyof SiteMetrics, value: number): string => {
    const formattedValue = value.toLocaleString();
    return key.toLowerCase().includes('area') ? `${formattedValue} sq ft` : formattedValue;
  };

  const formatMetricLabel = (key: string): string => {
    return key.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="site-plan-generator">
      <div className="site-plan-generator__container">
        {/* Left Column - Controls */}
        <div className="site-plan-generator__controls">
          <Card>
            <CardHeader>
              <CardTitle>Site Plan Generator</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Input Controls */}
              <div className="site-plan-generator__section-header">
                <h3>Input Parameters</h3>
              </div>
              
              <div className="site-plan-generator__input-group">
                <label htmlFor="parkingStalls">Parking Stalls</label>
                <Input 
                  id="parkingStalls"
                  type="number"
                  min={0}
                  value={formData.parkingStalls}
                  onChange={(e) => handleNumberInput(e, 'parkingStalls')}
                />
              </div>
              
              <div className="site-plan-generator__input-group">
                <label htmlFor="approachWidth">Approach Width (ft)</label>
                <Input 
                  id="approachWidth"
                  type="number"
                  min={0}
                  value={formData.approachWidth}
                  onChange={(e) => handleNumberInput(e, 'approachWidth')}
                />
              </div>

              <div className="site-plan-generator__input-group">
                <label htmlFor="drivewayWidth">Driveway Width (ft)</label>
                <Input 
                  id="drivewayWidth"
                  type="number"
                  min={0}
                  value={formData.drivewayWidth}
                  onChange={(e) => handleNumberInput(e, 'drivewayWidth')}
                />
              </div>

              <div className="site-plan-generator__input-group">
                <label htmlFor="buildingArea">Building Area (sq ft)</label>
                <Input 
                  id="buildingArea"
                  type="number"
                  min={0}
                  value={formData.buildingArea}
                  onChange={(e) => handleNumberInput(e, 'buildingArea')}
                />
              </div>

              <div className="site-plan-generator__checkbox">
                {/* <Checkbox 
                  id="taperedDriveway"
                  checked={formData.taperedDriveway}
                  onCheckedChange={(checked: boolean) => handleInputChange('taperedDriveway', checked)}
                /> */}
                <label htmlFor="taperedDriveway">Tapered Driveway</label>
              </div>


              {/* Metrics Display */}
              <div className="site-plan-generator__section-header">
                <h3>Site Metrics</h3>
              </div>
              
              <div className="site-plan-generator__metrics-container">
                {(Object.entries(metrics) as [keyof SiteMetrics, number][]).map(([key, value]) => (
                  <div key={key} className="site-plan-generator__metrics-item">
                    <span className="label">
                      {formatMetricLabel(key)}
                    </span>
                    <span className="value">
                      {formatMetricValue(key, value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Visualization */}
        <div className="site-plan-generator__visualization">
          <Card>
            <CardHeader>
              <CardTitle>Site Plan Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="site-plan-generator__visualization-container">
                <div className="placeholder">
                  {/* <Info size={24} /> */}
                  <span>Site plan visualization will render here</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SitePlanGenerator;