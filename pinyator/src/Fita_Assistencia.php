<html>
<head>
  <title>Pinyator - Fites</title>
  <meta charset="utf-8">
</head>
<?php include "$_SERVER[DOCUMENT_ROOT]/pinyator/Style.php";?>
<style>
	table
	{
		border-collapse:separate; 
        border-spacing:0 15px;
	}
	td
	{
		padding:10px;
		height:80px;
		border-radius: 10px;
	}	
	td.fita
	{
		background-color:lemonchiffon;
		border: 2px solid #ff9933;
	}	
	td.done
	{
		background-color:palegreen;
		border: 2px solid 	mediumseagreen;
	}
	td.not
	{
		background-color:Silver;
		border: 2px solid darkgray;
		color: White;
	}
</style>
<body style='background-color:#cce6ff;'>
<div style='position: fixed; z-index: -1; width: 90%; height: 80%;background-image: url("icons/trofeo.png");background-repeat: no-repeat; 
background-attachment: fixed;  background-position: center; opacity:0.4'>
</div>
<div>

<?php 
$valor=0;
$cookie_name = "marrec_inscripcio";
if (isset($_COOKIE[$cookie_name]))
{

	include "$_SERVER[DOCUMENT_ROOT]/pinyator/Connexio.php";
	
	$sql="SELECT HASHTAG, ASSISTENCIA, ASSISTENCIA_ANTERIOR
	FROM FITA_ASSISTENCIA";

	$result = mysqli_query($conn, $sql);

	if (mysqli_num_rows($result) > 0) 
	{
		$row = mysqli_fetch_assoc($result);		
		mysqli_data_seek($result, 0);
		
		// output data of each row
		while($row = mysqli_fetch_assoc($result)) 
		{	
			echo "<h2>#".$row["HASHTAG"]."</h2>";
			echo "<b>ASSISTÈNCIA ACTUAL: " . $row["ASSISTENCIA"]."<b>";	
			
			$valor= (($row["ASSISTENCIA"]*400/1000));
			$valorTop= 100+400-$valor;
		}
	}
	else if (mysqli_error($conn) != "")
	{
		echo "Error: " . $sql . "<br>" . mysqli_error($conn);
	}
	
	mysqli_close($conn);
}
else
{
	echo "<meta http-equiv='refresh' content='0; url=Apuntat.php'/>";	
}
?>	
	<div style='position:absolute; overflow:hidden; top:100px; left:20px;'>
		<img src='icons/Marrecs_Trans.png' width=300 height=400>
	</div>
	<div style='position:absolute; overflow:hidden; display: flex; align-items:flex-end; top:<?php echo $valorTop;?>px; left:20px; height:<?php echo $valor;?>px;'>
		<img src='icons/Marrecs_Color.png' width=300 height=400>
	</div>
</div>  

   </body> 
</html>