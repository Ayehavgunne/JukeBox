import {Components} from "../components"
import PlayerControls = Components.PlayerControls
import {UAParser} from "ua-parser-js"

export let get_player_controls = async (): Promise<PlayerControls> => {
	await customElements.whenDefined("player-controls")
	return document.querySelector("player-controls")
}

export let ua_parser = new UAParser(navigator.userAgent)

export let lazy_load = async (el: Element) => {
	let lazyloadImages
	if ("IntersectionObserver" in window) {
		lazyloadImages = el.shadowRoot.querySelectorAll(".lazy")
		let imageObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					// @ts-ignore
					let image: HTMLImageElement = entry.target
					image.src = image.dataset.src
					image.classList.remove("lazy")
					imageObserver.unobserve(image)
				}
			})
		})

		lazyloadImages.forEach(function (image) {
			imageObserver.observe(image)
		})
	} else {
		let lazyloadThrottleTimeout
		lazyloadImages = document.querySelectorAll(".lazy")

		let lazyload = () => {
			if (lazyloadThrottleTimeout) {
				clearTimeout(lazyloadThrottleTimeout)
			}

			lazyloadThrottleTimeout = setTimeout(function () {
				let scrollTop = window.pageYOffset
				lazyloadImages.forEach(function (img) {
					if (img.offsetTop < window.innerHeight + scrollTop) {
						img.src = img.dataset.src
						img.classList.remove("lazy")
					}
				})
				if (lazyloadImages.length == 0) {
					document.removeEventListener("scroll", lazyload)
					window.removeEventListener("resize", lazyload)
					window.removeEventListener("orientationChange", lazyload)
				}
			}, 20)
		}

		document.addEventListener("scroll", lazyload)
		window.addEventListener("resize", lazyload)
		window.addEventListener("orientationChange", lazyload)
	}
}
