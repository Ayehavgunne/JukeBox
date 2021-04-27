import {NgModule} from "@angular/core"
import {RouterModule, Routes} from "@angular/router"
import {TracksComponent} from "./pages/tracks/tracks.component"
import {AlbumsComponent} from "./pages/albums/albums.component"
import {ArtistsComponent} from "./pages/artists/artists.component"
import {NowPlayingComponent} from "./pages/now-playing/now-playing.component"
import {SettingsComponent} from "./pages/settings/settings.component"
import {ProfileComponent} from "./pages/profile/profile.component"
import {PlaylistsComponent} from "./pages/playlists/playlists.component"
import {HomeComponent} from "./pages/home/home.component"

const routes: Routes = [
	{
		path: "",
		component: HomeComponent,
	},
	{
		path: "page/tracks/:track",
		component: TracksComponent,
	},
	{
		path: "page/tracks",
		component: TracksComponent,
	},
	{
		path: "page/albums/:album",
		component: AlbumsComponent,
	},
	{
		path: "page/albums",
		component: AlbumsComponent,
	},
	{
		path: "page/artists/:artist",
		component: ArtistsComponent,
	},
	{
		path: "page/artists",
		component: ArtistsComponent,
	},
	{
		path: "page/playlist/:name",
		component: PlaylistsComponent,
	},
	{
		path: "page/now_playing",
		component: NowPlayingComponent,
	},
	{
		path: "page/settings",
		component: SettingsComponent,
	},
	{
		path: "page/profile",
		component: ProfileComponent,
	},
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
