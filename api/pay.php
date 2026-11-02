<?php
require __DIR__ . '/db.php';
requireMethod('POST');
$user = requireAuth();

$d = input();
$id = (int)($d['id'] ?? 0);
$method = in_array($d['method'] ?? '', ['Карта', 'СБП'], true) ? $d['method'] : null;
if (!$method) {
    respond(['message' => 'Выберите способ оплаты'], 422);
}

$pdo->beginTransaction();
$stmt = $pdo->prepare('SELECT total_price, status FROM bookings WHERE id_booking = ? AND id_user = ? FOR UPDATE');
$stmt->execute([$id, $user['id_user']]);
$b = $stmt->fetch();

if (!$b || $b['status'] !== 'confirmed') {
    $pdo->rollBack();
    respond(['message' => 'Оплатить можно только бронирование, подтверждённое менеджером'], 422);
}

$pdo->prepare('INSERT INTO payments (id_booking, amount, method) VALUES (?, ?, ?)')->execute([$id, $b['total_price'], $method]);
$pdo->prepare("UPDATE bookings SET status = 'paid' WHERE id_booking = ?")->execute([$id]);
$pdo->commit();

respond(['message' => 'Оплата прошла успешно']);
