<?php
$service = htmlspecialchars($_POST['service'] ?? '');
$name = htmlspecialchars($_POST['name'] ?? '');
$phone = htmlspecialchars($_POST['phone'] ?? '');
$email = htmlspecialchars($_POST['email'] ?? '');
$message = htmlspecialchars($_POST['message'] ?? '');

$data = "-------------------------------\n";
$data .= "Datum: " . date("d-m-Y H:i") . "\n";
$data .= "Dienst: $service\n";
$data .= "Naam: $name\n";
$data .= "Telefoon: $phone\n";
$data .= "Email: $email\n";
$data .= "Bericht:\n$message\n";
$data .= "-------------------------------\n\n";

file_put_contents("/var/www/deketelmeester.nl/offertes.txt", $data, FILE_APPEND);

header("Location: /bedankt.html");
exit;
?>
