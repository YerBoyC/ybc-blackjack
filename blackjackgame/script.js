// Game state and player information
let player = {
    name: '',
    chips: 100,
}

// Player and dealer hands
let cards = []
let dealerCards = []

// Hand totals
let dealerSum = 0
let sum = 0

// Betting state
let pot = 0
let playerBet = 0

// Round state flags
let hasBlackJack = false
let isAlive = false
let message = ""
let winner = ''

// Cached DOM elements for UI updates
let messageEl = document.getElementById("message-el")
let sumEl = document.getElementById("sum-el")
let cardsEl = document.getElementById("cards-el")
let playerEl = document.getElementById('player-el')
let dealerCardsEl = document.getElementById('dealercards-el')
let dealerSumEl = document.getElementById('dealersum-el')
let potEl = document.getElementById('pot-el')
let betInput = document.getElementById('bet-input')
let betControlsEl = document.getElementById('bet-controls')
let gameButtonsEl = document.getElementById('game-buttons')

// Refresh the displayed player name and chip count
function updatePlayerEl() {
    playerEl.textContent = (player.name || 'Player') + ': $' + player.chips
}

// Refresh the displayed pot amount
function updatePotEl() {
    potEl.textContent = 'Pot: $' + pot
}

// Show the bet input UI and hide action buttons
function showBetControls() {
    betControlsEl.style.display = 'block'
    gameButtonsEl.style.display = 'none'
}

// Show game action buttons after a bet is placed
function showGameButtons() {
    betControlsEl.style.display = 'none'
    gameButtonsEl.style.display = 'block'
}

// Initialize the game UI once the page has loaded
document.addEventListener('DOMContentLoaded', function() {
    const name = prompt('Please enter your name:')
    if (name && name.trim() !== '') {
        player.name = name.trim()
    }
    updatePlayerEl()
    updatePotEl()
    showBetControls()
})

// Returns a random card value for blackjack
// Face cards count as 10, Ace counts as 11 for simplicity
function getRandomCard() {
    let randomNumber = Math.floor(Math.random() * 13) + 1

    if (randomNumber > 11) {
        return 10
    } else if (randomNumber === 1) {
        return 11
    } else {
        return randomNumber
    }
}

// Begin a new round using the bet already placed
function startGame() {
    if (playerBet <= 0) {
        message = 'Please place a bet before starting the game.'
        messageEl.textContent = message
        return
    }

    isAlive = true
    hasBlackJack = false
    let firstCard = getRandomCard()
    let secondCard = getRandomCard()
    cards = [firstCard, secondCard]
    sum = firstCard + secondCard
    dealerCards = []
    dealerSum = 0
    dealerCardsEl.textContent = 'Cards: '
    dealerSumEl.textContent = 'Sum: '
    messageEl.textContent = ''
    renderGame()
}

// Show the player's current hand and decide whether the round continues
function renderGame() {
    cardsEl.textContent = "Cards: "

    for (let i = 0; i < cards.length; i++){
        cardsEl.textContent += cards[i] + ' '
    }

    sumEl.textContent = "Sum: " + sum
    if (sum <= 20) {
        message = "Do you want to draw a new card?"
    } else if (sum === 21) {
        message = "You've got Blackjack!"
        hasBlackJack = true
        dealersTurn()
    } else {
        message = "You went over 21!!"
        isAlive = false
        dealersTurn()
    }
    messageEl.textContent = message
}


// Draw another card for the player
function newCard() {
    if (!isAlive) {
        message = 'Start a game first before drawing another card.'
        messageEl.textContent = message
        return
    }

    if (hasBlackJack) {
        message = 'You already have Blackjack. Please start another game.'
        messageEl.textContent = message
        return
    }

    let card = getRandomCard()
    sum += card
    cards.push(card)
    renderGame()
}

// Dealer plays automatically and draws until reaching at least 17
function dealersTurn() {
    isAlive = false
    let dealerCardOne = getRandomCard()
    let dealerCardTwo = getRandomCard()
    dealerCards = [dealerCardOne, dealerCardTwo]
    dealerSum = dealerCardOne + dealerCardTwo
    messageEl.textContent = 'Dealer is playing...'

    while (dealerSum < 17) {
        let card = getRandomCard()
        dealerCards.push(card)
        dealerSum += card
    }

    dealerCardsEl.textContent = 'Cards: ' + dealerCards.join(' ')
    dealerSumEl.textContent = 'Sum: ' + dealerSum
    determineWinner()
}

// Decide who wins after the dealer finishes drawing cards
function determineWinner() {
    if ((dealerSum > sum && dealerSum <= 21) || (sum > 21)) {
        winner = 'dealer'
    } else if ((dealerSum < sum && sum <= 21) || (dealerSum > 21 && sum <= 21)) {
        winner = 'player'
    } else {
        winner = 'push'
    }

    givePrize(winner)
}

// Pay out the results of the round and reset betting UI
function givePrize(handWinner) {
    if (handWinner === 'dealer') {
        player.chips -= pot
        messageEl.textContent = 'Dealer wins. You lose the bet of $' + pot + '.'
    } else if (handWinner === 'player') {
        player.chips += pot
        messageEl.textContent = 'You win! You receive $' + pot + ' profit.'
    } else {
        messageEl.textContent = 'Push! Your bet of $' + pot + ' is returned.'
    }
    playerEl.textContent = (player.name || 'Player') + ': $' + player.chips
    pot = 0
    playerBet = 0
    updatePotEl()
    showBetControls()
}

// Handle the player placing a bet before the round begins
function placeBet() {
    if (isAlive) {
        message = 'Finish the current round before placing a new bet.'
        messageEl.textContent = message
        return
    }

    const betAmount = parseInt(betInput.value, 10)
    if (isNaN(betAmount) || betAmount < 1) {
        message = 'Enter a valid bet amount.'
        messageEl.textContent = message
        return
    }

    if (betAmount > player.chips) {
        message = 'You do not have enough chips for that bet.'
        messageEl.textContent = message
        return
    }

    playerBet = betAmount
    pot = playerBet
    updatePotEl()
    showGameButtons()
    message = 'Bet placed: $' + playerBet + '. Start the game.'
    messageEl.textContent = message
}