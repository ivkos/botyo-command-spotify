import { CommandModule, Message } from "botyo-api";

const Spotify = require('spotify-web-api-node');

export default class SpotifyCommand extends CommandModule
{
    private readonly market: string;
    private readonly spotify: any;
    private readonly authPromise: Promise<void>;
    private tokenExpiryTimestamp: number;

    constructor()
    {
        super();

        this.market = this.getRuntime().getConfiguration().getProperty<string>("market");

        this.spotify = new Spotify({
            clientId: this.getRuntime().getConfiguration().getProperty<string>("clientId"),
            clientSecret: this.getRuntime().getConfiguration().getProperty<string>("clientSecret")
        });

        this.authPromise = this.authenticateSpotify();
    }

    getCommand(): string
    {
        return "spotify";
    }

    getDescription(): string
    {
        return "Posts a Spotify song in the chat";
    }

    getUsage(): string
    {
        return "<track>";
    }

    validate(msg: Message, args: string): boolean
    {
        return args.length > 0;
    }

    async execute(msg: Message, args: string): Promise<any>
    {
        await this.authPromise;
        await this.refreshSpotifyToken();

        const data = await this.spotify.searchTracks(args, { market: this.market, limit: 1 });

        if (!data.body || !data.body.tracks || !data.body.tracks.items) {
            throw new Error("Could not parse Spotify response");
        }

        if (data.body.tracks.items.length === 0) {
            return this.getRuntime().getChatApi().sendMessage(msg.threadID, "Sorry, I couldn't find this track. :/");
        }

        const track = data.body.tracks.items[0];
        const trackUrl = track.external_urls.spotify;
        const artists = track.artists.map((a: any) => a.name).join(", ");

        const response = `\u{1F3B5} ${track.name} by ${artists}\n` +
            `\u{1F517} Play now: ${trackUrl}`;

        return this.getRuntime().getChatApi().sendMessage(msg.threadID, {
            url: trackUrl,
            body: response
        });
    }

    private async authenticateSpotify(): Promise<void>
    {
        const logger = this.getRuntime().getLogger();

        return this.spotify.clientCredentialsGrant()
            .then((data: any) => {
                // Save the access token so that it's used in future calls
                const accessToken = data.body['access_token'];
                const refreshToken = data.body['refresh_token'];
                const tokenExpiresIn = data.body['expires_in'];

                this.spotify.setAccessToken(accessToken);
                this.spotify.setRefreshToken(refreshToken);
                this.tokenExpiryTimestamp = Date.now() + tokenExpiresIn * 1000;

                logger.verbose(`The access token expires in ${tokenExpiresIn}`);
                logger.verbose(`The access token is ${accessToken}`);
                logger.verbose(`The refresh token is ${refreshToken}`);
            })
            .catch((err: any) => {
                logger.error('Something went wrong when retrieving an access token', err);
            });
    }

    private async refreshSpotifyToken(): Promise<void>
    {
        const logger = this.getRuntime().getLogger();

        if (Date.now() < this.tokenExpiryTimestamp) {
            return;
        }

        try {
            const data = await this.spotify.refreshAccessToken();
            this.spotify.setAccessToken(data.body['access_token']);
        } catch (err) {
            logger.warn('Could not refresh access token. Will try to re-authenticate...', err);
            return this.authenticateSpotify();
        }

        logger.verbose('The access token has been refreshed!');
    }
}