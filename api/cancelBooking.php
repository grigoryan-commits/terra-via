<?php
require __DIR__ . '/db.php';
requireMethod('POST');
$user = requireAuth();

$id = (int)(input()['id'] ?? 0);

$pdo->beginTransaction();
$stmt = $pdo->prepare(
    'SELECT b.id_departure, b.persons, b.status, d.date_start FROM bookings b
     JOIN departures d ON d.id_departure = b.id_departure
     WHERE b.id_booking = ? AND b.id_user = ? FOR UPDATE'
);
$stmt->execute([$id, $user['id_user']]);
$b = $stmt->fetch();

if (!$b) {
    $pdo->rollBack();
    respond(['message' => 'Бронирование не найдено'], 404);
}
if (!in_array($b['status'], ['new', 'confirmed'], true)) {
    $pdo->rollBack();
    respond(['message' => 'Оплаченное или отменённое бронирование отменить онлайн нельзя. Свяжитесь с менеджером'], 422);
}

$pdo->prepare("UPDATE bookings SET status = 'cancelled' WHERE id_booking = ?")->execute([$id]);
$pdo->prepare('UPDATE departures SET seats_left = seats_left + ? WHERE id_departure = ?')->execute([$b['persons'], $b['id_departure']]);
$pdo->commit();

respond(['message' => 'Бронирование отменено']);
