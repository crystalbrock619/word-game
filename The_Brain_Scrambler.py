"""The Brain Scrambler by C Brock ***@gmail.com
A challenging vocabulary game where you have a limited amount of
guesses to guess a word from its scrambled letters.
Tags: short, game, scramble"""
import random

MAX_GUESSES = 3  # sets the maximum amount of guesses the player has


def main():
    print(
        """The Brain Scrambler is a challenging vocabulary game.
By C Brock

You have {} chances to guess the following word. Good Luck!""".format(MAX_GUESSES))
    while True:  # Main game Loop
        word = getWord()
        split = [char for char in word]
        random.shuffle(split)
        scramWord = "".join(split)
        print("Your word is: " + scramWord)

        numGuesses = 1
        while numGuesses <= MAX_GUESSES:
            guess = ""
            # keep looping until player enters a valid guess
            while len(guess) != len(word) or not guess.isalpha():
                print("Guess #{}: ".format(numGuesses))
                guess = input("> ")
            response = getResponse(guess, word)

            if guess != word:
                print(response)
            numGuesses += 1

            if guess == word:
                break
            if numGuesses > MAX_GUESSES:
                print("You ran out of guesses for this one")
                print("The correct answer was " + word)
        # Ask player if they want to go to next word or quit
        print('You got it right!')
        print("Would you like another word? (yes or no)")
        if not input("> ").lower().startswith("y"):
            break
    print("Thanks for playing!")


def getWord():
    """Returns a random word from the list words"""
    words = [
        "invent",
        "friend",
        "interrupt",
        "stream",
        "fluffy",
        "warlike",
        "appear",
        "domineering",
        "embarrass",
        "greasy",
        "milky",
        "marvelous",
        "terrify",
        "zesty",
        "breathe",
        "signal",
        "aromatic",
        "likeable",
        "blush",
        "bridge",
        "paint",
        "applaud",
        "tease",
        "regular",
        "care",
        "offend",
        "consider",
        "destruction",
        "truck",
        "aboriginal",
        "direction",
        "guess",
        "loaf",
        "psychedelic",
        "exciting",
        "meeting",
        "willing",
        "disarm",
        "perpetual",
        "hungry",
        "ablaze",
        "invite",
        "abundant",
        "tendency",
        "limping",
        "connect",
        "thread",
        "wonder",
        "tightfisted",
        "unruly",
        "crayon",
        "rifle",
        "hulking",
        "questionable",
        "acceptable",
        "substantial",
        "blink",
        "spare",
        "pickle",
        "gentle",
        "obedient",
        "faded",
        "destroy",
        "crabby",
        "quaint",
        "pocket",
        "practice",
        "enormous",
        "eager",
        "level",
        "offer",
        "short",
        "ignore",
        "snotty",
        "inject",
        "worry",
        "sassy",
        "spoil",
        "discreet",
        "lonely",
        "silver",
        "babies",
        "understood",
        "scold",
        "lopsided",
        "shaky",
        "grateful",
        "wandering",
        "mourn",
        "flowers",
    ]
    randNum = random.randint(0, len(words) - 1)
    return words[randNum]


clues = []


def getResponse(guess, word):
    splitGuess = [char for char in guess]
    splitWord = [char for char in word]
    for i in range(len(word)):
        if splitGuess[i] == splitWord[i]:
            clues.append(chr(8730))
        else:
            clues.append(chr(935))
    if clues.count(chr(8730)) > clues.count(chr(935)):
        return "That was really close!"
    return "Not even close!"


# If the program is run (instead of imported), run the game
if __name__ == "__main__":
    main()
