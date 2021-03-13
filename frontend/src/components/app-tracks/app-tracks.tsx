import {Component, Host, h} from '@stencil/core';

@Component({
    tag: 'app-tracks',
    styleUrl: 'app-tracks.css',
    shadow: true,
})
export class AppTracks {

    render() {
        return (
            <Host>
                <slot></slot>
            </Host>
        );
    }

}
