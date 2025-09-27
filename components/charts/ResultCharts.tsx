'use client';

import { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface ResultChartsProps {
  aboIndex: number;
  radarData: any[];
  categoryScores: Record<string, number>;
  categoryNames: Record<string, string>;
}

export function GaugeChart({ aboIndex }: { aboIndex: number }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const gaugeData = [
    { name: 'score', value: aboIndex, fill: getGaugeColor(aboIndex) },
    { name: 'remaining', value: 100 - aboIndex, fill: '#f3f4f6' },
  ];

  function getGaugeColor(score: number) {
    if (score < 30) return '#10b981'; // green
    if (score < 50) return '#f59e0b'; // yellow
    if (score < 70) return '#fb923c'; // orange
    return '#ef4444'; // red
  }

  // SSR 시 스켈레톤 표시
  if (!isClient) {
    return (
      <div className="relative">
        <div className="w-full h-[200px] flex items-center justify-center">
          <div className="w-48 h-24 bg-gray-200 animate-pulse rounded-full"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center mt-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">
              {aboIndex}
            </div>
            <div className="text-sm text-gray-500">/ 100</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={gaugeData}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={120}
            dataKey="value"
          >
            {gaugeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center mt-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">
            {aboIndex}
          </div>
          <div className="text-sm text-gray-500">/ 100</div>
        </div>
      </div>
    </div>
  );
}

export function RadarChartComponent({ radarData }: { radarData: any[] }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // SSR 시 스켈레톤 표시
  if (!isClient) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-full"></div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="category"
          className="text-xs"
          tick={{ fontSize: 12 }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={{ fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name="점수"
          dataKey="score"
          stroke="#A0568C"
          fill="#A0568C"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function CategoryBars({ 
  categoryScores, 
  categoryNames 
}: { 
  categoryScores: Record<string, number>;
  categoryNames: Record<string, string>;
}) {
  const [isClient, setIsClient] = useState(false);
  const [animationTriggered, setAnimationTriggered] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 애니메이션 트리거를 약간 지연
    const timer = setTimeout(() => setAnimationTriggered(true), 100);
    return () => clearTimeout(timer);
  }, []);

  function getGaugeColor(score: number) {
    if (score < 30) return '#10b981';
    if (score < 50) return '#f59e0b';
    if (score < 70) return '#fb923c';
    return '#ef4444';
  }

  // SSR 시 스켈레톤 표시
  if (!isClient) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <div className="flex justify-between mb-2">
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-8 bg-gray-200 animate-pulse rounded"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 bg-gray-300 animate-pulse rounded-full w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(categoryScores).map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {categoryNames[key as keyof typeof categoryNames]}
            </span>
            <span className="text-sm font-bold text-gray-900">
              {Math.round(value)}점
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: animationTriggered ? `${value}%` : '0%',
                backgroundColor: getGaugeColor(value),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}