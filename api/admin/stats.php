<?php
require __DIR__ . '/config.php';
requireAuth(['admin', 'manager']);

$one = fn(string $sql) => $pdo->query($sql)->fetchColumn();
respond([
    'newBookings' => (int)$one("SELECT COUNT(*) FROM bookings WHERE status = 'new'"),
    'newRequests' => (int)$one("SELECT COUNT(*) FROM requests WHERE status = 'new'"),
    'pendingReviews' => (int)$one('SELECT COUNT(*) FROM reviews WHERE is_published = 0'),
    'revenue' => (float)$one('SELECT COALESCE(SUM(amount), 0) FROM payments'),
    'clients' => (int)$one("SELECT COUNT(*) FROM users WHERE role = 'client'"),
    'activeTours' => (int)$one('SELECT COUNT(*) FROM tours WHERE is_active = 1'),
]);
