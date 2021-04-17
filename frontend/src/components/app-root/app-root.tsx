import {Component, Element, h, Host, State} from "@stencil/core"
import {print} from "../../global/app"
import {User} from "../../global/models"
import state from "../../global/store"
import Cookies from "js-cookie"

@Component({
	tag: "app-root",
	styleUrl: "app-root.css",
})
export class AppRoot {
	@Element() el: HTMLElement
	@State() nav_showing = true
	@State() show_modal = true

	async componentWillLoad() {
		let user_cookie = Cookies.get("jukebox-user")
		let user: User
		if (user_cookie !== undefined) {
			user = JSON.parse(user_cookie)
			state.user = user
			let result = await fetch(`/playlists/${state.user.user_id}`)
			state.playlist_names = await result.json()
			this.show_modal = false
		}
	}

	toggle_nav = async () => {
		this.nav_showing = !this.nav_showing
	}

	get_username = async username => {
		let response = await fetch(`/users/${username}`)
		let result = await response.json()
		if (result["error"]) {
			print(result["error"])
			return
		}
		let user = {
			user_id: result["user_id"],
			username: result["username"],
		}
		Cookies.set("jukebox-user", JSON.stringify(user))
		state.user = user
		result = await fetch(`/playlists/${state.user.user_id}`)
		state.playlist_names = await result.json()
		this.show_modal = false
	}

	render() {
		let classes = ""
		if (!this.nav_showing) {
			classes = "nav_closed"
		}

		return (
			<Host class="app_root_host">
				{this.show_modal && (
					<modal-prompt
						header="What is your name?"
						close={this.get_username}
					/>
				)}
				<nav class={classes}>
					<header>
						<h1>JukeBox</h1>
					</header>
					<ul>
						<li>
							<stencil-route-link url="/">Home</stencil-route-link>
						</li>
						<li>
							<stencil-route-link
								url={`/page/profile/${state.user.username}`}
							>
								Profile
							</stencil-route-link>
						</li>
						<li>
							<stencil-route-link url="/page/now_playing">
								Now Playing
							</stencil-route-link>
						</li>
						<li>
							<stencil-route-link url="/page/settings">
								Settings
							</stencil-route-link>
						</li>
						<li>
							<h3>Library</h3>
							<ul>
								<li>
									<stencil-route-link url="/page/tracks">
										Tracks
									</stencil-route-link>
								</li>
								<li>
									<stencil-route-link url="/page/albums">
										Albums
									</stencil-route-link>
								</li>
								<li>
									<stencil-route-link url="/page/artists">
										Artists
									</stencil-route-link>
								</li>
								{/*<li>*/}
								{/*	<stencil-route-link url="/page/genres">*/}
								{/*		Genres*/}
								{/*	</stencil-route-link>*/}
								{/*</li>*/}
							</ul>
						</li>
						<li>
							<h3>Playlists</h3>
							<ul>
								{state.playlist_names.map(playlist_name => {
									return (
										<li key={playlist_name}>
											<stencil-route-link
												url={`/page/playlist/${playlist_name}`}
											>
												{playlist_name}
											</stencil-route-link>
										</li>
									)
								})}
							</ul>
						</li>
					</ul>
				</nav>
				<main class={classes}>
					<stencil-router>
						<stencil-route-switch scrollTopOffset={0}>
							<stencil-route url="/" component="page-home" exact={true} />
							<stencil-route
								url="/page/now_playing"
								component="page-now-playing"
							/>
							<stencil-route
								url="/page/settings"
								component="page-settings"
							/>
							<stencil-route
								url="/page/tracks/:album_id?"
								component="page-tracks"
							/>
							<stencil-route
								url="/page/albums/:artist_id?"
								component="page-albums"
							/>
							<stencil-route
								url="/page/artists/:artist_id?"
								component="page-artists"
							/>
							{/*<stencil-route*/}
							{/*	url="/page/genres/:name?"*/}
							{/*	component="page-genres"*/}
							{/*/>*/}
							<stencil-route
								url="/page/playlist/:name?"
								component="page-playlist"
							/>
							<stencil-route
								url="/page/profile/:name?"
								component="page-profile"
							/>
						</stencil-route-switch>
					</stencil-router>
				</main>
				<footer class={classes}>
					<menu-toggle
						class={classes}
						showing={this.nav_showing}
						toggling={this.toggle_nav}
					/>
					<player-controls />
				</footer>
			</Host>
		)
	}
}
