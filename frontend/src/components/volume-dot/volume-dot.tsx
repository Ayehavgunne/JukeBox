import {Component, Host, h, Element, Prop, Listen} from "@stencil/core"

@Component({
	tag: "volume-dot",
	styleUrl: "volume-dot.css",
	shadow: true,
})
export class VolumeDot {
	@Element() el: HTMLVolumeDotElement
	@Prop() volume: number
	@Prop() parent: HTMLDivElement
	@Prop() volume_handler: (volume: number) => void
	y_shift: number
	initial_y: number
	active = false

	@Listen("touchstart")
	@Listen("mousedown")
	async drag_start(e) {
		document.querySelector("body").classList.add("noselect")
		if (e.type === "touchstart") {
			this.initial_y = e.touches[0].clientY
		} else {
			this.initial_y = e.clientY
		}

		if (e.target === this.el) {
			this.active = true
		}
	}

	@Listen("touchend", {target: "body"})
	@Listen("mouseup", {target: "body"})
	async drag_end() {
		document.querySelector("body").classList.remove("noselect")
		this.initial_y = this.y_shift
		this.active = false
	}

	@Listen("touchmove", {target: "body"})
	@Listen("mousemove", {target: "body"})
	async drag(e) {
		if (this.active) {
			e.preventDefault()
			let parent_bounds = this.parent.getBoundingClientRect()
			let new_volume =
				(parent_bounds.height - (e.clientY - parent_bounds.top)) /
				parent_bounds.height
			if (new_volume >= 0 && new_volume <= 1) {
				this.volume_handler(new_volume)
				this.el.style.bottom = (new_volume * 100).toFixed(0) + "%"
			}
		}
	}

	render() {
		return (
			<Host>
				<div />
			</Host>
		)
	}
}
