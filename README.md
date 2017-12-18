# Spotify Command for Botyo
[![npm](https://img.shields.io/npm/v/botyo-command-spotify.svg)](https://www.npmjs.com/package/botyo-command-spotify)
[![npm](https://img.shields.io/npm/dt/botyo-command-spotify.svg)](https://www.npmjs.com/package/botyo-command-spotify)
[![npm](https://img.shields.io/npm/l/botyo-command-spotify.svg)]()

The **Spotify Command for [Botyo](https://github.com/ivkos/botyo)** posts a Spotify song to the chat.

## Usage
`#spotify <track>`

For example:
- `#spotify Don't Let Me Down`
- `#spotify Tyga - Dope` - you can optionally include the artist for a more relevant result

## Requirements
You need to register your application on the Spotify Developer website, as described in the [Web API Tutorial](https://developer.spotify.com/web-api/tutorial/) in order to obtain a client ID and secret. These need to be set in the module configuration, as shown in the example below.

## Install
**Step 1.** Install the module from npm.

`npm install --save botyo-command-spotify`

**Step 2.** Register the module.
```typescript
import Botyo from "botyo";
import SpotifyCommand from "botyo-command-spotify"

Botyo.builder()
    ...
    .registerModule(SpotifyCommand)
    ...
    .build()
    .start();
```

## Configuration
```yaml
modules:
  SpotifyCommand:
    market: US   # An ISO 3166-1 alpha-2 country code. Only tracks playable in that market will be returned.
    clientId: YOUR_CLIENT_ID
    clientSecret: YOUR_CLIENT_SECRET
```