<?php
require __DIR__ . '/config.php';
$user = requireAuth(['admin', 'manager']);

$table = (string)($_GET['table'] ?? '');
$cfg = tableConfig($table, $user);

$columns = array_values(array_filter(
    tableColumns($pdo, $table),
    fn($c) => !in_array($c['name'], $cfg['hidden'] ?? [], true)
));
foreach ($columns as &$c) {
    if ($c['type'] === 'enum') {
        preg_match_all("/'((?:[^']|'')*)'/", $c['column_type'], $m);
        $c['options'] = $m[1];
    }
}
unset($c);

$select = implode(', ', array_map(fn($c) => '`' . $c['name'] . '`', $columns));
$rows = $pdo->query("SELECT $select FROM `$table` ORDER BY `{$cfg['pk']}` DESC")->fetchAll();

respond(['table' => $table, 'title' => $cfg['title'], 'pk' => $cfg['pk'], 'columns' => $columns, 'rows' => $rows,
    'needsPassword' => $table === 'users']);
