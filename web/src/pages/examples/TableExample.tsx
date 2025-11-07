import DataTable, { Column } from '@/components/lists/DataTable';

export default function TableExample(){
  type Row = { id: number; name: string; status: string; amount: number };
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Nom', sortable: true },
    { key: 'status', header: 'Statut', sortable: true },
    { key: 'amount', header: 'Montant', sortable: true, accessor: (r) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(r.amount) },
  ];

  const data: Row[] = [
    { id: 1, name: 'Projet A', status: 'En cours', amount: 1000000 },
    { id: 2, name: 'Projet B', status: 'Planifié', amount: 500000 },
    { id: 3, name: 'Projet C', status: 'Terminé', amount: 2500000 },
  ];

  return (
    <DataTable columns={columns} data={data} pagination={{ current: 1, total: 1 }} />
  );
}
