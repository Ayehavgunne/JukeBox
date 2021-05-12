import {Component, ElementRef, OnInit, ViewChild} from "@angular/core"
import {PlayerService} from "../../services/player.service"
import {Track} from "../../models"

@Component({
	selector: "track-stats",
	templateUrl: "./track-stats.component.html",
	styleUrls: ["./track-stats.component.sass"],
})
export class TrackStatsComponent implements OnInit {
	@ViewChild("title_div") title_div: ElementRef<HTMLDivElement>
	@ViewChild("title_slider") title_slider: ElementRef<HTMLDivElement>
	@ViewChild("artist_div") artist_div: ElementRef<HTMLDivElement>
	@ViewChild("artist_slider") artist_slider: ElementRef<HTMLDivElement>
	track: Track
	title_slide: boolean = false
	title_anim_duration: string
	title_anim_width: string
	artist_slide: boolean = false
	artist_anim_duration: string
	artist_anim_width: string

	constructor(public player_service: PlayerService) {}

	ngOnInit(): void {}

	ngAfterViewInit(): void {
		this.player_service.watch_track().subscribe(track => {
			this.track = track
			this.clear_slide()
			this.check_slide()
		})
	}

	check_slide = () => {
		setTimeout(() => {
			if (this.is_overflowing(this.title_div)) {
				this.title_slide = true
				this.title_anim_duration =
					this.title_div.nativeElement.scrollWidth / 30 + "s"
				this.title_anim_width =
					this.title_div.nativeElement.scrollWidth -
					this.title_div.nativeElement.offsetWidth +
					"px"
			}
			if (this.is_overflowing(this.artist_div)) {
				this.artist_slide = true
				this.artist_anim_duration =
					this.artist_div.nativeElement.scrollWidth / 30 + "s"
				this.artist_anim_width =
					this.artist_div.nativeElement.scrollWidth -
					this.artist_div.nativeElement.offsetWidth +
					"px"
			}
		}, 100)
	}

	clear_slide = () => {
		this.title_slide = false
		this.title_anim_width = ""
		this.artist_slide = false
		this.artist_anim_width = ""
	}

	is_overflowing = (element: ElementRef): boolean => {
		if (element) {
			return element.nativeElement.offsetWidth < element.nativeElement.scrollWidth
		}
		return false
	}
}
