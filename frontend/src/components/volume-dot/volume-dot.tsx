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
	active = false

	@Listen("touchstart")
	@Listen("mousedown")
	async drag_start(event) {
		document.querySelector("body").classList.add("noselect")
		document.documentElement.style.overflow = "hidden"

		if (event.target === this.el) {
			this.active = true
		}
	}

	@Listen("touchend", {target: "body"})
	@Listen("mouseup", {target: "body"})
	async drag_end() {
		document.querySelector("body").classList.remove("noselect")
		document.documentElement.style.overflow = "auto"
		this.active = false
	}

	@Listen("touchmove", {target: "body"})
	@Listen("mousemove", {target: "body"})
	async drag(event) {
		if (this.active) {
			event.preventDefault()
			let parent_bounds = this.parent.getBoundingClientRect()
			let new_volume, client_y
			if (event.type === "touchmove") {
				client_y = event.touches[0].clientY
			} else {
				client_y = event.clientY
			}
			new_volume =
				(parent_bounds.height - (client_y - parent_bounds.top)) /
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
