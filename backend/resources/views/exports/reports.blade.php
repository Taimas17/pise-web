<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Export des signalements</title>
    <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
<h2>Signalements</h2>
<table>
    <thead>
        <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Zone</th>
            <th>Criticité</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
    @foreach($reports as $r)
        <tr>
            <td>{{ $r->id }}</td>
            <td>{{ optional($r->type)->name }}</td>
            <td>{{ optional($r->zone)->name }}</td>
            <td>{{ $r->criticality }}</td>
            <td>{{ $r->status }}</td>
            <td>{{ $r->created_at }}</td>
            <td>{{ \Illuminate\Support\Str::limit($r->description, 120) }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
</body>
</html>
