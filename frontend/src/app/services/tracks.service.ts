import {Injectable} from "@angular/core"
import {HttpClient} from "@angular/common/http"
import {Track} from "../models"
import {Observable} from "rxjs"

@Injectable({
	providedIn: "root",
})
export class TracksService {
	url: string = "/tracks"

	constructor(private http: HttpClient) {}

	get_tracks(track_id?: number): Observable<Track[]> {
		if (track_id) {
			return this.http.get<Track[]>(`${this.url}/${track_id}`)
		}
		return this.http.get<Track[]>(this.url)
	}

	// get_track_image(track_id: number): Observable<any> {
	// 	return this.http.get<any>(`${this.url}/${track_id}/image`)
	// }

	// get_track_file(track_id: number, start?: number, end?: number): Observable<any> {
	// 	if (start && (end === undefined || end === null)) {
	// 		return this.http.get<any>(`/get/${track_id}/${start}`)
	// 	} else if (start && end) {
	// 		return this.http.get<any>(`/get/${track_id}/${start}/${end}`)
	// 	}
	// 	return this.http.get<any>(`/get/${track_id}`)
	// }
}
