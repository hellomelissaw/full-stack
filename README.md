# TL;DR of our report:

We have created a basic game inspired by old school, text-based RPG’s, playable in a browser. It is played as a _choose-your-own-adventure_ story with possibility for user interaction, such as light combat. It is meant as a demo to what a more extensive game could be. You get dropped at the entrance of a forest. Click 'explore' to discover new locations at every move and click 'fight' to up your XP when monsters appear.

## Get started
1. Log into the server using the credentials given in the report.

2. Navigate to the folder given in the report.

3. Start the application using the command `node nodeapp`

4. In your browser, navigate to the address and port given in the report and log in or create an account

## What's in the box
An account has already been made if you just wish to try the game: username: `Blossom` and password: `password`
Two players have been set up: _Bubbles_ is ready to start from the beginning and _Buttercup_ has some game play already performed, and has leveled up once.

## Winning and losing
Instead of a clear winning system, we decided to go for leveling up when you reach a certain XP, allowing for the story to go on undefinitely as long as there'd be a player base. If you'd like to see the 'level up' mechanic, start a new game (or use Bubbles), go to forest > graveyard and fight. Then go to graveyard > town > city > tea show and fight again. The explore button must be pressed to discover these. 

_Addendum:_ In the submitted report, it was noted that the Secure attribute is set on the session cookie to ensure it is transmitted only over HTTPS. While this reflects best practice, we did not end up configuring HTTPS support in the current local development after all.

Despite omitting the Secure flag to facilitate testing, we are aware of the security implications in terms of production-ready applications.
