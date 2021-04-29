import {NgModule} from "@angular/core"
import {BrowserModule} from "@angular/platform-browser"
import {HttpClientModule} from "@angular/common/http"

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
import {UserComponent} from "./svgs/user/user.component"
import {MusicComponent} from "./svgs/music/music.component"
import {DiscComponent} from "./svgs/disc/disc.component"
import {ModalComponent} from "./components/modal/modal.component"
import {HomeComponent} from "./pages/home/home.component"
import {FormsModule} from "@angular/forms"
import {PlayComponent} from "./components/play/play.component"
import {TrackStatsComponent} from "./components/track-stats/track-stats.component"
import {ProgressBarComponent} from "./components/progress-bar/progress-bar.component"
import {VolumeDotComponent} from "./components/volume-dot/volume-dot.component";
import { ProgressDotComponent } from './components/progress-dot/progress-dot.component'

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
		UserComponent,
		MusicComponent,
		DiscComponent,
		ModalComponent,
		HomeComponent,
		PlayComponent,
		TrackStatsComponent,
		ProgressBarComponent,
		VolumeDotComponent,
  ProgressDotComponent,
	],
	imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
