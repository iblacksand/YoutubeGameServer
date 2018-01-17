# Youtube Game Server

This is the backend for a server for 'The Youtube Game'.

One player chooses a song clip from YouTube. The other players have to guess the song, but it is played in reverse.

It uses Heroku with Node, Sox and FFmpeg buildpacks.
## Install

To install the script run:

```bash
npm install
```

## Testing

To test the server, [FFmpeg](https://www.ffmpeg.org/) and [Sox](http://sox.sourceforge.net/) must be installed.

To run the server run

```bash
npm start
```

This will host the server at `localhost:3000`

You can be host by visiting `localhost:3000/host.html` and be a player by joining at `localhost:3000/Player.html`

