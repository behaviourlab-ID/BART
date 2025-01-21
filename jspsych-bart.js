jsPsych.plugins["bart"] = (function () {
  let plugin = {};

  plugin.info = {
    name: "bart",
    description: "Custom plugin to run one trial of the Balloon Analogue Risk Task",
    parameters: {
      maxPop: {
        type: jsPsych.ParameterType.INT,
        default: 10, // The maximum number of pumps before guaranteed pop
      },
      balloonColor: {
        type: jsPsych.ParameterType.STRING,
        default: "#ff6666",
      },
      startingBalloonSize: {
        type: jsPsych.ParameterType.INT,
        default: 100, // in px
      },
      sizeIncrement: {
        type: jsPsych.ParameterType.INT,
        default: 5, // how many px to grow per pump
      },
      pumpText: {
        type: jsPsych.ParameterType.STRING,
        default: "Pump",
      },
      collectText: {
        type: jsPsych.ParameterType.STRING,
        default: "Collect",
      },
      feedbackDuration: {
        type: jsPsych.ParameterType.INT,
        default: 1000, // ms to wait after pop or collect before ending
      },
    },
  };

  plugin.trial = function (display_element, trial) {
    // 1. Generate random pop point for this trial
    const popPoint = Math.floor(Math.random() * trial.maxPop) + 1;

    // 2. Track pumps
    let pumps = 0;
    let exploded = false;

    // 3. HTML setup
    // Create container
    let html = `
      <style>
        .bart-balloon {
          display: inline-block;
          background-color: ${trial.balloonColor};
          border-radius: 50%;
          width: ${trial.startingBalloonSize}px;
          height: ${trial.startingBalloonSize}px;
          line-height: ${trial.startingBalloonSize}px;
          text-align: center;
          color: #fff;
          vertical-align: middle;
          font-weight: bold;
          transition: width 0.2s, height 0.2s, line-height 0.2s;
          user-select: none;
        }
        .bart-buttons {
          margin-top: 20px;
        }
        .bart-btn {
          padding: 10px 20px;
          margin: 5px;
          font-size: 1.1em;
          cursor: pointer;
        }
        .bart-status {
          margin-top: 20px;
          font-size: 1.2em;
          min-height: 2em; /* Just so layout doesn’t jump */
        }
      </style>
      <div id="bart-container">
        <div class="bart-balloon" id="bart-balloon">0</div>
        <div class="bart-buttons">
          <button class="bart-btn" id="pump-btn">${trial.pumpText}</button>
          <button class="bart-btn" id="collect-btn">${trial.collectText}</button>
        </div>
        <div class="bart-status" id="bart-status"></div>
      </div>
    `;
    display_element.innerHTML = html;

    // 4. Function to update balloon
    function updateBalloon() {
      pumps++;
      let balloonEl = document.getElementById("bart-balloon");

      // Increase text
      balloonEl.textContent = pumps;

      // Increase size
      const newSize = trial.startingBalloonSize + pumps * trial.sizeIncrement;
      balloonEl.style.width = newSize + "px";
      balloonEl.style.height = newSize + "px";
      balloonEl.style.lineHeight = newSize + "px";

      // Check for pop
      if (pumps >= popPoint) {
        exploded = true;
        balloonEl.textContent = "POP!";
        document.getElementById("bart-status").textContent =
          "Oh no! The balloon exploded.";
        endTrial();
      }
    }

    // 5. Button event listeners
    display_element.querySelector("#pump-btn").addEventListener("click", () => {
      if (!exploded) {
        updateBalloon();
      }
    });

    display_element
      .querySelector("#collect-btn")
      .addEventListener("click", () => {
        if (!exploded) {
          // Participant collects
          document.getElementById("bart-status").textContent =
            "You collected " + pumps + " points.";
          endTrial();
        }
      });

    // 6. End trial function
    function endTrial() {
      // Disable buttons
      display_element.querySelector("#pump-btn").disabled = true;
      display_element.querySelector("#collect-btn").disabled = true;

      // Save data
      let trial_data = {
        pop_point: popPoint,
        pumps: pumps,
        exploded: exploded,
        points_earned: exploded ? 0 : pumps,
      };

      // Wait for feedbackDuration, then finish
      jsPsych.pluginAPI.setTimeout(() => {
        // Clear display
        display_element.innerHTML = "";
        // End trial & pass the data
        jsPsych.finishTrial(trial_data);
      }, trial.feedbackDuration);
    }
  };

  return plugin;
})();
