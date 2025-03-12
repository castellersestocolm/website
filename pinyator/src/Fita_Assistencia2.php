<html>
<head>
  <title>Pinyator - Fites</title>
  <meta charset="utf-8">
</head>
<?php include "$_SERVER[DOCUMENT_ROOT]/pinyator/Style.php";?>
<style>
html, body {
  height: 100%;
  width:100%;
  margin: 0;
}

.full {
  height:100%;
  width:100%;
}
</style>
<body style='background-color:#cce6ff;'>
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
			echo "<b>ASSISTÈNCIA ACTUAL: " . $row["ASSISTENCIA"]."</b>";	
			
			$valor= $row["ASSISTENCIA"]/2;
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
<br>
<img src="icons/Marrec.png"> = 2 participants
<div id="base" style="position:absolute;" class="full" >
<canvas id="canvas"></canvas>
</div>
<br />
<img id="img" style="display: none;" src="icons/sprite_Marrec.png">
</body>
<script>
// Nuestras variables
var base,canvas, ctx;

base = document.getElementById('base');
canvas = document.getElementById('canvas');
canvas.height=base.clientHeight;
canvas.width=base.clientWidth;
ctx = canvas.getContext('2d');


class caminant
{
	constructor()
	{
		this.step = 0;
		this.directionY = 1;
		this.directionX = 0;
		this.direction=1;
		this.x=25;
		this.y=25;
		this.stop=false;
		this.id="img";
	}
	stoping()
	{
		this.directionY=0;
		this.directionX=0;
		this.stop=true;
		this.step=0;
	}
	
	IsStop()
	{
		return this.stop;
	}
	
	move(dir)
	{	
		this.stop=false;
		this.direction=dir;
		if (dir == 0)
		{
			this.directionX=-1;
			this.directionY=0;
		}
		else if(dir ==1)
		{
			this.directionY=1;
			this.directionX=0;
		}
		else if (dir==2)
		{
			this.directionX=1;
			this.directionY=0;
		}
		else if (dir==3)
		{
			this.directionY=-1;
			this.directionX=0;
		}
		else
		{
			this.directionY=0;
			this.directionX=0;
		}
	};
}

var caminantes = [];
for (var i = 0; i < <?php echo $valor ?>; i++)
{
	var caminante = new caminant();
	caminante.x=getRandomInt(50,canvas.width-50);
	caminante.y=getRandomInt(50,canvas.height-50);
	dir=getRandomInt(0,3);
	caminante.move(dir);

	caminantes.push(caminante);
}
// Numerador de paso, lo usaremos para saber que frame dibujar
//step = 0;

// Direccion, 1 derecha, -1 izquierda
//directionY = 1;
//directionX = 0;
//direction=1;
//0=esquerra
//1=avall
//2=dreta
//3=amunt
setInterval(function(){
    // Borramos lo dibujado
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	caminantes.forEach(function(caminant)
	{
	
		img = document.getElementById(caminant.id);
		rr = getRandomInt(0,100);
		if (rr == 50)
		{
			caminant.stoping();
		}
		else if ((caminant.IsStop()) && (rr > 90))
		{
			dir=getRandomInt(0,3);
			caminant.move(dir);
		}
		yy = [52, 0, 104, 156][caminant.direction];
		if (!caminant.IsStop())
			caminant.step++;
		
		stepp = caminant.step;
		// Dibujamos el frame adecuado en la posicion correspondiente
		ctx.drawImage(
			// Imagen
			img,
			// Source x
			(stepp % 4) * 32, // Avance sobre el eje x
			// Source y
			//[52, 0, 104][directionX + 1], // Selecciona el frame adecuado
			yy,
			// Source width
			32,
			// Source height
			52,
			// Dest x
			caminant.x,
			// Dest y
			caminant.y,
			// Dest width
			32,
			// Dest height
			52
		);
			   
		// Avance, indistinto de la direccion
		caminant.x += 5 * caminant.directionX;
		caminant.y += 5 * caminant.directionY;
		
		// Si toca un limite, cambiamos la dirección
		if (caminant.x >= canvas.width - 32)
		{
			caminant.move(0);
		}
		else if (caminant.y >= canvas.height - 102) 
		{
			caminant.move(3);
		}
		else if (caminant.x <= 10)
		{
			caminant.move(2);
		}
		else if (caminant.y <= 10) 
		{
			caminant.move(1);
		}
	});
}, 1000 / 8); // Aproximadamente 12 frames por segundo


function getRandomInt(min, max) 
{
  return Math.floor(Math.random() * (max - min)) + min;
}

function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}
</script>
</html>
