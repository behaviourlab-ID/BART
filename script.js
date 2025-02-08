$(document).ready(function() {
  // Initially hide the experiment container.
  $("#experiment").hide();

  // When the Start button is clicked, hide instructions and show the experiment.
  $("#startButton").click(function() {
    $("#instructions").hide();
    $("#experiment").show();
    new_round();
  });

  // -----------------------------------------------------
  // 1. CONFIGURATION (Shortened Version)
  // -----------------------------------------------------
  var rounds_played = 20;       // Use 20 rounds instead of 30.
  var maximal_pumps = 32;       // Lower maximum pumps (adjust as needed).
  
  // Fixed explosion thresholds for 20 rounds (values chosen for demonstration):
  var explode_array = [
    10, 15, 3, 12, 28, 7, 20, 31, 25, 18,
    6, 19, 5, 13, 30, 4, 11, 27, 17, 9
  ];

  var start_size = 150;         // Initial size of the balloon (in pixels).
  var increase = 2;             // Increase in size per pump.
  
  var round = 0;
  var size;
  var pumps;
  var total = 0;                // Total points accumulated.
  var pumpmeup;
  var explosion;
  
  // Arrays to store per-round data:
  var number_pumps = [];
  var exploded = [];

  // -----------------------------------------------------
  // 2. INDONESIAN LABELS & MESSAGES
  // -----------------------------------------------------
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

  // Set initial labels on buttons and score display.
  $("#press").text(label_press);
  $("#collect").text(label_collect);
  $("#total_term").text(label_balance);
  $("#total_value").text(total + label_currency);
  $("#goOn").hide();

  // -----------------------------------------------------
  // 3. Helper Function: Update Current Round's Points Visualization
  // -----------------------------------------------------
  function update_current_points() {
    $("#current_points").text("Poin Ronde Ini: " + (pumps > 0 ? pumps : 0));
  }

  // -----------------------------------------------------
  // 4. Experiment Functions
  // -----------------------------------------------------
  function new_round() {
    $("#gonext").hide();
    $("#message").hide();
    $("#collect").show();
    $("#press").show();

    round++;
    size = start_size;
    pumps = 0;
    update_current_points();

    $("#ballon").width(size).height(size).show();
    $("#round").html("<h2>" + label_header + round + "</h2>");
  }

  function end_game() {
    $("#collect").remove();
    $("#press").remove();
    $("#gonext").remove();
    $("#round").remove();
    $("#ballonwrap").remove();

    $("#goOn").show();
    $("#message").html(msg_end1 + total + msg_end2).show();

    store_data();
  }

  // Example function to store data (e.g., in hidden fields or send via AJAX)
  function store_data() {
    $("#saveThis1").html('<input type="hidden" name="pumps" value="'+ number_pumps.join(",") +'" />');
    $("#saveThis2").html('<input type="hidden" name="exploded" value="'+ exploded.join(",") +'" />');
    $("#saveThis3").html('<input type="hidden" name="total" value="'+ total +'" />');
    
    // (Optional) Add your AJAX code here to send data to your server/Google Apps Script.
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

  function balloon_explode() {
    $("#ballon").hide("explode", { pieces: 48 }, 1000);
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

  // -----------------------------------------------------
  // 5. Button Handlers
  // -----------------------------------------------------
  $("#press").click(function() {
    if (pumps >= 0 && pumps < maximal_pumps) {
      explosion = 0;
      pumps++;
      update_current_points();

      // Check for explosion threshold (using fixed explode_array)
      if (pumps < explode_array[round - 1]) {
        size += increase;
        $("#ballon").width(size).height(size);
      } else {
        pumpmeup = pumps;
        pumps = -1;
        explosion = 1;
        balloon_explode();
        exploded.push(explosion);
        number_pumps.push(pumpmeup);

        setTimeout(explosion_message, 1200);
        setTimeout(gonext_message, 1200);
      }
    }
  });

  $("#collect").click(function() {
    if (pumps === 0) {
      alert(err_msg);
    } else if (pumps > 0) {
      exploded.push(explosion); // 0 means no explosion.
      number_pumps.push(pumps);
      pumpmeup = pumps;
      pumps = -1;
      $("#ballon").hide();
      collected_message();
      gonext_message();
      total += pumpmeup;
      update_total_display();
    }
  });

  $("#gonext").click(function() {
    if (round < rounds_played) {
      new_round();
    } else {
      end_game();
    }
  });

  $("#goOn").click(function() {
    // In Qualtrics, you might submit the form or send a message.
    alert("Terima kasih! Data Anda telah tersimpan.");
  });
});
