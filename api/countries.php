<?php
require __DIR__ . '/db.php';

$rows = $pdo->query(
    'SELECT c.id_country, c.name, c.region, c.visa_required, c.description, c.image,
            COUNT(DISTINCT t.id_tour) AS tours_count, MIN(d.price) AS min_price
     FROM countries c
     LEFT JOIN hotels h ON h.id_country = c.id_country
     LEFT JOIN tours t ON t.id_hotel = h.id_hotel AND t.is_active = 1
     LEFT JOIN departures d ON d.id_tour = t.id_tour AND d.date_start >= CURDATE() AND d.seats_left > 0
     GROUP BY c.id_country
     ORDER BY tours_count DESC, c.name'
)->fetchAll();
respond(['countries' => $rows]);
