<?php
require __DIR__ . '/config.php';
requireMethod('POST');
$user = requireAuth(['admin', 'manager']);

$d = input();
$table = (string)($d['table'] ?? '');
$cfg = tableConfig($table, $user);
$id = (int)($d['id'] ?? 0);
$values = prepareValues($pdo, $table, (array)($d['row'] ?? []), false);

$set = implode(', ', array_map(fn($c) => "`$c` = ?", array_keys($values)));
try {
    $stmt = $pdo->prepare("UPDATE `$table` SET $set WHERE `{$cfg['pk']}` = ?");
    $stmt->execute([...array_values($values), $id]);
} catch (PDOException $e) {
    dbError($e);
}
respond(['message' => 'Изменения сохранены']);
