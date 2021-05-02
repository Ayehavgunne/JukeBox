import {Component, OnInit, ViewChild} from "@angular/core"
import {PlayerService} from "../../services/player.service"
import {print} from "../../utils"

@Component({
	selector: "track-stats",
	templateUrl: "./track-stats.component.html",
	styleUrls: ["./track-stats.component.sass"],
})
export class TrackStatsComponent implements OnInit {
	@ViewChild("title_div") title_div: HTMLDivElement
	@ViewChild("artist_div") artist_div: HTMLDivElement
	title: string
	artist: string
	title_slide: boolean = false
	title_anim_duration: string
	title_anim_width: string
	artist_slide: boolean = false
	artist_anim_duration: string
	artist_anim_width: string

	constructor(public player_service: PlayerService) {}

	ngOnInit(): void {
		// print("On Init!")
		this.title = this.player_service.current_track?.title || ""
		this.artist = this.player_service.current_track?.artist || ""
	}

	ngAfterViewInit(): void {
		// print("After Init!")
		this.check_slide()
	}

	ngOnChanges(): void {
		// print("changed!")
		this.clear_slide()
	}

	check_slide = () => {
		print("check_slide")
		if (this.is_overflowing(this.title_div)) {
			this.title_slide = true
			this.title_anim_duration = this.title_div.scrollWidth / 30 + "s"
			this.title_anim_width =
				this.title_div.scrollWidth - this.title_div.offsetWidth + "px"
		}
		if (this.is_overflowing(this.artist_div)) {
			this.artist_slide = true
			this.artist_anim_duration = this.artist_div.scrollWidth / 30 + "s"
			this.artist_anim_width =
				this.artist_div.scrollWidth - this.artist_div.offsetWidth + "px"
		}
	}

	clear_slide = () => {
		print("clear_slide")
		this.title_slide = false
		this.title_anim_width = ""
		this.artist_slide = false
		this.artist_anim_width = ""
	}

	done_animating = () => {
		print("done_animating")
		this.clear_slide()
		this.check_slide()
	}

	is_overflowing = (element: HTMLDivElement): boolean => {
		if (element) {
			return element.offsetWidth < element.scrollWidth
		}
		return false
	}
}
