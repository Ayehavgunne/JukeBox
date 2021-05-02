import {Injectable} from "@angular/core"
import {HttpClient} from "@angular/common/http"
import {Track} from "../models"
import {Observable} from "rxjs"

@Injectable({
	providedIn: "root",
})
export class TracksService {
	constructor(private http: HttpClient) {}

	get_tracks(track_id?: number): Observable<Track[]> {
		let url: string = "/tracks"
		if (track_id) {
			return this.http.get<Track[]>(`${url}/${track_id}`)
		}
		return this.http.get<Track[]>(url)
	}

	change_track_love(track_id: number, is_loved: boolean): Observable<string> {
		let url: string = "/love/tracks"
		if (is_loved) {
			return this.http.put(url, "", {responseType: "text"})
		} else {
			return this.http.delete(url, {responseType: "text"})
		}
	}
}
