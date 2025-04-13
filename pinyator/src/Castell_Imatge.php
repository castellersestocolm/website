<?php
    $requireLogin = false;
    $id = intval($_GET['id']);
    require "$_SERVER[DOCUMENT_ROOT]/pinyator/Castell_Fitxa.php";
?>

<style>
    body {
        display: none;
    }
</style>

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

	body.innerHTML = "<img src='"+canvas.toDataURL("image/jpeg")+"' alt='from canvas'/>";
	body.style.width = "fit-content";
	body.style.padding = "0";

	document.getElementsByTagName('html')[0].style.width = "fit-content";

	/*var link = document.createElement('a');
    link.download = "pinya.jpg";
    link.href = canvas.toDataURL("image/jpeg")
    link.click();*/

	isDownloading = false;
	invalidate();
</script>
