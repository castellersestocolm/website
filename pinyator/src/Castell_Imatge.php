<!DOCTYPE html>
<html style="width: 100%; height: 100%;">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pinyator - Castell</title>
  <script src="llibreria/castell.js?1.5"></script>
  <script src="llibreria/disseny.js?1.5"></script>
    <style>
    body {
        display: none;
    }
</style>
</head>
<?php include "$_SERVER[DOCUMENT_ROOT]/pinyator/Style.php";?>
<body style="width: 100%; height: 100%; padding: 0;">

<?php
    $requireLogin = false;
    $id = intval($_GET['id']);

    include "$_SERVER[DOCUMENT_ROOT]/pinyator/Castell_Fitxa_Body.php";
?>

<script>
    isDownloading = true;
	invalidate();
	draw();
	var imgHeight=GetMaxY()+50;
	var imgWidth=GetMaxX();

	var canvasImg = document.getElementById("canvas1");
	ctxImg = canvasImg.getContext('2d');

	var canvas = document.createElement('canvas');
	canvas.height = imgHeight;
	canvas.width = imgWidth;
	var imgData=ctxImg.getImageData(0,0,imgWidth,imgHeight);
	canvas.getContext('2d').putImageData(imgData,0,0);

	var body = document.getElementsByTagName('body')[0];

	body.innerHTML = "<img src='"+canvas.toDataURL("image/jpeg")+"' alt='from canvas' style='max-width: 100%; height: 100%;'/>";
	body.style.display = "block";

	isDownloading = false;
	invalidate();
</script>
</body>
</html>