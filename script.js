
//OBJECT CONTAINING UNSCRAMBLED WORDS AND THEIR SCRAMBLED VALUE
    const scramWords = {plate:"epatl",breakable:"ebraablek",reaction:"iaortcen", sneeze:"esenez", sand:"asdn", mixed:"edimx", pour:"upro", discussion:"udcisnisos", multiply:"plmyutil", insidious:"uodsiisni", uneven:"nnevue", windy:"dnwyi"};
//RANDOM NUMBER GENERATOR FUNCTION
    function genScramWord(){
        var genScramWord = Math.round(Math.random()*12);
        return genScramWord;
    }
    var scram = Object.values(scramWords);
//BEGIN GLOBAL VARIABLE LIST
//HEADER VARIABLES
    let $score = $("#coinCounter");
//START FORM VARIABLES
    let $startButton = $("#startButton");
    let $name = $("#name");
    let $startForm = $("#startForm");
//GAME FORM VARIABLES
    let $gameForm = $("<form>");
    $gameForm.addClass("gameForm");
//***************************************************************************** */ 
    let $newLabel = $("<label>");
    $newLabel.text("Unscramble these letters to form a word:");
//****************************************************************************** */
    let $newSpan = $("<span>");
    $newSpan.addClass("scrambled");
//***************************** */
    let $answerBox = $("<input>");
    $answerBox.attr("type", "text").attr("size", "10").attr("id", "answerBox");
//****************************************************************************** */
    let $checkButton = $("<button>");
    $checkButton.addClass("checkButton");
    $checkButton.attr("type", "submit");
    $checkButton.text("Check");
    
//**************************************************************************************** */
    let $nextButton = $("<input>");
    $nextButton.val("Get Next").attr("type", "button")
    $nextButton.addClass("nextButton");
    $nextButton.css("display", "none");
//**************************************************************************************************** */
    let $result = $("<p>");
    $result.attr("id", "result");
//**************************************************************************************************** */
//SOUND VARIABLES
    var $rightSound = $("<audio preload=auto>");
    $rightSound.attr("src", "https://www.kasandbox.org/programming-sounds/rpg/coin-jingle.mp3");
//**************************************************************************************************** */
    var $wrongSound = $("<audio preload=auto>");
    $wrongSound.attr("src", "https://www.kasandbox.org/programming-sounds/rpg/giant-no.mp3");
//**************************************************************************************************** */

let $user = $("#user");
let $playerName = $("#playerName");
function setUserName() {
    let playerName = prompt('Please enter your name');
    if(!playerName) {
        setUserName();
    } else {
    localStorage.setItem('playerName', playerName);
    $playerName.text("Player name: "+playerName);
}
}
if(!localStorage.getItem('playerName')) {
    setUserName();
} else {
    let storedName = localStorage.getItem('playerName');
    $playerName.text("Player name: "+storedName);
    $gameForm.append($newLabel, $newSpan, $answerBox, $result, $checkButton);
    $newSpan.text(scram[genScramWord()]);
    console.log($newSpan);
    $("#main").append($gameForm);
}
$user.click(function() {
    setUserName();
})
//TRIGGER GAME FORM SUBMIT ON ENTER IN ANSWER FIELD
    $gameForm.on("keydown", function(e){
        if(e.enterKey){
            console.log("I'm Done");
            $startForm.submit();
        }
    });
//TRIGGER GAME FORM SUBMIT ON CHECK BUTTON CLICK
    $checkButton.on("click", function(e){
        console.log("I'm Done");
        $gameForm.submit();
    })
//GAME FORM SUBMIT EVENT FUNCTION
    $gameForm.on("submit", function(e){
        e.preventDefault();
        console.log("I'm Done");
        let playerAnswer = $answerBox.val();
        var answerKeys = Object.keys(scramWords);
        var isCorrect = answerKeys.includes(playerAnswer);
        let score = parseInt($($score).text());
        if(isCorrect){
            console.log("I'm Done");
            $("body").append($rightSound);
            $rightSound[0].play();
            $result.text("Wow! You got it right!");
            $score.text((score)+1);
            $checkButton.css("display", "none");
            $gameForm.append($nextButton);
            $nextButton.css("display", "flex");
        } else{
            $("body").append($wrongSound);
            $wrongSound[0].play();
            $result.text("That's not the word we are looking for. Try again.");
        }
    });
//NEXT BUTTON CLICK EVENT FUNCTION
    $nextButton.on("click", function(){
        console.log("I'm Done");
        $nextButton.css("display", "none");
        $checkButton.css("display", "flex");
        $newSpan.text(scram[genScramWord()]);
        $result.text("");
        $answerBox.val("");
    })