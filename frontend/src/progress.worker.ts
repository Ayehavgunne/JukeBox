const ctx: Worker = self as any
let progress_interval

ctx.addEventListener(
	"message",
	function (event) {
		let message = event.data
		if (message === "start_progress") {
			progress_interval = setInterval(function () {
				ctx.postMessage("tick")
			}, 50)
		} else if (message === "stop_progress") {
			clearInterval(progress_interval)
		}
	},
	false,
)
