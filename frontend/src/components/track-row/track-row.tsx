import {Component, Host, h} from '@stencil/core';

@Component({
    tag: 'track-row',
    styleUrl: 'track-row.css',
    shadow: true,
})
export class TrackRow {

    render() {
        return (
            <Host>
                <slot></slot>
            </Host>
        );
    }

}
