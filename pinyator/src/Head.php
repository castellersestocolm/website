<?php
	session_start();
	include "$_SERVER[DOCUMENT_ROOT]/pinyator/Head_public.php";
	if (empty($_SESSION["usuari"]))
	{
		echo "<meta http-equiv='Refresh' content='0;url=Login.php'>";
	}
	
 ?>