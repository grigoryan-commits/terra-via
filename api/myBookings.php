<?php
require __DIR__ . '/db.php';
$user = requireAuth();

$stmt = $pdo->prepare(
    'SELECT b.id_booking, b.persons, b.total_price, b.status, b.created_at, d.date_start, d.nights,
            d.departure_city, t.id_tour, t.title, t.image, c.name AS country,
            EXISTS(SELECT 1 FROM reviews r WHERE r.id_user = b.id_user AND r.id_tour = t.id_tour) AS has_review
     FROM bookings b
     JOIN departures d ON d.id_departure = b.id_departure
     JOIN tours t ON t.id_tour = d.id_tour
     JOIN hotels h ON h.id_hotel = t.id_hotel
     JOIN countries c ON c.id_country = h.id_country
     WHERE b.id_user = ?
     ORDER BY d.date_start DESC'
);
$stmt->execute([$user['id_user']]);
respond(['bookings' => $stmt->fetchAll(), 'user' => $user]);
