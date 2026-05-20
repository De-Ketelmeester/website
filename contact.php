<?php
$naam = htmlspecialchars($_POST['naam'] ?? '');
$email = htmlspecialchars($_POST['email'] ?? '');
$telefoon = htmlspecialchars($_POST['telefoon'] ?? '');
$bericht = htmlspecialchars($_POST['bericht'] ?? '');

$data = "-------------------------------\n";
$data .= "Datum: " . date("d-m-Y H:i") . "\n";
$data .= "Naam: $naam\n";
$data .= "Email: $email\n";
$data .= "Telefoon: $telefoon\n";
$data .= "Bericht:\n$bericht\n";
$data .= "-------------------------------\n\n";

file_put_contents("/var/www/deketelmeester.nl/messages.txt", $data, FILE_APPEND);

header("Location: /bedankt.html");
exit;
?>
