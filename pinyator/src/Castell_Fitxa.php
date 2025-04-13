<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pinyator - Castell</title>
<?php
    if(!isset($requireLogin) || $requireLogin){
        include "$_SERVER[DOCUMENT_ROOT]/pinyator/Head.php";
    }
 ?>
  <script src="llibreria/castell.js?1.5"></script>
  <script src="llibreria/disseny.js?1.5"></script>  
</head>
<?php include "$_SERVER[DOCUMENT_ROOT]/pinyator/Style.php";?>
<body>
<?php include "$_SERVER[DOCUMENT_ROOT]/pinyator/Castell_Fitxa_Body.php"; ?>
</body>
</html>