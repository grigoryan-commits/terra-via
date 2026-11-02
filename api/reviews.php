<?php
require __DIR__ . '/db.php';

$rows = $pdo->query(
    'SELECT r.rating, r.content, r.created_at, u.first_name, u.last_name, t.title AS tour
     FROM reviews r
     JOIN users u ON u.id_user = r.id_user
     JOIN tours t ON t.id_tour = r.id_tour
     WHERE r.is_published = 1
     ORDER BY r.created_at DESC LIMIT 6'
)->fetchAll();
respond(['reviews' => $rows]);
