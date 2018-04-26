import React from 'react';

import './SearchBar.css';

export class SearchBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {term: null};
        this.search = this.search.bind(this);
        this.handleTermChange = this.handleTermChange.bind(this);
    }

    handleTermChange(e) {
        //console.log("SearchBar::handleTermChange");
        this.setState({term: e.target.value});
    }

    search() {
        //console.log("SearchBar::search " + this.state.term);
        this.props.onSearch(this.state.term);
    }

    render() {
        return(
            <div className="SearchBar">
            <input placeholder="Enter A Song, Album, or Artist" onChange={this.handleTermChange}/>
            <a onClick={this.search}>SEARCH</a>
            </div>
        );
    };
};