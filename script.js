const scramWords = {plate:"epatl",breakable:"ebraablek",reaction:"iaortcen", sneeze:"esenez", sand:"asdn", mixed:"edimx", pour:"upro", discussion:"udcisnisos", multiply:"plmyutil", insidious:"uodsiisni", uneven:"nnevue", windy:"dnwyi"};
function genScramWord(){
    var genScramWord = Math.round(Math.random()*12);
    return genScramWord;
}
let $score = $("#coinCounter");
let $gameForm = $("<form>");
$gameForm.addClass("gameForm") 
const newLabel = $("<label>");
newLabel.text("Unscramble these letters to form a word:");
let newSpan = $("<span>");
newSpan.addClass("scrambled");
let answerBox = $("<input>");
answerBox.attr("type", "text").attr("size", "10").attr("id", "answerBox");
let generateButton = $("<input>");
generateButton.attr("type", "button").attr("value", "Get New").attr("id", "generateButton");
let checkButton = $("<input>");
checkButton.attr("type", "button").attr("value", "Check").attr("id", "checkButton");
let result = $("<p>");
result.attr("id", "result");
var $rightSound = $("<audio preload=auto>");
var $wrongSound = $("<audio preload=auto>");
$rightSound.attr("src", "https://www.kasandbox.org/programming-sounds/rpg/coin-jingle.mp3");
$wrongSound.attr("src", "https://www.kasandbox.org/programming-sounds/rpg/giant-no.mp3");
$("#startButton").on("click", function(event){
    event.preventDefault();
    var name = $("#name").val();
    var playerName = $("#playerName");
    playerName.text("Player name: "+name);
    $("#startForm").css("display", "none");
    $gameForm.append(newLabel, newSpan, answerBox, result, generateButton);
    $("#main").append($gameForm);
});
$(generateButton).on("click", function(event){
    event.preventDefault;
    generateButton.css("display", "none");
    checkButton.appendTo($gameForm);
    checkButton.css("display", "flex");
    result.text("");
    answerBox.val("");
    var scram = Object.values(scramWords);
    newSpan.text(scram[genScramWord()]);
})
$(checkButton).on("click", function(){
    let playerAnswer = answerBox.val();
    var answerKeys = Object.keys(scramWords);
    var isCorrect = answerKeys.includes(playerAnswer);
    //let scoreStr = ;
    let score = parseInt($($score).text());
    if(isCorrect){
        result.text("Wow! You got it right!");
        $score.text((score)+1);
        $("body").append($rightSound);
        $rightSound[0].play();
        generateButton.css("display", "flex");
        checkButton.css("display", "none");
    } else{
        $("body").append($wrongSound);
        $wrongSound[0].play();
        result.text("That's not the word we are looking for. Try again.")
    }
})