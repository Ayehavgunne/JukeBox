import {NgModule} from "@angular/core"
import {BrowserModule} from "@angular/platform-browser"

import {AppRoutingModule} from "./app-routing.module"
import {AppComponent} from "./app.component"
import {TracksComponent} from "./pages/tracks/tracks.component"
import {ArtistsComponent} from "./pages/artists/artists.component"
import {AlbumsComponent} from "./pages/albums/albums.component"
import {PlaylistsComponent} from "./pages/playlists/playlists.component"
import {NowPlayingComponent} from "./pages/now-playing/now-playing.component"
import {SettingsComponent} from "./pages/settings/settings.component"
import {ProfileComponent} from "./pages/profile/profile.component"
import {PlayerComponent} from "./components/player/player.component"

@NgModule({
	declarations: [
		AppComponent,
		TracksComponent,
		ArtistsComponent,
		AlbumsComponent,
		PlaylistsComponent,
		NowPlayingComponent,
		SettingsComponent,
		ProfileComponent,
		PlayerComponent,
	],
	imports: [BrowserModule, AppRoutingModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
