import {Component, Element, h, Host, State} from "@stencil/core"

@Component({
	tag: "app-root",
	styleUrl: "app-root.css",
	shadow: false,
})
export class AppRoot {
	@Element() el: HTMLElement
	@State() nav_showing: boolean = true
	playlist_names: Array<string> = []
	classes: string = ""

	constructor() {
		this.toggle_nav = this.toggle_nav.bind(this)
	}

	async componentWillLoad() {
		let result = await fetch("/playlists")
		this.playlist_names = await result.json()
	}

	async toggle_nav() {
		this.nav_showing = !this.nav_showing
	}

	render() {
		let classes = ""
		if (!this.nav_showing) {
			classes = "nav_closed"
		}

		return (
			<Host>
				<nav class={classes}>
					<header>
						<h1>JukeBox</h1>
					</header>

					<ul>
						<li>
							<stencil-route-link url="/">Home</stencil-route-link>
						</li>
						<li>
							<stencil-route-link url="/page/profile/Anthony">
								Profile
							</stencil-route-link>
						</li>
						<li>
							<stencil-route-link url="/page/now_playing">
								Now Playing
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
								<li>
									<stencil-route-link url="/page/genres">
										Genres
									</stencil-route-link>
								</li>
							</ul>
						</li>
						<li>
							<h3>Playlists</h3>

							<ul>
								{this.playlist_names.map(playlist_name => {
									return (
										<li>
											<stencil-route-link
												url={"/page/playlist/" + playlist_name}
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
							<stencil-route url="/page/tracks" component="page-tracks" />
							<stencil-route url="/page/albums" component="page-albums" />
							<stencil-route
								url="/page/artists"
								component="page-artists"
							/>
							<stencil-route url="/page/genres" component="page-genres" />
							<stencil-route
								url="/page/playlist/:name"
								component="page-playlist"
							/>
							<stencil-route
								url="/page/profile/:name"
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
