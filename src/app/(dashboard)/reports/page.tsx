'use client';

import ReportTabs from '@/components/reports/ReportTabs';

export default function ReportsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Reportes y Estadísticas</h1>
          <p className="text-gray-400 text-sm">Análisis del rendimiento de tu negocio</p>
        </div>
        <ReportTabs />
      </div>
    </div>
  );
}
