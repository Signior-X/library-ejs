/** These are the scripts file needed for all the players
 * @authors Priyam Seth and Pranshu Kharkwal
 *  
 * ----- Brief Overview ------
 * updatePlayersInTheLobby()
 * io.connect
 * connect
 * join_room_announcement
 * leave_room_announcement
 * get_question
 * display_question
 * receive_answer inside markMyQuestionDone
 * highlight_person_answer
 * show_choices
 * show_standings
 * highlight_person_choice
 * show_results
 * window.onBeforeUnload
 * nav-chat-btn onclick
 * chat-close-btn onclick
 * chat-form submit 
 * show_chat_message
 */

function checkForEnter(event) { 
  // 13 is the keycode for "enter" 
  if (event.keyCode == 13 && event.shiftKey) { 
    console.log("Triggered enter+shift"); 
  } 
  if (event.keyCode == 13 && !event.shiftKey) {
    $('#answer-form').submit();
  } 
}

/* ----- Function to update the number of people in the lobby ----- */
function updatePlayersInTheLobby() {
  // Adding already present players int the room
  var roomCode = thisRoomCode;
  $.ajax({
    type: 'post',
    datatype: 'json',
    data: { code: roomCode },
    url: '/api/players'
  }).done(function (data) {
    // On successfull request take the data from the data and loop in the list adding items
    // console.log('PlayersList', data);
    var currentPlayers = data.data;
    var playersListString = '<ul>';
    currentPlayers.forEach(function (row, index) {
      // console.log(row.id);
      // console.log(row.name);
      playersListString += '<li>' + row.name + '</li>';
    });
    playersListString += '</ul>';
    document.getElementById('players-list').innerHTML = playersListString;
    document.getElementById('players-status-list').innerHTML = playersListString;
    document.getElementById('status-indicator').classList.remove('hidden');
  }).fail(function (data) {
    console.log("internal error :" + data);
    alert('Failed to make request, check your Internet connections');
  });
}

function showGameModal(label, msg){
  document.getElementById('modal-body').innerHTML = msg;
  document.getElementById('modal-label').innerHTML = label;
  $('#game-modal').modal();
}

/* ----- Start of Sockets here ----- */
// console.log("For all script tag starts working");
// This needs to be changed
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

/* ----- This is called when a user connects ----- */
socket.on('connect', function () {
  // console.log("Connection established");
  // isAdmin defined a the top now
  // console.log("ISADMIN", isadmin);
  var name = window.name;
  var code = thisRoomCode;

  if (isadmin === "1") {
    console.log("Admin has opened the page");
    socket.emit('join_room', {
      name: name,
      code: code,
      isadmin: isadmin
    });

  }
  else {
    console.log("Someone has opened the page");
  }

  console.log("Connect is called!");

});

socket.on('disconnect', function(data) {
  console.log("Disconnect has happened");

  // Add a timegap to check for changes
  // TODO
  
  // Start of HERE TO HIDE AND SHOW
  // Add a please waiting modal
  $('#wait-modal').modal({
    backdrop: 'static',
    keyboard: false
  });
  
  // Empty highlighy table
  document.getElementById('highlight-table-body').innerHTML = '';

  // For hiding the game-questions thing
  document.getElementById('game-questions').style.display = "none";
  document.getElementById('make-choices-done').style.display = "none";

  // For clearing the choices list
  document.getElementById("make-choices-list").innerHTML = '';
  // End of HIDE and SHOW

  setTimeout(function() {
    socket.connect();
    if(isadmin === "0"){
      if(name) {
        socket.emit('join_room', {
          name: name,
          code: thisRoomCode,
          isadmin: isadmin
        });
      }
    }
  }, 2000);
});

/* ----- when someone enter the room, this announcement is called  ----- */
socket.on('join_room_announcement', function (data) {
  // console.log('JOIN ROOM ANNOUNCEMENT DATA', data);

  const newNode = document.createElement('div');
  newNode.innerHTML = `<b>${data.name}</b> is in the room`;
  newNode.className = "join-room";
  // console.log(' Players Anno ', document.getElementById('players-announcements'));
  document.getElementById('players-announcements').appendChild(newNode);
  updatePlayersInTheLobby();
});

/* ----- when someone leaves the room, this announcement is called ----- */
socket.on('leave_room_announcement', function (data) {
  // console.log('LEAVE ROOM ANNOUNCEMENT DATA', data);

  const Node = document.createElement('div');
  Node.innerHTML = `<b>${data.name}</b> has left the room`;
  Node.className = "leave-room";
  document.getElementById('players-announcements').appendChild(Node);
  updatePlayersInTheLobby();
});

/* ----- when we ask for getting question ----- */
socket.on('get_question', function (data) {
  // console.log("Get Question");
  // console.log("Got question data: ", data);
  // console.log("value of c is " + data['c'])
  var name = window.name;
  socket.emit('send_question', {
    name: name,
    c: data['c'],
    code: data['code']
  });
});

    /* ----- When we have to display the question ----- */
socket.on('display_question', function (data) {

  // Adding here that the game has started
  window.gameHasStarted = 1;

  console.log("On display question");
  console.log(data);

  // Hide the wait-game-modal if network error had happened
  $('#wait-modal').modal('hide');

  // Write frontend to display the question to users and add a text box for answer
  // Show the question in the front end
  document.getElementById('question').innerHTML = data['question'];

  // Create the form string to be added
  answerFormContainerString = '<form id="answer-form" onsubmit="event.preventDefault(); markMyQuestionDone();">'
    + '<div class="form-group">'
      + '<textarea id="answer-input" class="form-control" maxlength="256" placeholder="Enter you answer here" onkeypress="checkForEnter(event)" value="" required></textarea>'
    + '</div>'
    + '<div class="form-group">'
      + '<button id="answer-submit-btn" class="btn btn-primary btn-lg full-size">SUBMIT</button>'
    + '</div>'
  + '</form>';

  // Create the form again which was destroyed and setting it's display to block again
  document.getElementById('answer-form-container').innerHTML = answerFormContainerString;
  document.getElementById('answer-form-container').style.display = "block";

  // If answered container has been shown, withdraw it
  document.getElementById('answered-container').style.display = "none";

  // Hide the main content if present
  $('#main-content').hide('fast');

  // If the score board is visible, hide it
  document.getElementById('wait-screen').style.display = "none";

  // Make the hightlight container to be visible from now onwards
  // $('#highlight-container').show('fast');
  // Using second method
  document.getElementById('highlight-container').style.display = "block";

  // Show the game questions block as it is ready
  $('#game-questions').show('slow');
});

/* ----- Function to submit an answer ----- */
function markMyQuestionDone() {

  // Get the input answer content
  console.log("Submit answer event");
  var myAnswer = document.getElementById('answer-input').value;
  // console.log('Answer', myAnswer);
  var code = thisRoomCode;
  // Do the socket work here
  // Here now pass the user to show who have answered or not
  // if all answered most probably we will take him directly to the show screen of whose answer he choose

  socket.emit('receive_answer', {
    answer: myAnswer,
    code: code,
    name: window.name
  });

  // Now we will show the user who has answered
  // This shows the div and the highlight_person_answer highlights and change the values
  // $('#game-questions').hide('slow'); // Now not hiding it, instead making it change

  // Hide the answer form container, and show that he has answered
  $('#answer-form-container').hide('fast');
  $('#answered-container').show('fast');

  // Making the form null, so that even after inspecting, he can't answer again
  document.getElementById('answer-form-container').innerHTML = '';
}

/* ----- Highlight when someone has answered ----- */
socket.on('highlight_person_answer', function (data) {
  console.log(data.name + " has answered");
  // Write frontend to show to everyone that this person has answered question
  tableRowToAdd = '<tr>'
    + '<td style="width: 80%;">' + data.name + '</td>'
    + '<td style="text-align: center;"> <img style="width: 32px" src="/static/img/checked.svg"> </td>'
    + '</tr>';
  document.getElementById('highlight-table-body').innerHTML += tableRowToAdd;
});


/* Take care while handling this one */
/* ----- When we have to show all the choices ----- */
socket.on('show_choices', function (data) {
  console.log("Show choices", data);
  // Write frontend to show other's answers to everyone and ask them to make a choice. Don't show current user's answer to him

  var code = thisRoomCode;
  var choice = "pranshu"; // Get users choice in this variable

  // Show make choices
  // $('#highlight-container').hide('fast'); // This is needed if we don't want to show what choices someone has made
  document.getElementById('game-questions').style.display = "none";
  document.getElementById('make-choices-done').style.display = "none";
  $('#make-choices').show('fast');

  // Clear the Highlight board
  document.getElementById('highlight-table-body').innerHTML = '';

  var makeChoicesList = document.getElementById('make-choices-list');
  makeChoicesList.innerHTML = '';
  var referenceList = []
  var ai = 0;
  for (var key in data) {
    makeChoicesListString = '<div id="choice' + ai + '" class="choice btn btn-primary full-size">' + data[key] + '</div>';
    makeChoicesList.innerHTML += makeChoicesListString;

    referenceList.push(key);
    // console.log("SET");
    ai += 1;
  }
  // console.log("AI", ai)
  // console.log("Refernce list", referenceList);

  for (var i = 0; i < ai; i++) {
    (function (i) {
      $("#choice" + i).click(
        function () {
          // console.log("Clicked one", i);
          // console.log("Choice", referenceList[i])

          // referenceList[i] gives the name
          if (referenceList[i] === window.name) {
            // He can't choose his own answer
            // show the Modal
            showGameModal('Invalid Choice!', "You can't choose your own Answer");
          } else {
            // Hide the choice one
            // Make the choice list empty
            document.getElementById('make-choices-done-info').innerHTML = data[referenceList[i]];
            $('#make-choices-done').show('fast');

            // Marking the choice made for showing next
            window.currentChoice = referenceList[i];

            /* This socket should be called when choice is marked */
            socket.emit('process_choices', {
              choice: referenceList[i],
              name: window.name,
              code: code
            });

            document.getElementById("make-choices-list").innerHTML = '';
          }
        }
      );
    })(i);
  }
});

/* ---- This is used for every round to show the current standings ----- */
socket.on('show_standings', function (data) {
  console.log("Show_standings", data);
  console.log("Points", data.points);
  console.log("whoChose", data.whoChose);
  var pointsData = data.points;
  var code = thisRoomCode;
  // Write frontend to show currents points of everyone
  // console.log("Current question is over. Time for next question")

  // First clear the highlight-block-table
  document.getElementById('highlight-table-body').innerHTML = '';

  // Hide the made choice and highlight block
  $('#make-choices').hide('fast');
  $('#highlight-container').hide('fast');

  // ----- Now from here on we will prepare, the score board to be displayed
  // Left to do from here
  document.getElementById('scorebaord').innerHTML = '';
  // To continue the next round

  // ---- Now from here start the work of creating the leaderboard -----
  scoreboardString = '';
  keysSorted = Object.keys(pointsData).sort(function (a, b) { return pointsData[a] - pointsData[b] })
  // console.log("Sorted", keysSorted);
  keysSorted.reverse();
  // console.log("Reversed", keysSorted);

  // Creating a differnece array for using the difference to store
  var differenceDict = {};

  // First have the old values, fixed by the new values order
  for (var i = 0; i < keysSorted.length; i++) {

    // Setting the new maxValue
    if (i == 0) {
      // This is the current max value
      window.maxScore = pointsData[keysSorted[i]];
      // console.log("MAX SCORE SET", window.maxScore);
    }

    // Get the previous score
    var previousScore = 0;
    if (window.score[keysSorted[i]]) {
      previousScore = window.score[keysSorted[i]];
    }
    // console.log("His previousScore", previousScore);

    // Also updating the score with the new values
    var newScore = pointsData[keysSorted[i]];
    differenceDict[keysSorted[i]] = newScore - previousScore;
    window.score[keysSorted[i]] = newScore;

    var barColor = 'info';
    if (i % 4 == 1) { barColor = 'warning'; }
    else if (i % 4 == 2) { barColor = 'success'; }
    else if (i % 4 == 3) { barColor = 'danger'; }

    scoreboardString += '<div id="player-' + keysSorted[i] + '" class="score-details-container">'
      + '<div class="score-details row">'
        + '<h4>' + keysSorted[i] + '</h4><h5 class="increament-value">+' + differenceDict[keysSorted[i]] + '</h5>'
      + '</div>'
      + '<div class="progress">'
        + '<div class="progress-bar bg-' + barColor + '" role="progressbar" style="width: ' + (previousScore/window.maxScore)*100 + '%">'
          + '<div class="final-score">' + previousScore + '</div>'
        + '</div>'
      + '</div>'
    + '</div>';
            
  } // End of for loop

  // Update the score board inner html
  // console.log('Scoreboard String', scoreboardString);
  document.getElementById('scorebaord').innerHTML = scoreboardString;

  // Also show the previous answer he choosed
  document.getElementById('answer-choosen').innerHTML = 'You chose ' + window.currentChoice + '\'s answer!'

  // Now we will finally show the scoreboard present in wait screen
  $('#wait-screen').show('fast');

  // console.log("DIFFERENCE DICT", differenceDict);
  // console.log("NEW SCORES In Window", window.score);
  // Now we will update the already set progress bars so as to have a better animation

  // Example Timeout
  setTimeout(function () {
    // console.log("chaning all to current value");
    // Here show the increasing bar animations
    for (var i = 0; i < keysSorted.length; i++) {
      // window.maxScore has the highest value
      // window.score has the current value
      // This one is for updating with animation
      document.getElementById('player-' + keysSorted[i]).getElementsByClassName('progress-bar')[0].style.width = "" + (window.score[keysSorted[i]] / window.maxScore) * 100 + "%";

      // This one is for updating the current player score
      document.getElementById('player-' + keysSorted[i]).getElementsByClassName('final-score')[0].innerHTML = window.score[keysSorted[i]];
    }
  }, 1000); // This waits for one second before showing the animations
  // Have a timeout for some seconds, so as to show the users, the scorebaord and whose answer he choose!

  //WhoChoseWhose
  document.getElementById("whoChoseList").innerHTML = "";
  var whochoselist = data.whoChose[window.name];
  if(whochoselist){
    document.getElementById("whoChoseH4").innerHTML = "Your answer was chosen by"
    whochoselist.forEach(function(el) {
      var li = document.createElement('li')
      li.innerHTML = el
      document.getElementById("whoChoseList").appendChild(li)
    })
  }
  else{
    document.getElementById("whoChoseList").innerHTML = "";
    document.getElementById("whoChoseH4").innerHTML = "Alas! No one chose your answer"
  }

  // console.log("Game will start in 10 seconds");
  const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function showCountdown() {
    for (var i = 0; i < 10; i++) {
      await sleep(1000);
      document.getElementById("wait-message").innerHTML = 'Next Game will be started in ' + (10 - i - 1).toString() + ' seconds!';
    }
    socket.emit('send_question', {
      name: window.name,
      c: data['c'],
      code: code
    });
  }
  showCountdown();

  // End of this socket
});

/* ----- To highlist the choice when someone chooses an answer ----- */
socket.on('highlight_person_choice', function (data) {
  // console.log(data.name + " has made a choice");
  // Write frontend to show to everyone that this person has made a choice
  // this will be changed later. just added it while testing

  // Using the same Highlight Table
  tableRowToAdd = '<tr>'
    + '<td>' + data.name + '</td>'
    + '<td style="text-align: center;"> <img style="width: 32px" src="/static/img/checked.svg"> </td>'
  + '</tr>';
  document.getElementById('highlight-table-body').innerHTML += tableRowToAdd;
});

/* ---- When game is over, show final results and set gameHasStarted to zero ----- */
socket.on('show_results', function (results) {
  // console.log('Results', results);

  // Making an alert Game has Ended
  // alert('Game Has Ended!');

  // Write frontend to display results, tell users game over, and ask them to close window
  document.getElementById('wait-message').innerHTML = 'Game Has Ended! I Hope you enjoyed it.';
  window.gameHasStarted = 0;

});

// <!-- Scripts for chatting work -->
document.getElementById('nav-chat-btn').onclick = function () {
  // console.log("Chat open");
  document.getElementById('chat-container').style.width = "360px";
  document.getElementById('chat-close-btn').style.display = "block";
  
  // chat indicator hide
  $('#chat-indicator').addClass('hidden');

  // Hide players status box
  document.getElementById('players-status-box').classList.add('hidden');
  document.getElementById('nav-status-btn').innerHTML = 'Players';
}

document.getElementById('nav-status-btn').onclick = function() {
  var playersStatusBox = document.getElementById('players-status-box');
  // For people status button
  document.getElementById('status-indicator').classList.add('hidden');

  if(playersStatusBox.classList.contains('hidden')) {
    // This is hidden show it
    document.getElementById('nav-status-btn').innerHTML = 'Close';
    playersStatusBox.classList.remove('hidden');
  } else {
    document.getElementById('nav-status-btn').innerHTML = 'Players';
    playersStatusBox.classList.add('hidden');
  }
}

document.getElementById('chat-close-btn').onclick = function () {
  // console.log("chat close");
  document.getElementById('chat-container').style.width = "0";
  document.getElementById('chat-close-btn').style.display = "none";

  // chat indicator hide
  $('#chat-indicator').addClass('hidden');
}

$('#chat-form').submit(function (event) {
  event.preventDefault();
  // console.log("Send a message!");
  var name = window.name
  var message = document.getElementById("chat-input").value
  document.getElementById("chat-input").value = ""
  // console.log(name + " " + message)
  socket.emit("receive_chat_message", {
    name: name,
    message: message,
    code: thisRoomCode
  });
});

socket.on('show_chat_message', function (data) {
  // console.log('Message data', data);

  var div = document.createElement('div');
  div.className = "message";

  

  var small = document.createElement('small');
  small.className = "text-muted";
  small.innerHTML = data['name'];
  if(window.colors[data.name]){ 
    small.className += (" " + window.colors[data.name])
  }
  else{ 
    rno = Math.floor((Math.random() * 10) + 1);
    console.log(rno);
    colorlist = {1: 'red' , 2:'blue' , 3:'yellow' , 4:'green' , 5: 'pink' , 6:'violet' , 7:'orange' , 8:'beige' , 9:'olive' , 10:'maroon'}
    window.colors[data.name] = colorlist[rno]
    small.className += (" " + window.colors[data.name])
  }

  if(data['name'] === window.name) { div.className += " right"; small.className += " hidden"; }

  var p = document.createElement('p');
  p.innerHTML = data['message'];

  div.appendChild(small);
  div.appendChild(p);

  document.getElementById('chat-messages-container').appendChild(div);

  // After appending, scroll him to bottom
  // A problem, this does not allow to see above messages then if someone wants to scroll and see
  var messagesContainer = document.getElementById('chat-messages-container');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // chat indicator
  $('#chat-indicator').removeClass('hidden');
});

$(function () {
  $('[data-toggle="tooltip"]').tooltip();

  document.getElementById('copy-btn').onclick = function() {
    const codeToCopy = location.href;

    // Create a temporary textarea to select and copy to clipboard
  	var tempInput = document.createElement("textarea");
	tempInput.style = "position: absolute; left: -1000px; top: -1000px";

	// Copy to clipboard done by first adding the to text area, selecting and then coping it using execCommand
	tempInput.innerHTML = codeToCopy;
	document.body.appendChild(tempInput);
	tempInput.select();
	document.execCommand("copy");

	// Finally remove the textarea
	document.body.removeChild(tempInput);

	//copy-btn
	var btnClicked = '#copy-btn';
      // Change the tooltip after copying
    $(btnClicked).attr('data-original-title', 'Copied!')
      .tooltip('show');
  
    // Again back the copy to clipboard title after going outside (Inspired from Bootstrap)
    $(btnClicked).hover(function() {
      $(btnClicked).attr('data-original-title', 'Copy to clipboard');
    });
  }

});

// To prevent user to leave when game is in progress
window.onbeforeunload = function(e) {
  if (window.gameHasStarted){
    return "Game is in progress. Are you sure you want to navigate away?"
  }
}
