/*const scramWords = [ebraablek, iaortcen, esenez, asdn, edimx, upro, udcisnisos, plmyutil, uodsiisni, nnevue, dnwyi];
const unscramWords = [breakable, reaction, sneeze, sand, mixed, pour, discussion, multiply, insidious, uneven, windy];*/
$("#startButton").on("click", function(event){
    event.preventDefault();
    var name = $("#name").val();
    var playerName = $("#playerName");
    playerName.text("Player name: "+name);
    $("#startForm").css("display", "none");
    let $gameForm = $("<form>");
    $gameForm.addClass("gameForm") 
    const newLabel = $("<label>");
    newLabel.text("Unscramble these letters to form a word:");
    let newSpan = $("<span>");
    newSpan.addClass("scrambled").text("epatl");
    let answerBox = $("<input>");
    answerBox.attr("type", "text").attr("size", "10").attr("id", "answerBox");
    const checkButton = $("<input>");
    checkButton.attr("type", "button").attr("value", "Check").attr("id", "checkButton");
    let result = $("<p>");
    result.attr("id", "result");
    $gameForm.append(newLabel, newSpan, answerBox, checkButton);
    $("#main").prepend($gameForm);
});
$("#checkButton").on("click", function(event){
    event.preventDefault();
    
})