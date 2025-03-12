<html>
<head>
	<title>Pinyator</title>
</head>
<?php include "$_SERVER[DOCUMENT_ROOT]/pinyator/Style.php";?>
<style>
td {padding:15px}
</style>
<body>
<?php $menu=10; include "$_SERVER[DOCUMENT_ROOT]/pinyator/Menu.php";

	include "$_SERVER[DOCUMENT_ROOT]/pinyator/Connexio.php";
	
	$temporada = "";
	$resolucioPantalla = "";
	$visualitzarFites = 0;
	$visualitzarPenya = 0;
	$visualitzarDiferencies = 0;
	$visualitzarPercentatgeAssistencia = 0;
	$urlApp = "";
	$iconaApp = "";
	
	echo "<form method='post' action='Configuracio_Desa.php'>";

	$sql="SELECT TEMPORADA, RESOLUCIOPANTALLA, FITES, PARTICIPANTS, DIFERENCIES,
	PERCENATGEASSISTENCIA, APPEXTERNA, LOGOAPPEXTERNA
	FROM CONFIGURACIO";

	$result = mysqli_query($conn, $sql);

	if (mysqli_num_rows($result) > 0) 
	{
		while($row = mysqli_fetch_assoc($result))
		{
			$temporada = $row["TEMPORADA"];
			$resolucioPantalla = $row["RESOLUCIOPANTALLA"];
			$visualitzarFites = $row["FITES"];
			$visualitzarPenya = $row["PARTICIPANTS"];
			$visualitzarDiferencies = $row["DIFERENCIES"];
			$visualitzarPercentatgeAssistencia = $row["PERCENATGEASSISTENCIA"];
			$urlApp = $row["APPEXTERNA"]; 
			$iconaApp = $row["LOGOAPPEXTERNA"]; 			
		}
	}
	else if (mysqli_error($conn) != "")
	{
		echo "Error: " . $sql . "<br>" . mysqli_error($conn);
	}
	
	$sql="SELECT HASHTAG, ASSISTENCIA, ASSISTENCIA_ANTERIOR
	FROM FITA_ASSISTENCIA";

	$result = mysqli_query($conn, $sql);

	if (mysqli_num_rows($result) > 0) 
	{
		while($row = mysqli_fetch_assoc($result))
		{
			$hashtagAssistencia = $row["HASHTAG"];
			$assistencia = $row["ASSISTENCIA"];
			$assistencia_anterior = $row["ASSISTENCIA_ANTERIOR"];			
		}
	}
	else if (mysqli_error($conn) != "")
	{
		echo "Error: " . $sql . "<br>" . mysqli_error($conn);
	}
?>
	
	<div style="position:absolute;left:20px;width:500px">
		<div class="form_group">
		<table width=300>
			<tr>
				<td>
					<a href="Fites.php" class="boto">Fites</a> &nbsp &nbsp Activar
					<label class="switch">texte
						<input type="checkbox" name="fites" value=1 <?php if ($visualitzarFites == 1) echo " checked";?>>
						<span class="slider round"></span>
					</label>
				</td>
			</tr><tr>
				<td>
					<a href="Documentacio.php" class="boto">Documentació</a>
					<a href="Usuari.php" class="boto">Usuaris</a>
					<a href="Posicio.php" class="boto">Poscions</a>
				</td>
			</tr><tr>
				<td>
					<label>TEMPORADA</label>
					<input type="text" class="form_edit" name="temporada" value="<?php echo $temporada ?>" autofocus required>
				</td>
			</tr><tr>
				<td>
					<label>Resolució pantalla(amplada)</label>
					<input type="number" class="form_edit" name="resoluciopantalla" value="<?php echo $resolucioPantalla ?>"required>
				</td>
			</tr><tr>
				<td>
					<label>Visualitzar participants</label>
					<label class="switch">texte
						<input type="checkbox" name="participants" value=1 <?php if ($visualitzarPenya == 1) echo " checked";?>>
						<span class="slider round"></span>
					</label>
				</td>
			</tr><tr>
				<td>
					<label>Visualitzar diferències</label>
					<label class="switch">texte
						<input type="checkbox" name="diferencies" value=1 <?php if ($visualitzarDiferencies == 1) echo " checked";?>>
						<span class="slider round"></span>
					</label>
				</td>
			</tr><tr>
				<td>
					<label>Visualitzar % assistència</label>
					<label class="switch">texte
						<input type="checkbox" name="percentAssistencia" value=1 <?php if ($visualitzarPercentatgeAssistencia == 1) echo " checked";?>>
						<span class="slider round"></span>
					</label>
				</td>
			</tr><tr>
				<td>
					<button type="Submit" name= "Desa" value="desar" class="boto">Desa</button>
				</td>
			</tr>
		</table>
		</div>
	</div>
	<div style="position:absolute;left:350px;width:350px; border-color: blue; border-style: solid">
		<div class="form_group">
		<b>FITA ASSISTÈNCIA</b>
		<table width=300>
			<tr>	
				<td>
					<label>HASHTAG</label>
					<input type="text" class="form_edit" name="hashtagAssistencia" value="<?php echo $hashtagAssistencia ?>">
				</td>
			</tr>
			<tr>	
				<td>
					<label>Assistència actual</label>
					<input type="number" class="form_edit" name="assistencia" value="<?php echo $assistencia ?>">
				</td>
			</tr>
			<tr>
				<td>
					<label>Assistència anterior</label>
					<input type="number" class="form_edit" name="assistencia_anterior" value="<?php echo $assistencia_anterior ?>" readonly>
				</td>
			</tr>
		</table>
		</div>
	</div>
	<div style="position:absolute;left:350px;top:380px; width:350px; border-color: blue; border-style: solid">
		<div class="form_group">
		<b>APP EXTERNA</b>
		<table width=300>
			<tr>	
				<td>
					<label>URL</label>
					<input type="text" class="form_edit" name="urlApp" value="<?php echo $urlApp ?>">
				</td>
			</tr>
			<tr>	
				<td>
					<label>ICONA</label>
					<input type="text" class="form_edit" name="iconaApp" value="<?php echo $iconaApp ?>">
				</td>
			</tr>
		</table>
		</div>
	</div>
	</form>	
</body>
</html>