import {NgModule} from "@angular/core"
import {BrowserModule} from "@angular/platform-browser"
import {DatePipe} from "@angular/common"
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http"

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
import {VolumeDotComponent} from "./components/volume-dot/volume-dot.component"
import {ProgressDotComponent} from "./components/progress-dot/progress-dot.component"
import {LoadOverlayComponent} from "./components/load-overlay/load-overlay.component"
import {LoadingInterceptor} from "./interceptors/loading"
import {PopupMenuComponent} from "./components/popup-menu/popup-menu.component"
import {PopupMenuItemComponent} from "./components/popup-menu-item/popup-menu-item.component"
import {ScrollingModule} from "@angular/cdk/scrolling"
import {TrackTableComponent} from "./components/track-table/track-table.component"
import {KeepHtmlPipe} from "./pipes/keep-html.pipe"

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
		LoadOverlayComponent,
		PopupMenuComponent,
		PopupMenuItemComponent,
		TrackTableComponent,
		KeepHtmlPipe,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		FormsModule,
		ScrollingModule,
	],
	providers: [
		{provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true},
		DatePipe,
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
