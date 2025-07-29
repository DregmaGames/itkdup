import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface CertifierStatsCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
}

export const CertifierStatsCard: React.FC<CertifierStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};