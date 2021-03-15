import {Component, Host, h, Prop} from "@stencil/core"
import {Track} from "../../global/models"

@Component({
	tag: "track-stats",
	styleUrl: "track-stats.css",
	shadow: true,
})
export class TrackStats {
	@Prop() track: Track
	title_div: HTMLDivElement
	artist_div: HTMLDivElement

	componentDidRender() {
		if (this.is_overflowing(this.title_div)) {
			this.scroll_info(this.title_div)
		}
		if (this.is_overflowing(this.artist_div)) {
			this.scroll_info(this.artist_div)
		}
	}

	componentWillUpdate() {
		try {
			this.title_div.classList.remove("slide")
			this.title_div.style.width = ""
			this.artist_div.classList.remove("slide")
			this.artist_div.style.width = ""
		} catch {
			// Ignore
		}
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
		if (this.track) {
			return (
				<Host>
					<div class="wrapper">
						<div
							class="slider"
							ref={el => (this.title_div = el as HTMLDivElement)}
						>
							{this.track.title}
						</div>
					</div>
					<div class="wrapper small">
						<div
							class="slider"
							ref={el => (this.artist_div = el as HTMLDivElement)}
						>
							{this.track.artist}
						</div>
					</div>
				</Host>
			)
		}
	}
}
