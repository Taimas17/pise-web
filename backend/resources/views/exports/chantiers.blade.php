<!doctype html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>Chantiers</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
<h2>Chantiers</h2>
<table>
    <thead>
    <tr>
        <th>ID</th>
        <th>Titre</th>
        <th>Type</th>
        <th>Zone</th>
        <th>Statut</th>
        <th>Avancement %</th>
        <th>Budget prévu</th>
        <th>Budget engagé</th>
        <th>Budget réalisé</th>
        <th>Début prévu</th>
        <th>Fin prévue</th>
        <th>Fin réelle</th>
    </tr>
    </thead>
    <tbody>
    @foreach($chantiers as $c)
        <tr>
            <td>{{ $c->id }}</td>
            <td>{{ $c->title }}</td>
            <td>{{ optional($c->type)->name }}</td>
            <td>{{ optional($c->zone)->name }}</td>
            <td>{{ $c->status }}</td>
            <td>{{ number_format((float)$c->progress_pct, 2) }}</td>
            <td>{{ number_format((float)$c->budget_planned, 2) }}</td>
            <td>{{ number_format((float)$c->budget_committed, 2) }}</td>
            <td>{{ number_format((float)$c->budget_actual, 2) }}</td>
            <td>{{ optional($c->planned_start_at)->format('Y-m-d') }}</td>
            <td>{{ optional($c->planned_end_at)->format('Y-m-d') }}</td>
            <td>{{ optional($c->actual_end_at)->format('Y-m-d') }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
</body>
</html>
