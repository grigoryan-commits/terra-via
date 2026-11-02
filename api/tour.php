<?php
require __DIR__ . '/db.php';

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    respond(['message' => 'Некорректный идентификатор тура'], 400);
}

$stmt = $pdo->prepare(
    'SELECT t.id_tour, t.title, t.tour_type, t.description, t.image, h.name AS hotel, h.city, h.stars,
            h.food_type, h.description AS hotel_description, c.name AS country, c.visa_required
     FROM tours t
     JOIN hotels h ON h.id_hotel = t.id_hotel
     JOIN countries c ON c.id_country = h.id_country
     WHERE t.id_tour = ? AND t.is_active = 1'
);
$stmt->execute([$id]);
$tour = $stmt->fetch();
if (!$tour) {
    respond(['message' => 'Тур не найден'], 404);
}

$stmt = $pdo->prepare(
    'SELECT id_departure, departure_city, date_start, nights, price, seats_left
     FROM departures WHERE id_tour = ? AND date_start >= CURDATE() ORDER BY date_start'
);
$stmt->execute([$id]);
$tour['departures'] = $stmt->fetchAll();

$stmt = $pdo->prepare(
    'SELECT r.rating, r.content, r.created_at, u.first_name
     FROM reviews r JOIN users u ON u.id_user = r.id_user
     WHERE r.id_tour = ? AND r.is_published = 1 ORDER BY r.created_at DESC'
);
$stmt->execute([$id]);
$tour['reviews'] = $stmt->fetchAll();

respond(['tour' => $tour]);
