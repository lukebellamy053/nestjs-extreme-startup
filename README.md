## Extreme Startup
Credit to rchatley/extreme_startup for the original version of the game

This is a nextjs version of the extreme_startup game. The aim of the game is to build a web server that can respond to questions that get progressively more difficult as the game progresses.

The game consists of 8 rounds of questions, each round lasts 60 seconds and contains questions from the current and previous rounds
Each time you answer a question correctly, you receive 10 points, every incorrect answer deducts 2 points, every time you fail to respond to a question in time you lose 50 points.

The winner is the player with the highest score when the rounds are over.

The requests are send to your provided server location with path /api/answer?q={{question}} you are expected to return a 200 with your plaintext answer
