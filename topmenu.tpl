<script>
  $(document).ready(function(){

  var name= $('#MarianBak').html();
   var nummer= $('#MarianNummer').html();
       nummer = nummer.split('.');
       nummer= nummer[1];
       
       nummer = nummer.replace(/\s+/g, '');
      
  if(name=="Marian Lazik"){
      if(nummer=="2009-0010-1"){
         $('#MarianCode').css("display", "block");
      }
  }
  else{
       $('#MarianCode').remove();
  }
	function resizeFrame(){
		$("#eridian_iframe").height("870px"); 
	}
	$("#meinClick").click(function(){
		
		var meinX = setInterval(function(){
			$("#eridian_iframe").height("870px"); 
			var xy = $("#eridian_iframe").height();
			console.log(xy);
			if($("#eridian_iframe").height() == 870){

				resizeFrame();
				setInterval(function(){clearInterval(meinX);}, 10000);
				
			}
		}, 1000);
		
	}); 
  });

</script>

<p class="userData"><strong id="MarianBak">{benutzername}</strong> | <strong id="MarianNummer">Kdn-Nr. {kdnr} {rights}</strong>
</p>
<p><a class="iframe underline" id="meinClick" href="<?php echo base_url();?>usr/settings"><img style="vertical-align: middle;" src="<?php echo base_url();?>_img/mein kundenbereich.jpg"></a> | <a class="iframe underline" href="<?php echo base_url();?>usr/contact">Kontakt</a> | <a href="<?php echo base_url();?>usr/logout">abmelden</a></p>
<p class="userData" style="text-align:left">
 <!--<strong>Aktuelles Saldo 0,00 euro</strong>
  <button style="background-color: #00ff00;height:10px; width:10px; border-radius:5px;border: 1px solid #000;"></button>
  <button style="background-color:red;height:10px; width:10px; border-radius:5px;border: 1px solid #000;"></button><br />
  <button type="submit">
    <span >
      <span>bezahlen</span>
    </span>
  </button>-->
  <a id="MarianCode" style="display:none" class="iframe underline" href="<?php echo base_url();?>usr/rabatt">Rabattcode</a>
  <br />
  
  <br />
</p>

				