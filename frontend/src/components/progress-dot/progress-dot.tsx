import {Component, Element, h, Host, Prop, Watch} from "@stencil/core"

@Component({
	tag: "progress-dot",
	styleUrl: "progress-dot.css",
	shadow: true,
})
export class ProgressDot {
	@Element() el: HTMLProgressDotElement
	@Prop({mutable: true}) progress: number
	// @Prop() parent: HTMLProgressBarElement
	// current_x: number
	// initial_x: number
	active = false
	//
	// @Listen("touchstart")
	// @Listen("mousedown")
	// async drag_start(e) {
	// 	if (e.type === "touchstart") {
	// 		this.initial_x = e.touches[0].clientX
	// 	} else {
	// 		this.initial_x = e.clientX
	// 	}
	//
	// 	if (e.target === this.el) {
	// 		this.active = true
	// 	}
	// }
	//
	// @Listen("touchend", {target: "body"})
	// @Listen("mouseup", {target: "body"})
	// async drag_end() {
	// 	this.initial_x = this.current_x
	//
	// 	this.active = false
	// }
	//
	// @Listen("touchmove", {target: "body"})
	// @Listen("mousemove", {target: "body"})
	// async drag(e) {
	// 	if (this.active) {
	// 		e.preventDefault()
	//
	// 		if (e.type === "touchmove") {
	// 			this.current_x = e.touches[0].clientX - this.initial_x
	// 		} else {
	// 			this.current_x = e.clientX - this.initial_x
	// 		}
	//
	// 		// this.x_offset = this.current_x
	//
	// 		this.set_translate(this.current_x)
	// 	}
	// }
	//
	// set_translate = xPos => {
	// 	let parent_bounds = this.parent.getBoundingClientRect()
	// 	let pos = (xPos / parent_bounds.width) * 100
	// 	if (pos < 0 || pos > 100) {
	// 		return
	// 	}
	// 	if (this.progress) {
	// 		pos = pos + this.progress
	// 	}
	// 	console.log(pos, this.progress)
	// 	this.el.style.left = pos.toFixed(2) + "%"
	// }

	@Watch("progress")
	async position_handler() {
		if (!this.active) {
			this.el.style.left = this.progress.toFixed(2) + "%"
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
