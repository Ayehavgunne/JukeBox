import {Component, Host, h} from '@stencil/core';

@Component({
    tag: 'app-artists',
    styleUrl: 'app-artists.css',
    shadow: true,
})
export class AppArtists {

    render() {
        return (
            <Host>
                <slot></slot>
            </Host>
        );
    }

}
