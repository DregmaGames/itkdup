import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { DocumentStatus } from '../../../types/documents';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  type: 'djc' | 'certificate';
  hasDocument?: boolean;
  className?: string;
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
  status,
  type,
  hasDocument = false,
  className = ''
}) => {
  const getStatusConfig = () => {
    if (!hasDocument) {
      return {
        icon: XCircle,
        text: 'Faltante',
        colors: 'bg-red-100 text-red-800 border-red-200'
      };
    }

    switch (status) {
      case 'uploaded':
        return {
          icon: CheckCircle,
          text: 'Subido',
          colors: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Pendiente',
          colors: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'expired':
        return {
          icon: AlertTriangle,
          text: 'Vencido',
          colors: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'missing':
      default:
        return {
          icon: XCircle,
          text: 'Faltante',
          colors: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const typeLabel = type === 'djc' ? 'DJC' : 'Certificado';

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${config.colors} ${className}`}>
      <Icon className="w-4 h-4 mr-2" />
      <span>{typeLabel}: {config.text}</span>
    </div>
  );
};

interface DocumentStatusIndicatorProps {
  type: 'djc' | 'certificate';
  hasDocument: boolean;
  status?: DocumentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const DocumentStatusIndicator: React.FC<DocumentStatusIndicatorProps> = ({
  type,
  hasDocument,
  status = 'missing',
  size = 'md'
}) => {
  const getStatusColor = () => {
    if (!hasDocument) return 'bg-gray-400';
    
    switch (status) {
      case 'uploaded':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'expired':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const typeIcon = type === 'djc' ? FileText : CheckCircle;
  const IconComponent = typeIcon;

  return (
    <div className="flex items-center space-x-1">
      <div className={`${sizeClasses[size]} ${getStatusColor()} rounded-full`} />
      <IconComponent className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-600`} />
    </div>
  );
};