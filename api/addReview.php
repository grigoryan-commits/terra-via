<?php
require __DIR__ . '/db.php';
requireMethod('POST');
$user = requireAuth();

$d = input();
$tourId = (int)($d['tourId'] ?? 0);
$rating = (int)($d['rating'] ?? 0);
$content = clean($d['content'] ?? '', 2000);

if ($rating < 1 || $rating > 5 || mb_strlen($content) < 10) {
    respond(['message' => 'Поставьте оценку от 1 до 5 и напишите отзыв не короче 10 символов'], 422);
}

$stmt = $pdo->prepare(
    "SELECT 1 FROM bookings b JOIN departures d ON d.id_departure = b.id_departure
     WHERE b.id_user = ? AND d.id_tour = ? AND b.status = 'paid' AND d.date_start <= CURDATE()"
);
$stmt->execute([$user['id_user'], $tourId]);
if (!$stmt->fetch()) {
    respond(['message' => 'Отзыв можно оставить только о туре, в котором вы уже побывали'], 403);
}

$stmt = $pdo->prepare('SELECT 1 FROM reviews WHERE id_user = ? AND id_tour = ?');
$stmt->execute([$user['id_user'], $tourId]);
if ($stmt->fetch()) {
    respond(['message' => 'Вы уже оставили отзыв об этом туре'], 409);
}

$pdo->prepare('INSERT INTO reviews (id_user, id_tour, rating, content) VALUES (?, ?, ?, ?)')
    ->execute([$user['id_user'], $tourId, $rating, $content]);
respond(['message' => 'Спасибо! Отзыв появится на сайте после проверки модератором'], 201);
