import {Component, Host, h, Listen} from "@stencil/core"
import store from "../../global/store"

@Component({
	tag: "track-stats",
	styleUrl: "track-stats.css",
})
export class TrackStats {
	title_div: HTMLDivElement
	artist_div: HTMLDivElement

	async componentDidRender() {
		await this.check_slide()
	}

	async componentWillUpdate() {
		await this.clear_slide()
	}

	check_slide = async () => {
		if (this.is_overflowing(this.title_div)) {
			this.scroll_info(this.title_div)
		}
		if (this.is_overflowing(this.artist_div)) {
			this.scroll_info(this.artist_div)
		}
	}

	clear_slide = async () => {
		try {
			this.title_div.classList.remove("slide")
			this.title_div.style.width = ""
			this.artist_div.classList.remove("slide")
			this.artist_div.style.width = ""
		} catch {
			// Ignore
		}
	}

	@Listen("transitionend", {target: "body"})
	async done_animating() {
		await this.clear_slide()
		await this.check_slide()
	}

	scroll_info = (element: HTMLDivElement) => {
		element.classList.add("slide")
		element.style.animationDuration = element.scrollWidth / 30 + "s"
		element.style.width = element.scrollWidth - element.offsetWidth + "px"
	}

	is_overflowing = (element: HTMLDivElement) => {
		if (element) {
			return element.offsetWidth < element.scrollWidth
		}
	}

	render() {
		if (store.current_track.track_id) {
			return (
				<Host class="track_stats_host">
					<div class="track_wrapper">
						<div
							class="slider"
							ref={el => (this.title_div = el as HTMLDivElement)}
						>
							{store.current_track.title}
						</div>
					</div>
					<div class="track_wrapper small">
						<div
							class="slider"
							ref={el => (this.artist_div = el as HTMLDivElement)}
						>
							{store.current_track.artist}
						</div>
					</div>
				</Host>
			)
		}
	}
}
