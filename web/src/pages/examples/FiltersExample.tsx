import { useState } from 'react';
import FilterPanel, { FilterDescriptor } from '@/components/filters/FilterPanel';
import DataList from '@/components/lists/DataList';
import { ReportCard } from '@/components/reports/ReportCard';

export default function FiltersExample(){
  const [filters, setFilters] = useState<Record<string, any>>({});
  const filterDefs: FilterDescriptor[] = [
    { type: 'search', name: 'q', label: 'Rechercher' },
    { type: 'select', name: 'status', label: 'Statut', options: [
      { label: 'En attente', value: 'pending' },
      { label: 'Approuvé', value: 'approved' },
      { label: 'Assigné', value: 'assigned' },
      { label: 'En cours', value: 'in_progress' },
      { label: 'Résolu', value: 'resolved' },
      { label: 'Rejeté', value: 'rejected' },
    ] },
    { type: 'select', name: 'criticality', label: 'Criticité', options: [
      { label: 'Faible', value: 'low' },
      { label: 'Moyenne', value: 'medium' },
      { label: 'Haute', value: 'high' },
      { label: 'Critique', value: 'critical' },
    ] },
    { type: 'date-range', name: 'dates', label: 'Période' },
    { type: 'cascade', name: 'zone_id', label: 'Zone' },
  ];

  const mockReports = Array.from({ length: 8 }).map((_, i) => ({
    id: i+1,
    infrastructure_type_id: 1,
    infrastructure_type: { id: 1, name: 'Voirie', created_at: '', updated_at: '' },
    description: 'Dos d’âne endommagé et dangereux pour les riverains',
    status: 'pending',
    criticality: 'medium',
    location: { lat: 0, lng: 0 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as any));

  return (
    <div className="space-y-4">
      <FilterPanel
        filters={filterDefs}
        values={filters}
        onChange={(name, value) => setFilters((f) => ({ ...f, [name]: value }))}
        onReset={() => setFilters({})}
      />

      <DataList
        data={mockReports}
        renderItem={(r) => <ReportCard report={r as any} />}
      />
    </div>
  );
}
