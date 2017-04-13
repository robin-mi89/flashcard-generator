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
            return new BasicCard(front, back);
        }
    }
}

class ClozeCard 
{
    constructor(text, cloze)
    {
        if(this instanceof BasicCard)
        {
        this.text = text,   
        this.cloze = cloze
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

var firstPresident = new BasicCard(
    "Who was the first president of the United States?", "George Washington");

// "Who was the first president of the United States?"
console.log(firstPresident.front); 

// "George Washington"
console.log(firstPresident.back); 

var firstPresidentCloze = new ClozeCard(
    "George Washington was the first president of the United States.", "George Washington");

console.log("Using Cloze, cloze, partial, then full");
// "George Washington"
console.log(firstPresidentCloze.cloze); 

// " ... was the first president of the United States.
console.log(firstPresidentCloze.getPartial()); 

// "George Washington was the first president of the United States.
console.log(firstPresidentCloze.getFull());

// Should throw or log an error because "oops" doesn't appear in "This doesn't work"
console.log("Now creating a new cloze with a cloze that doesn't appear in the card");
var brokenCloze = new ClozeCard("This doesn't work", "oops"); 
brokenCloze.getPartial();