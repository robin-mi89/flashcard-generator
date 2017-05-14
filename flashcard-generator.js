var fs = require("fs");
var inquirer = require("inquirer");

// nice thought to use es6 classes
class BasicCard 
{
    constructor(front, back)
    {
        if(this instanceof BasicCard)
        {
            this.front = front,
            this.back = back
        }
        else
        {
            // nice job of not implementing this conditional to make the `new` keyword unnecessary.
            return new BasicCard(front, back);
        }
    }
}

class ClozeCard 
{
    constructor(text, cloze)
    {
        if(this instanceof ClozeCard)
            // personal preference here, but it'd be ncie to indent everything inside of the if block
            // so that it's easier to parse through and see what all logic is contained within it
        {
        this.text = text, // I'm not sure what these commas are here for, but you don't need them
        this.cloze = cloze,
        this.getCloze = function()
        {
            return this.cloze;
        }
        this.getFull = function()
        {
            return this.text;
        }
        this.getPartial = function()
        {
            if (this.text === undefined)
            {
                console.log(this);
                console.log("text was undefined");
                return;
            }
            var partial = this.text.replace(this.cloze, "...");
            if (partial === this.text)
            {
                console.log("ERROR: The Cloze was not in the full text");
            }
            return partial;
        }
        }
        else
        {
            return new ClozeCard(text, cloze);
        }
        
    }
}

var allFlashCards = [];
var allClozeCards = [];



function printAllCards()
{
    // console.log(allFlashCards);
    // console.log(allClozeCards);
    allFlashCards.forEach(function(value)
    {
        console.log(JSON.stringify(value, null, 2));
    });
    allClozeCards.forEach(function(value)
    {
        console.log(JSON.stringify(value, null, 2));
    })
}


function loadCards()
{   
    return new Promise(function(resolve, reject) {

        fs.readFile("savedCards.txt", "utf8", function(err, data) //readFile arguments: 1. file name, 2. file encoding, 3. callback function. 
        {
            if (err)
            {
                console.log(err);
                reject(err)
                return;
            }
            // console.log(data);
            var cards = data.split("\n");
            //console.log(cards);
            cards.forEach(function(value)
            {
                //console.log(value);
                var properties = value.split("\t");
                //console.log(properties);
                if (properties[0] === "flashcard")
                {
                    var tempCard = new BasicCard(properties[1], properties[2]);
                    allFlashCards.push(tempCard); 
                }
                else
                {
                    var tempCard = new ClozeCard(properties[1], properties[2]);
                    allClozeCards.push(tempCard);
                }
            });
            resolve('success')
            //printAllCards();
        });
    })
}

function saveCard(card)
{
    if (card instanceof BasicCard)
    {
        // you could save yourself the need for this conditional by simply appending the new line character to the end of the string as opposed to prepending it for all bu the first line
        if (allClozeCards.length === 0 && allFlashCards.length === 0) //first entry into the log file.
        {
            var toWrite = "flashcard\t"+card.front + "\t"+card.back;
        }
        else
        {
            var toWrite = "\nflashcard\t"+card.front + "\t"+card.back;
        }
    }
    else if (card instanceof ClozeCard)
    {
        if (allClozeCards.length === 0 && allFlashCards.length === 0)
        {
            var toWrite = "clozecard\t"+card.text + "\t"+card.cloze;
        }
        else
        {
            var toWrite = "\nclozecard\t"+card.text + "\t"+card.cloze;
        }
    }
    else
    {
        console.log("That was not a flashcard of any type.");
        return;
    }
    fs.appendFile("savedCards.txt", toWrite, function(err)
    {
        if (err)
        {
            console.log(err);
            return;
        }
        //console.log("Log successfully saved.");
    });
}

start();

function start()
{
    // unlikely ever to prove an issue in this scenario since the user is likely to read their options before selecting one
    // and in that time all the cards should have finished loading, but there's no guarantee that would happen. And if you
    // hit enter immediately after running this file, then you'll crash your program because the logic in `readCard` depends
    // on the cards already being loaded. Couple ways around this:
        // pass a callback function to `loadCards` that encapsulates the rest of the logic in this function
        // have `loadCards` return a promise and then run the rest of the logic in this function after that promise resolves (this is the option that I've implemented as an example)
    loadCards()
        .then(function(result) {

            inquirer.prompt([
            {
                type: "list", 
                name: "task",
                message: "Do you want to read or write a flashcard/clozecard?",
                choices: ["read", "write flashcard", "write clozecard", "exit"]
            }
            ]).then(function(result)
            {
                if (result.task === "read")
                {
                    readCard();
                }
                else if (result.task ==="write flashcard")
                {
                    writeFlashCard();
                }
                else if (result.task === "write clozecard")
                {
                    writeClozeCard();
                }
                else
                {
                    return;
                }
            })

        })
        .catch(function(err) {
            console.log('Oh noes!')
            console.log(err)
        })
}

function writeFlashCard()
{
    inquirer.prompt([
        {
            type: "input",
            name: "front",
            message: "What is the front of the flashcard?"
        },
        {
            type: "input",
            name: "back", 
            message: "What is the back of the card?"
        }
    ]).then(function(result)
    {
        var tempCard = new BasicCard(result.front, result.back);
        console.log("you created a new card with a front of: " + tempCard.front + "\n and a back of: " + tempCard.back);
        saveCard(tempCard);
        start();
    })
}

function writeClozeCard()
{
    inquirer.prompt([
        {
            type: "input",
            name: "fullText",
            message: "What is the full text of the clozecard?"
        },
        {
            type: "input",
            name: "clozeText",
            message: "What is the cloze text of the card?"
        }
    ]).then(function(result)
    {
        var tempCard = new ClozeCard(result.fullText, result.clozeText);
        console.log("You've created a new cloze card with the full text: "+tempCard.text + "\n and a cloze of: "+tempCard.cloze);
        saveCard(tempCard);
        start();
    });
}

function readCard()
{
    var card;
    if (Math.floor(Math.random()*2) === 0) //choose to display a cloze or basic card
    {
        card = allFlashCards[Math.floor(Math.random() * allFlashCards.length)];
        inquirer.prompt([
        {
        type: "input",
        name: "userInput",
        message: card.front
        }
        ]).then(function(result)
        {
            // console.log(result.userInput.trim().toLowerCase());
            // console.log(card.back.trim().toLowerCase())
            if (result.userInput.trim().toLowerCase() === card.back.trim().toLowerCase())
            {
                console.log("You got it right!");
            }
            else
            {
                console.log("Your answer was wrong, the correct answer is: ");
                console.log(card.back);
            }
            start();
        })
    }
    else
    {
        card = allClozeCards[Math.floor(Math.random() * allClozeCards.length)];
        inquirer.prompt([
        {
        type: "input",
        name: "userInput",
        message: card.getPartial()
        }
        ]).then(function(result)
        {
            // console.log(result.userInput.trim().toLowerCase());
            // console.log(card.cloze.trim().toLowerCase())
            if (result.userInput.trim().toLowerCase() === card.cloze.trim().toLowerCase())
            {
                console.log("You got it right!");
            }
            else
            {
                console.log("Your answer was wrong, the correct answer is: ");
                console.log(card.cloze);
            }
            start();
        })
    }
}