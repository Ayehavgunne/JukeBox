import {Component, h, State} from '@stencil/core';

@Component({
    tag: 'app-root',
    styleUrl: 'app-root.css',
    shadow: true,
})
export class AppRoot {
    @State() playlist_names: Array<string> = []

    componentWillLoad() {
        return fetch('/playlists').then(response => {
            return response.json()
        }).then(names => {
            this.playlist_names = names
        })
    }

    render() {
        return (
            <div class="container">
                <nav>
                    <header>
                        <h1>JukeBox</h1>
                    </header>

                    <ul>
                        <li>
                            <stencil-route-link url="/">Home</stencil-route-link>
                        </li>
                        <li>
                            <stencil-route-link url="/profile_page/Anthony">Profile</stencil-route-link>
                        </li>
                        <li>
                            <h3>Library</h3>

                            <ul>
                                <li>
                                    <stencil-route-link url="/tracks_page">Tracks</stencil-route-link>
                                </li>
                                <li>
                                    <stencil-route-link url="/albums_page">Albums</stencil-route-link>
                                </li>
                                <li>
                                    <stencil-route-link url="/artists_page">Artists</stencil-route-link>
                                </li>
                                <li>
                                    <stencil-route-link url="/genres_page">Genres</stencil-route-link>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <h3>Playlists</h3>

                            <ul>
                                {this.playlist_names.map(playlist_name => {
                                    return <li>
                                        <stencil-route-link
                                            url={"/playlist_page/" + playlist_name}>
                                            {playlist_name}
                                        </stencil-route-link>
                                    </li>
                                })}
                            </ul>
                        </li>
                    </ul>
                </nav>

                <main>
                    <stencil-router>
                        <stencil-route-switch scrollTopOffset={0}>
                            <stencil-route url="/" component="app-home" exact={true}/>
                            <stencil-route url="/tracks_page" component="app-tracks"/>
                            <stencil-route url="/albums_page" component="app-albums"/>
                            <stencil-route url="/artists_page" component="app-artists"/>
                            <stencil-route url="/genres_page" component="app-genres"/>
                            <stencil-route url="/playlist_page/:name" component="app-playlist"/>
                            <stencil-route url="/profile_page/:name" component="app-profile"/>
                        </stencil-route-switch>
                    </stencil-router>
                </main>

                <footer>
                    <player-controls/>
                </footer>
            </div>
        );
    }
}
