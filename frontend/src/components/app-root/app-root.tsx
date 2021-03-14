import {Component, h, State} from "@stencil/core"

@Component({
	tag: "app-root",
	styleUrl: "app-root.css",
	shadow: false,
})
export class AppRoot {
	@State() playlist_names: Array<string> = []

	async componentWillLoad() {
		let result = await fetch("/playlists")
		this.playlist_names = await result.json()
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
							<stencil-route-link url="/page/profile/Anthony">
								Profile
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

				<main>
					<stencil-router>
						<stencil-route-switch scrollTopOffset={0}>
							<stencil-route url="/" component="page-home" exact={true} />
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

				<footer>
					<player-controls />
				</footer>
			</div>
		)
	}
}
