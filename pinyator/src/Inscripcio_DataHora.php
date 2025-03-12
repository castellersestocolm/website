<html>
<head>
  <title>Pinyator - Inscrits esdeveniment DataHora</title>
  <meta charset="utf-8">
<?php include "$_SERVER[DOCUMENT_ROOT]/pinyator/Head.php";?>  
</head>
<?php include "$_SERVER[DOCUMENT_ROOT]/pinyator/Style.php";?>
<body>
<?php $menu=2; include "$_SERVER[DOCUMENT_ROOT]/pinyator/Menu.php"; 

$estat = intval($_GET["e"]);
$id = intval($_GET["id"]);
$nom = "";

?>
	<div>
	</div> 
	<table class='butons'>
		<tr class='butons'>
			<th class='butons'><a href="Event.php?e=<?php echo $estat?>" class="boto" >Torna</a></th>
		</tr>
	</table>

	<br>
<?php

include "$_SERVER[DOCUMENT_ROOT]/pinyator/Connexio.php";
?>
<label id="txtErrors"></label>
 <table class="llistes" id="llistaGlobal">
  <tr class="llistes">
	<th class="llistes">Posició</th>
    <th class="llistes">MALNOM</th>	
	<th class="llistes">Data hora</th>
	<th class="llistes">Diferència primer</th>
	<th class="llistes">Diferència anterior</th>
  </tr>
<?php

$sql="SELECT C.MALNOM, DATA_VINC
FROM CASTELLER AS C
LEFT JOIN EVENT AS E ON E.EVENT_ID=".$id."
LEFT JOIN INSCRITS AS I ON C.CASTELLER_ID=I.CASTELLER_ID AND I.EVENT_ID=E.EVENT_ID
WHERE I.ESTAT > 0
/*AND DATA_VINC >= DATA_NOVINC*/
ORDER BY DATA_VINC";

$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) > 0) 
{
	$Posicio = 1;
    // output data of each row
    while($row = mysqli_fetch_assoc($result)) 
	{
		if ($Posicio > 1)
		{
			$dif = date_diff(date_create($row["DATA_VINC"]) , $difAnt)->format('d:%d h:%h m:%i s:%s');
			$difPrimer = date_diff(date_create($row["DATA_VINC"]) , $dataHoraPrimer)->format('d:%d h:%h m:%i s:%s');
		}
		else
		{
			$dif="";
			$difPrimer="";
			$dataHoraPrimer=date_create($row["DATA_VINC"]);
		}
		$colorPosicio = "";
		
		switch ($Posicio) 
		{
			case 1:
				$colorPosicio = "style='background-color:gold;'";
				break;
			case 2:
				$colorPosicio = "style='background-color:silver;'";
				break;
			case 3:
				$colorPosicio = "style='background-color:orange;'";
				break;
		}

		echo "<tr class='llistes'>";
		echo "<td class='llistes' ".$colorPosicio.">".$Posicio."</td>";
		echo "<td class='llistes' ".$colorPosicio.">".$row["MALNOM"]."</td>";
		echo "<td class='llistes' ".$colorPosicio.">".$row["DATA_VINC"]."</td>";
		echo "<td class='llistes' ".$colorPosicio.">".$difPrimer."</td>";
		echo "<td class='llistes' ".$colorPosicio.">".$dif."</td>";
		echo "</tr>";
		
		$Posicio=$Posicio+1;
		$difAnt = date_create($row["DATA_VINC"]);
    }	
}
else if (mysqli_error($conn) != "")
{
    echo "Error: " . $sql . "<br>" . mysqli_error($conn);
}

mysqli_close($conn);
?>	  
	  
	</table> 
	<script>
		if ( ( window.innerWidth <= 600 ) && ( window.innerHeight <= 800 ) )
		{
			var elem = document.getElementById("llistaGlobal");
			elem.style.fontSize=12;
		}
	</script>
   </body>
</html>

