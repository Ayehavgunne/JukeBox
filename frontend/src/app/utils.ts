import {Track} from "./models"

export let print = (...args: any[]) => {
	console.log(...args)
}

export class BaseSortable {}

export function sort_mixin(BaseClass: {new (): BaseSortable}) {
	return class extends BaseClass {
		tracks: Track[]
		sorted_col: string = "sort_artist"

		sort(...columns: string[]) {
			const sorter = (a: Track, b: Track, index: number): number => {
				let ret_val = 1
				const col = columns[index] as keyof Track
				if (col === this.sorted_col) {
					ret_val = -1
				}
				if (a[col] > b[col]) {
					return ret_val
				} else if (a[col] < b[col]) {
					return -ret_val
				} else {
					if (index + 1 < columns.length) {
						return sorter(a, b, index + 1)
					} else {
						return 0
					}
				}
			}
			let result = this.tracks.sort((a, b) => {
				return sorter(a, b, 0)
			})
			this.tracks = [...result]
			if (columns[0] !== this.sorted_col) {
				this.sorted_col = columns[0]
			} else {
				this.sorted_col = ""
			}
		}
	}
}
