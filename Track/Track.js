
import React from 'react';

import './Track.css';

export class Track extends React.Component {

    constructor(props) {
        super(props);
        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
    }

    removeTrack() {
        //console.log("track::removeTrack");
        this.props.onRemove(this.props.track);
    }

    addTrack() {
        //console.log("track::addTrack");
        this.props.onAdd(this.props.track);
    }
    
    renderAction() {
        return(
            (this.props.isRemoval) ? '-' : '+'
        );
    }

    render() {
        return(
            <div className="Track">
                <div className="Track-information">
                    <h3>{this.props.track.name}</h3>
                    <p>{this.props.track.artist} | {this.props.track.album}</p>
                </div>
                <a className="Track-action" onClick={(this.renderAction() === '+') ? this.addTrack : this.removeTrack}>{this.renderAction()}</a>
            </div>
        );
    };
};
