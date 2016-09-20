import React from 'react';
import { render } from 'react-dom';
import './app.less';
import Sort from 'react-sort';

var App = React.createClass({
    getInitialState() {
        return {
            data: '按住 并 拖拽 排序 press and drag to sort 0 1 2 3 4 5 6 7 8 9 10'.split(' ')
        };
    },
    sort(data) {
        this.setState({data});
    },
    render: function(){
        const { data } = this.state;

        return (
            <div>
                <Sort array={data} onSort={this.sort} items={data.map((item) => {
                    return <div onClick={() => alert(item)}>{item}</div>;
                })}/>
            </div>
        );
    }
});
render(<App/>, document.getElementById('app'));
