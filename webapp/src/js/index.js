function selectNewSentence(){
    document
    .querySelector('.wrapper-sentence p')
    .innerHTML=styleSentence(getRandomSentence())

}

function getRandomSentence(){
    const sentences = [
        'Lorem ipsum doloret sit #amet #consecetuer est!',
        'Almost before we knew it, we had left the #ground.'
    ],
    sentencesLength=sentences.length
    return sentences[(Math.floor(Math.random()*sentencesLength))]
}

function styleSentence(sentence){
    const match= sentence.match(/(#[\w\|]+)/g)

    if(match){
        match.forEach(element => {
            sentence = sentence.replace(element,'<a href="#" class="color-important">'+element+'</a>')
        });
    }
    
    return sentence 
}