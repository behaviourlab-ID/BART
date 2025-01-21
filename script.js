$(document).ready(function() {

  //-----------------------------------------------------
  // 0. GET Qualtrics Response ID from URL (if provided)
  //-----------------------------------------------------
  // e.g. the iframe might call index.html?respId=SV_abcdef123
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || "";
  }
  // Store the participant/response ID here:
  var responseId = getQueryParam("respId"); 
  // If no ?respId= is in the URL, it will be "" (empty string).

  //-----------------------------------------------------
  // 1. CONFIGURATION
  //-----------------------------------------------------
  var rounds_played = 20;   // total BART rounds
  var maximal_pumps = 32;  // maximum possible pumps
  // Standard BART explosion array for 30 rounds:
  var explode_array = [
  10, 15, 3, 12, 28, 7, 20, 31, 25, 18,
  6, 19, 5, 13, 30, 4, 11, 27, 17, 9
];


  var start_size  = 150;  // must match #ballon width/height in style.css
  var increase    = 2;    // balloon grows by 2px each pump
  var round       = 0;
  var size;
  var pumps;
  var total       = 0;    // total points
  var pumpmeup;
  var explosion;          // 1 if exploded, 0 if not
  // Arrays to store data each round:
  var number_pumps = [];
  var exploded     = [];

  //-----------------------------------------------------
  // 2. INDONESIAN LABELS & MESSAGES
  //-----------------------------------------------------
  var label_press    = "Pompa Balon";
  var label_collect  = "Kumpulkan Poin";
  var label_gonext1  = "Mulai Ronde Berikutnya";
  var label_gonext2  = "Selesaikan Permainan";
  var label_balance  = "Total Poin:";
  var label_currency = " poin";
  var label_header   = "Permainan Balon - Ronde ";
  var err_msg        = "Anda baru dapat mengumpulkan poin setelah memompa balon minimal satu kali.";

  var msg_explosion1 = "<p>Balon meledak setelah pompa ke- ";
  var msg_explosion2 = ".</p><p>Anda tidak mendapatkan poin pada ronde ini.</p>";

  var msg_collect1   = "<p>Balon tidak meledak!</p><p>Anda mendapatkan ";
  var msg_collect2   = " poin pada ronde ini. Poin tersebut telah disimpan dengan aman.</p>";

  var msg_end1       = "<p>Bagian ini sudah selesai. Anda mendapatkan total ";
  var msg_end2       = " poin. Klik <i>Lanjut</i> untuk melanjutkan.</p>";

  //-----------------------------------------------------
  // 3. INITIAL PAGE SETUP
  //-----------------------------------------------------
  // Set labels in HTML, if not already in index.html:
  $("#press").text(label_press);
  $("#collect").text(label_collect);
  $("#total_term").text(label_balance);
  $("#total_value").text(total + label_currency);
  $("#goOn").hide();  // Hide the “Lanjut” button initially

  //-----------------------------------------------------
  // 4. BART GAME FUNCTIONS
  //-----------------------------------------------------

  function new_round() {
    $("#gonext").hide();
    $("#message").hide();  
    $("#collect").show();
    $("#press").show();

    round++;
    size  = start_size;
    pumps = 0;

    // Reset balloon size
    $("#ballon").width(size).height(size).show();
    // Show round header
    $("#round").html("<h2>" + label_header + round + "</h2>");
  }

  function end_game() {
    // Remove or hide gameplay elements
    $("#collect").remove();
    $("#press").remove();
    $("#gonext").remove();
    $("#round").remove();
    $("#ballonwrap").remove();
    
    // Show final message
    $("#goOn").show();
    $("#message").html(msg_end1 + total + msg_end2).show();

    // Save final data to hidden fields, or do an AJAX call, etc.
    store_data();
  }

  // Save data in hidden fields or do something else
  function store_data() {
    // 1. Put them in hidden inputs (if you want Qualtrics to read them):
    $("#saveThis1").html('<input type="hidden" name="pumps" value="'+ number_pumps.join(",") +'" />');
    $("#saveThis2").html('<input type="hidden" name="exploded" value="'+ exploded.join(",") +'" />');
    $("#saveThis3").html('<input type="hidden" name="total" value="'+ total +'" />');
    
    // 2. Send data via AJAX to Google Apps Script
    //    Replace with your actual script URL:
    var googleScriptURL = "https://script.google.com/macros/s/AKfycbyo_nFWQ7Pqvg7VO9Ll2IDe1gC2ReuWXMcI3Vp7IVRUdOCyaDRv0m94bT47w5JOkOpq/exec";

    // Prepare an object to send
    var payload = {
      response_id: responseId,             // from Qualtrics param
      number_pumps: number_pumps.join(","),// CSV or raw array
      exploded: exploded.join(","),        
      total: total
    };

    $.ajax({
      url: googleScriptURL,
      method: "POST",
      data: payload, 
      success: function(response) {
        console.log("Data posted successfully to Google Sheets:", response);
      },
      error: function(err) {
        console.error("Error posting data to Google Sheets:", err);
      }
    });
  }

  function explosion_message() {
    $("#collect").hide();
    $("#press").hide();
    $("#message").html(msg_explosion1 + pumpmeup + msg_explosion2).show();
  }

  function collected_message() {
    $("#collect").hide();
    $("#press").hide();    
    $("#message").html(msg_collect1 + pumpmeup + msg_collect2).show();
  }

  // jQuery UI “explode” effect:
  function balloon_explode() {
    $("#ballon").hide("explode", { pieces:48 }, 1000);
    // Optionally play explosion sound:
    // document.getElementById("explosion_sound").play();
  }

  function gonext_message() {
    $("#ballon").hide();
    if (round < rounds_played) {
      $("#gonext").text(label_gonext1).show();
    } else {
      $("#gonext").text(label_gonext2).show();
    }
  }

  function update_total_display() {
    $("#total_value").text(total + label_currency);
  }

  //-----------------------------------------------------
  // 5. BUTTON HANDLERS
  //-----------------------------------------------------

  // “Pompa Balon”
  $("#press").click(function() {
    // only allow if pumps>=0 and below max
    if (pumps >= 0 && pumps < maximal_pumps) {
      explosion = 0;
      pumps++;

      // Check explosion threshold
      if (pumps < explode_array[round - 1]) {
        // Balloon grows
        size += increase;
        $("#ballon").width(size).height(size);
      } else {
        // Balloon explodes
        pumpmeup = pumps;
        pumps    = -1;  // disable further pumping
        explosion = 1;
        balloon_explode();
        exploded.push(explosion);
        number_pumps.push(pumpmeup);

        setTimeout(explosion_message, 1200);
        setTimeout(gonext_message, 1200);
      }
    }
  });

  // “Kumpulkan Poin”
  $("#collect").click(function() {
    if (pumps === 0) {
      alert(err_msg);
    } else if (pumps > 0) {
      exploded.push(explosion); // 0 means didn't explode
      number_pumps.push(pumps);
      pumpmeup = pumps;
      pumps    = -1; 
      $("#ballon").hide();
      collected_message();
      gonext_message();
      total += pumpmeup;
      update_total_display();
    }
  });

  // “Mulai Ronde Berikutnya” or “Selesaikan Permainan”
  $("#gonext").click(function() {
    if (round < rounds_played) {
      new_round();
    } else {
      end_game();
    }
  });

  // “Lanjut” after finishing the game
  $("#goOn").click(function() {
    // Here you can close the iframe, or do a redirect, or 
    // let Qualtrics move on automatically, etc.
    // For demonstration:
    alert("Terima kasih! Data Anda telah tersimpan.");
  });

  //-----------------------------------------------------
  // 6. START THE GAME
  //-----------------------------------------------------
  new_round();
});
	
